import { Podcast, PodcastModel } from '../models/Podcast'
import {
    parseEpisodeData,
    registerEntities,
    registerEpisode,
    EntitiesInput,
    EpisodeModelInput,
    registerPodcastAuthor,
} from './registerModels'
import { captureException } from '@sentry/node'
import chalk from 'chalk'
import fetch, { Headers } from 'node-fetch'

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
            episode.entities.push(...entities)
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
        'x-api-key': process.env.LAMBDA_API_KEY,
        'Content-Type': 'application/json',
    })
    return fetch(`${process.env.LAMBDA_ENDPOINT}/nex`, {
        headers,
        method: 'POST',
        body: JSON.stringify({ payload }),
    })
        .then((response) => response.json())
        .then((body) => {
            console.log(`${chalk.hex('F18701')('Received message: ')}: ${JSON.stringify(body)}`)
            return body.entities
        })
        .catch((error) => {
            captureException(error)
            return emptyBody.entities
        })
}

async function getUpdatedItems(rss_url: string, _last_fetched: Date, podcast: Podcast): Promise<EpisodeModelInput[]> {
    let last_fetched = new Date(_last_fetched).toUTCString().replace(/GMT/, '+0000')
    let headers = new Headers({
        'x-api-key': process.env.LAMBDA_API_KEY,
        'Content-Type': 'application/json',
    })
    return fetch(`${process.env.LAMBDA_ENDPOINT}/updated-items`, {
        headers,
        method: 'post',
        body: JSON.stringify({ last_fetched: last_fetched, rss_url: rss_url }),
    })
        .then(checkStatus)
        .then((body) => {
            console.log(`${chalk.hex('F18701')('Updated items message')}: ${JSON.stringify(body)}`)
            return body.entries.map((entry) => parseEpisodeData(entry, podcast))
        })
        .catch((error) => {
            console.log(`err: ${error.message}`)
            captureException(error)
            return []
        })
}

async function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response.json()
    } else {
        let parsedResponse = await response.json()
        throw new Error(parsedResponse?.message)
    }
}
