import request from 'request'
import { parse } from 'node-html-parser'
import { captureException } from '@sentry/node'
import { toCamelCase } from './helpers'
import { SubscriptionStatus } from '../models/SubscriptionStatus'
import { Podcast } from '../models/Podcast'

export async function getSubscriptionStatus(podcast: Podcast) {
    const url = `https://pubsubhubbub.appspot.com/subscription-details?${
        'hub.callback=' +
        encodeURIComponent('https://fourthwave-api.herokuapp.com/pubsub') +
        '&' +
        'hub.secret=' +
        podcast.hmac +
        '&' +
        'hub.topic=' +
        encodeURIComponent(podcast.rssFeed)
    }`
    return new Promise<SubscriptionStatus>((resolve, reject) => {
        request(
            {
                url,
                method: 'GET',
            },
            (error: any, response: any, body: any) => {
                if (error) {
                    captureException(error)
                    reject(error)
                } else {
                    let data = extractPodcastData(body, podcast)
                    resolve(data)
                }
            },
        )
    })
}

function extractPodcastData(html: string, podcast: Podcast): SubscriptionStatus {
    try {
        let parsed = parse(html)
        let labels = parsed.querySelectorAll('dl')[0].querySelectorAll('dt')
        let values = parsed.querySelectorAll('dl')[0].querySelectorAll('dd')
        parsed.querySelectorAll('dl')[0]
        let data = new SubscriptionStatus(podcast)
        for (let i = 0; i < labels.length; i++) {
            let label = labels[i].innerHTML
            let value = values[i].innerHTML
            data[toCamelCase(label.trim()) as keyof Omit<SubscriptionStatus, 'podcast'>] = value.trim()
        }
        return data
    } catch (e) {
        return new SubscriptionStatus(podcast)
    }
}
