import { EpisodeModel, AuthorModel } from '../models'
import { Episode } from '../models/Episode'
import { Podcast, PodcastModel } from '../models/Podcast'
import slugify from 'slugify'
import { Entity, EntityModel } from '../models/Entity'
import { uniq } from 'ramda'
import { CategoryModel } from '../models/Category'
import chalk from 'chalk'
import { DocumentType } from '@typegoose/typegoose'
import { Author } from '../models/Author'

type PodcastObject = { [Property in keyof Omit<Podcast, '_id'>]: Podcast[Property] }
export type PodcastModelInput = {
    podcastObject: PodcastObject
    entitiesInput: EntitiesInput
    categoriesInput: Categories
    authorInput: PodcastAuthorInput
}
type PodcastAuthorInput = { name?: string; email?: string }
type EpisodeObject = { [Property in keyof Omit<Episode, '_id'>]: Episode[Property] }
export type EpisodeModelInput = { episodeObject: EpisodeObject; entitiesInput: EntitiesInput; authorInput: PodcastAuthorInput }

export type EntitiesInput = { [index: string]: string[] }
type Categories = string[]

export async function registerEpisode(episodeData: EpisodeObject) {
    let episode = await EpisodeModel.findOne({ slug: episodeData.slug })
    if (!episode) {
        episode = new EpisodeModel({
            ...episodeData,
        })
        await episode.save()
    }
    return episode
}

export async function registerPodcastAuthor(author: PodcastAuthorInput) {
    if (!author) return null
    let podcastAuthor: DocumentType<Author>
    let slug = (author?.name && slugify(author.name)) ?? (author?.email && slugify(author.email))

    if (author?.name) podcastAuthor = await AuthorModel.findOne({ name: author?.name })
    if (!podcastAuthor && author?.email) podcastAuthor = await AuthorModel.findOne({ email: author?.email })
    if (!podcastAuthor) {
        if (!!author.name || !!author.email) {
            podcastAuthor = new AuthorModel({
                ...author,
                slug: slug,
            })
            await podcastAuthor.save()
        }
    } else {
        if (author?.email && !podcastAuthor?.email) {
            podcastAuthor.email = author.email
        }
        if (author?.name && !podcastAuthor?.name) {
            podcastAuthor.name = author.name
        }
        if (!podcastAuthor.slug) podcastAuthor.slug = slug
        await podcastAuthor.save()
    }

    return podcastAuthor
}

async function registerPodcast(podcastData: PodcastObject) {
    let podcast = await PodcastModel.findOne({ rssFeed: podcastData.rssFeed })
    if (!podcast) podcast = await PodcastModel.findOne({ slug: podcastData.slug })
    if (!podcast) {
        podcast = new PodcastModel({
            ...podcastData,
        })
        await podcast.save()
    }
    return podcast
}

export async function parseFeedAndRegister(feedObject: { [index: string]: any }) {
    let { podcastObject, categoriesInput, entitiesInput, authorInput } = await parsePodcastData(feedObject)

    let podcast = await registerPodcast(podcastObject)
    let entities = await registerEntities(entitiesInput, podcast)
    let categories = await registerCategories(categoriesInput, podcast)
    let author = await registerPodcastAuthor(authorInput)

    if (author) podcast.author = author
    categories.map(({ _id }) => podcast.categories.push(_id))
    entities.map(({ _id }) => podcast.entities.push(_id))

    /*** Register Podcast episode */
    let episodes = await Promise.all(
        feedObject.entries.map(async (episodeItem) => {
            try {
                let { episodeObject, entitiesInput, authorInput } = await parseEpisodeData(episodeItem, podcast)
                let episode = await registerEpisode(episodeObject)
                let entities = await registerEntities(entitiesInput, episode)
                let author = await registerPodcastAuthor(authorInput)
                entities.map(({ _id }) => episode.entities.push(_id))
                if (author) episode.author = author
                await episode.save()
                return episode
            } catch (error) {
                console.log(`${chalk.red.bold('✗')} Error in registering episode: ${chalk.yellow(error.message)}`)
                return
            }
        }),
    )
    episodes.filter((_) => !!_).map(({ _id }) => podcast.episodes.push(_id))

    await podcast.save()
    return podcast
}

export async function registerEntities(
    entities: EntitiesInput,
    currentObject: Podcast | Episode,
): Promise<DocumentType<Entity>[]> {
    let registeredEntities = []
    let listOfEntities = Object.entries(entities)
    for (let [entityType, entitiesInList] of listOfEntities) {
        if (!Array.isArray(entitiesInList)) {
            entitiesInList = []
            continue
        }
        entitiesInList = uniq(entitiesInList)
        for (let entityName of entitiesInList) {
            let entity = await EntityModel.findOne({ type: entityType, name: entityName })
            if (!entity) {
                entity = new EntityModel({
                    type: entityType,
                    name: entityName,
                })
                if (currentObject instanceof Episode) {
                    entity.episodes = [currentObject]
                } else {
                    entity.podcasts = [currentObject]
                }
                await entity.save()
            }
            registeredEntities.push(entity)
        }
    }
    return registeredEntities
}

