import { Podcast, PodcastModel } from '../models/Podcast'
import {
    parseEpisodeData,
    registerEntities,
    registerEpisode,
    EntitiesInput,
    EpisodeModelInput,
    registerPodcastAuthor,
} from './registerModels'
const LAMBDA_ENDPOINT = process.env.LAMBDA_ENDPOINT
const LAMBDA_API_KEY = process.env.API_KEY
import { captureException } from '@sentry/node'
import request from 'request'

export async function handleFeedContentUpdate(rssFeed: string) {
    if (!rssFeed) return Promise.resolve()
    let podcast = await PodcastModel.findOne({ rssFeed })
    if (!podcast) return Promise.resolve()
    let last_fetched = podcast.lastUpdated
    let updatedItems = await getUpdatedItems(rssFeed, last_fetched, podcast)

    return Promise.all(
        updatedItems.map(async (item) => {
            let { episodeObject, entitiesInput, authorInput } = await parseEpisodeData(item, podcast)
            let episode = await registerEpisode(episodeObject)
            let entities = await registerEntities(entitiesInput, episode)
            let author = await registerPodcastAuthor(authorInput)
            entities.map(({ _id }) => episode.entities.push(_id))
            episode.author = author
            episode.podcast = podcast
            await episode.save()
            podcast.episodes.push(episode)
            podcast.lastUpdated = new Date(podcast.lastUpdated) > new Date() ? podcast.lastUpdated : new Date()
            await podcast.save()
            return episode
        }),
    ).catch((error) => {
        captureException(error)
        return Promise.resolve()
    })
}

let emptyBody = { payload: '', entities: {} }

export async function getNamedEntities(payload: string): Promise<EntitiesInput> {
    let headers = new Headers({
        'x-api-key': LAMBDA_API_KEY,
        'Content-Type': 'text/plain',
    })
    let requestOptions = {
        headers,
        method: 'POST',
        url: `${LAMBDA_ENDPOINT}/nex`,
        body: JSON.stringify({ payload }),
    }
    return await new Promise((resolve, reject) => {
        request(requestOptions, (error, response, body) => {
            if (error) {
                captureException(error)
                return resolve(emptyBody.entities)
            } else {
                let parsedBody = JSON.parse(body)
                return resolve(parsedBody.entities ?? emptyBody.entities)
            }
        })
    })
}

async function getUpdatedItems(rss_url: string, _last_fetched: Date, podcast: Podcast): Promise<EpisodeModelInput[]> {
    let last_fetched = new Date(_last_fetched).toUTCString().replace(/GMT/, '+0000')
    let headers = new Headers({
        'x-api-key': LAMBDA_API_KEY,
        'Content-Type': 'text/plain',
    })
    let requestOptions = {
        headers,
        method: 'POST',
        url: `${LAMBDA_ENDPOINT}/updated-items`,

        body: JSON.stringify({ last_fetched, rss_url }),
    }
    return await new Promise((resolve, reject) => {
        request(requestOptions, (error, response, body) => {
            if (error) {
                captureException(error)
                return resolve([])
            } else {
                let parsedBody = JSON.parse(body)
                let entries = []
                if (parsedBody.entries) {
                    entries = parsedBody.entries.map((entry) => parseEpisodeData(entry, podcast))
                }
                return resolve(entries)
            }
        })
    })
}
