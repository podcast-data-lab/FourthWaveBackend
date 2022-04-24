import fetch, { Headers } from 'node-fetch'
import striptags from 'striptags'
import { EpisodeModel } from '../models'

const NEX_ENDPOINT = process.env.NEX_ENDPOINT
const NEX_API_KEY = process.env.API_KEY

export async function handleFeedContent(requestBody: { [index: string]: any }, feedUrl: string) {
    let content = requestBody.rss.channel

    let items = content.items
    items.forEach((item) => {
        let description = striptags(item.description)
    })
}

async function getNamedEntities(text: string) {
    let headers = new Headers({
        'x-api-key': NEX_API_KEY,
        'Content-Type': 'text/plain',
    })
    let requestOptions = {
        headers,
        method: 'POST',
    }
    return await fetch(NEX_ENDPOINT, requestOptions)
}