async function registerCategories(categoryArray: string[], currentObject: Podcast | Episode) {
    let categories = []
    for (const title of categoryArray) {
        let category = await CategoryModel.findOne({ slug: slugify(title) })
        if (!category) {
            category = new CategoryModel({
                title,
                slug: slugify(title),
            })
        }
        if (currentObject instanceof Episode) {
            category.episodes = [currentObject]
        } else {
            category.podcasts = [currentObject]
        }
        await category.save()
        categories.push(category)
    }
    return categories
}

function parsePodcastData(podcastData: { [index: string]: any }): PodcastModelInput {
    let podcastObject: PodcastObject = {
        title: podcastData?.feed.title,
        slug: `${
            slugify(podcastData?.feed?.title) + (podcastData?.feed?.author ? '-' : '') + slugify(podcastData?.feed?.author ?? '')
        }`,
        rssFeed: podcastData.feed_url,
        categories: [],
        episodes: [],
        image: podcastData?.feed?.image?.url ?? '',
        lastUpdated: new Date(podcastData?.published ?? new Date()),
        link: podcastData?.feed?.link ?? '',
        publisher: podcastData?.feed?.author ?? '',
        hmac: null,
        palette: podcastData?.palette ?? [],
        description: podcastData?.feed?.summary.trim() ?? '',
    }

    let entitiesInput = podcastData.entities ?? {}
    let categoriesInput = getCategories(podcastData?.feed?.tags)
    let authorInput =
        (podcastData?.author_detail && { ...podcastData?.feed?.author_detail }) ?? {
            ...(podcastData?.feed?.authors && podcastData?.feed?.authors?.length && podcastData?.feed?.authors[0]),
        } ??
        null
    return { podcastObject, entitiesInput, categoriesInput, authorInput }
}

type Tag = { label: string; scheme: string; term: string }
function getCategories(categories: Tag[]): string[] {
    return categories?.map((category) => category.term) ?? []
}
export function parseEpisodeData(episodeData: { [index: string]: any }, podcast: Podcast): EpisodeModelInput {
    let episodeObject: EpisodeObject = {
        title: episodeData.title,
        slug: `${podcast.slug}/${slugify(episodeData.title)}`,
        sourceUrl: episodeData?.enclosure?.url ?? '',
        link: getAudioLink(episodeData?.links).href,
        subtitle: episodeData?.subtitle,
        mime: getAudioLink(episodeData?.links).type,
        description: getContentType(episodeData?.summary?.trim(), 'text/plain') ?? episodeData?.subtitle.trim() ?? '',
        htmlDescription: getContentType(episodeData?.summary?.trim(), 'text/html'),
        duration: parseTimeToMilliseconds(episodeData.itunes_duration),
        published: episodeData.published,
        image: episodeData?.image?.href,
        podcast: podcast,
        epNo: episodeData?.itunes_episode ?? -1,
        snNo: episodeData?.itunes_season ?? -1,
        explicit: episodeData?.itunes_explicit ?? false,
        likes: [],
        comments: [],
        plays: [],
        entities: [],
    }
    let entitiesInput = episodeData.entities ?? {}
    let authorInput = (episodeData?.authors && episodeData?.authors?.length && episodeData?.authors[0]) ?? null
    return { episodeObject, entitiesInput, authorInput }
}
let AUDIO_MIME_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/ogg', 'audio/wav', ' application/ogg']
type Link = { href: string; rel: string; type: string }
function getAudioLink(links: Link[]): Link {
    // Return the link with the type audio/mp4, 'audio/mpeg', '	audio/x-wav', application/ogg, 	audio/x-wav, or audio/x-aiff
    return links?.find((link) => AUDIO_MIME_TYPES.includes(link.type)) ?? { href: '', rel: '', type: '' }
}
type Content = { base: string; language: string; type: string; value: string }
function getContentType(contents: Content[], mime: 'text/html' | 'text/plain'): string {
    if (!Array.isArray(contents)) return ''
    return contents?.find((content) => content.type === mime)?.value ?? ''
}
function parseTimeToMilliseconds(time: string): string {
    if (!time) return ''
    if (!/^[0-9:]*$/gm.test(time)) return time
    if (/^[0-9]+$/.test(time)) return parseInt(time).toString()
    let [hours, minutes, seconds] = time.split(':')
    return (parseInt(hours) * 60 * 60 * 1000 + parseInt(minutes) * 60 * 1000 + parseInt(seconds) * 1000).toString()
}
