import { EpisodeModel } from '../models'
import { Episode } from '../models/Episode'
import { Podcast, PodcastModel } from '../models/Podcast'
import slugify from 'slugify'
import { EntityModel } from '../models/Entity'
import { flatten, uniq } from 'ramda'
import { CategoryModel } from '../models/Category'
import { ObjectId } from 'mongodb'

type PodcastObject = { [Property in keyof Omit<Podcast, '_id'>]: Podcast[Property] }
type PodcastModelInput = { podcastObject: PodcastObject; entitiesInput: Entities; categoriesInput: Categories }

type EpisodeObject = { [Property in keyof Omit<Episode, '_id'>]: Episode[Property] }
type EpisodeModelInput = { episodeObject: EpisodeObject; entitiesInput: Entities }

type Entities = { [index: string]: string[] }
type Categories = [string]

async function registerEpisode(episodeData: EpisodeObject) {
    let episode = await EpisodeModel.findOne({ slug: episodeData.slug })
    if (!episode) {
        episode = new EpisodeModel({
            ...episodeData,
            _id: new ObjectId(),
        })
        await episode.save()
    }
    return episode
}

async function registerPodcast(podcastData: PodcastObject) {
    let podcast = await PodcastModel.findOne({ slug: slugify(podcastData.title) })
    if (!podcast) {
        podcast = new PodcastModel({
            ...podcastData,
            _id: new ObjectId(),
        })
        await podcast.save()
    }
    return podcast
}

export async function parseFeedAndRegister(feedObject: { [index: string]: any }) {
    let { podcastObject, categoriesInput, entitiesInput } = await parsePodcastData(feedObject)

    let podcast = await registerPodcast(podcastObject)
    let entities = await registerEntities(entitiesInput, podcast)
    let categories = await registerCategories(categoriesInput, podcast)

    categories.map(({ _id }) => podcast.categories.push(_id))
    entities.map(({ _id }) => podcast.entities.push(_id))

    /*** Register Podcast episode */
    let episodes = await Promise.all(
        feedObject.items.map(async (episodeItem) => {
            let { episodeObject, entitiesInput } = await parseEpisodeData(episodeItem, podcast.slug)
            let episode = await registerEpisode(episodeObject)
            let entities = await registerEntities(entitiesInput, episode)
            entities.map(({ _id }) => episode.entities.push(_id))
            await episode.save()
            return episode
        }),
    )
    episodes.map(({ _id }) => podcast.episodes.push(_id))

    await podcast.save()
    return podcast
}

async function registerEntities(entities: Entities, currentObject: Podcast | Episode) {
    return Promise.all(
        Object.entries(entities).map(async ([entityType, entitiesInList]) => {
            if (!Array.isArray(entitiesInList)) {
                entitiesInList = []
                return
            }
            entitiesInList = uniq(entitiesInList)
            return Promise.all(
                entitiesInList.map(async (entityName) => {
                    let entity = await EntityModel.findOne({ entityType, entityName })
                    if (!entity) {
                        entity = new EntityModel({
                            type: entityType,
                            name: entityName,
                            _id: new ObjectId(),
                        })
                        if (currentObject instanceof Episode) {
                            entity.episodes = [currentObject]
                        } else {
                            entity.podcasts = [currentObject]
                        }
                        await entity.save()
                    }
                    return entity
                }),
            )
        }),
    ).then((entities) => flatten(entities))
}

function registerCategories(categoryArray: string[], currentObject: Podcast | Episode) {
    return Promise.all(
        categoryArray.map(async (title) => {
            let category = await CategoryModel.findOne({ title })
            if (!category) {
                category = new CategoryModel({
                    title,
                    slug: slugify(title),
                    _id: new ObjectId(),
                })
            }
            if (currentObject instanceof Episode) {
                category.episodes = [currentObject]
            } else {
                category.podcasts = [currentObject]
            }
            await category.save()
            return category
        }),
    )
}

function parsePodcastData(podcastData: { [index: string]: any }): PodcastModelInput {
    let podcastObject: PodcastObject = {
        title: podcastData.title,
        slug: slugify(podcastData.title),
        rssFeed: podcastData.feedUrl,
        categories: [],
        episodes: [],
        image: podcastData?.image?.url ?? '',
        lastRssBuildDate: new Date(podcastData?.lastRssBuildDate ?? new Date()),
        link: podcastData?.link ?? '',
        publisher: podcastData?.itunes?.owner?.name ?? '',

        palette: podcastData?.palette ?? [],
        description: podcastData?.description ?? '',
    }

    let entitiesInput = podcastData.entities ?? {}
    let categoriesInput = podcastData?.itunes?.categories ?? []
    return { podcastObject, entitiesInput, categoriesInput }
}

export function parseEpisodeData(episodeData: { [index: string]: any }, podcastSlug: string): EpisodeModelInput {
    let episodeObject: EpisodeObject = {
        title: episodeData.title,
        slug: `${podcastSlug}/${slugify(episodeData.title)}`,
        sourceUrl: episodeData?.enclosure?.url ?? '',
        link: episodeData?.link ?? '',
        subtitle: '',
        description: episodeData?.content ?? '',
        duration: (episodeData?.duration && parseTimeToMilliseconds(episodeData.duration)) ?? 0,
        datePublished: episodeData.pubDate,
        image: episodeData?.itunes?.image ?? '',
        podcast: episodeData.podcast,
        epNo: episodeData?.itunes?.episode ?? -1,
        snNo: episodeData?.itunes?.season ?? -1,
        explicit: parseExplicit(episodeData?.itunes?.explicit ?? 'no'),
        likes: [],
        comments: [],
        plays: [],
        entities: [],
    }
    let entitiesInput = episodeData.entities ?? {}
    return { episodeObject, entitiesInput }
}

function parseExplicit(explicit: string): boolean {
    return explicit === 'yes' || explicit === 'true'
}
function parseTimeToMilliseconds(time: string): number {
    let [hours, minutes, seconds] = time.split(':')
    return parseInt(hours) * 60 * 60 * 1000 + parseInt(minutes) * 60 * 1000 + parseInt(seconds) * 1000
}
