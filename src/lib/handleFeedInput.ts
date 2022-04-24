import striptags from 'striptags'
import { PodcastModel } from '../models/Podcast'
import { parseEpisodeData, registerEntities, registerEpisode, EntitiesInput } from './registerModels'
const NEX_ENDPOINT = process.env.NEX_ENDPOINT
const NEX_API_KEY = process.env.API_KEY
import { captureException } from '@sentry/node'
import request from 'request'

export async function handleFeedContent(requestBody: { [index: string]: any }, feedUrl: string) {
    let content = requestBody.rss.channel

    let episodeData = content.items
    return Promise.all(
        episodeData.map(async (item) => {
            try {
                // remove escape characters
                let descriptionText = item.description ?? item['content:encoded'] ?? ''
                let description = striptags(descriptionText.replace(/\\“/g, '"').replace(/\\”/, '"').replace(/\\’/, "'"))
                let namedEntities = await getNamedEntities(description)
                let podcastInQuesion = await PodcastModel.findOne({ rssFeed: feedUrl })
                if (!podcastInQuesion) {
                    return
                }

                let { episodeObject } = parseEpisodeData(item, podcastInQuesion.slug)
                let episode = await registerEpisode(episodeObject)
                let entities = await registerEntities(namedEntities, episode)

                entities.map(({ _id }) => episode.entities.push(_id))
                await episode.save()
                return episode
            } catch (error) {
                captureException(error)
                return
            }
        }),
    )
}

let emptyBody = { payload: '', entities: {} }

async function getNamedEntities(text: string): Promise<EntitiesInput> {
    let headers = new Headers({
        'x-api-key': NEX_API_KEY,
        'Content-Type': 'text/plain',
    })
    let requestOptions = {
        headers,
        method: 'POST',
        url: NEX_ENDPOINT,
    }
    return await new Promise((resolve, reject) => {
        request(requestOptions, (error, response, body) => {
            if (error) {
                return resolve(emptyBody.entities)
            } else {
                let parsedBody = JSON.parse(body)
                return resolve(parsedBody.entities ?? emptyBody.entities)
            }
        })
    })
}
