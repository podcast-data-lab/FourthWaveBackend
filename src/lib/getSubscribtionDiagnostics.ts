import request from 'request'
import { parse } from 'node-html-parser'
import { captureException } from '@sentry/node'
import chalk from 'chalk'
import slugify from 'slugify'
import { toCamelCase } from './helpers'
import { SubscriptionStatus } from '../models/SubscriptionStatus'

export async function getSubscriptionStatus(rssFeed: string, hmac: string) {
    const url = `https://pubsubhubbub.appspot.com/subscription-details?${
        'hub.callback=' +
        encodeURIComponent('https://fourthwave-api.herokuapp.com/pubsub') +
        '&' +
        'hub.secret=' +
        hmac +
        '&' +
        'hub.topic=' +
        encodeURIComponent(rssFeed)
    }`
    console.log(`${chalk.hex('F18701')('Subscription status url: ')}: ${url}`)
    return new Promise((resolve, reject) => {
        request(
            {
                url,
                method: 'GET',
            },
            (error, response, body) => {
                if (error) {
                    console.log(`${chalk.hex('F18701')('Error: ')}: ${error}`)
                    captureException(error)
                    reject(error)
                } else {
                    console.log(`${chalk.hex('F18701')('Received message: ')}: ${body}`)
                    let data = extractPodcastData(body, rssFeed)
                    console.log(`${chalk.hex('F18701')('Received message: ')}: ${JSON.stringify(data)}`)
                    resolve(data)
                }
            },
        )
    })
}

function extractPodcastData(html, rssFeed): SubscriptionStatus {
    try {
        let parsed = parse(html)
        let labels = parsed.querySelectorAll('dl')[0].querySelectorAll('dt')
        let values = parsed.querySelectorAll('dl')[0].querySelectorAll('dd')
        parsed.querySelectorAll('dl')[0]
        let data = new SubscriptionStatus(rssFeed)
        for (let i = 0; i < labels.length; i++) {
            let label = labels[i].innerHTML
            let value = values[i].innerHTML
            data[toCamelCase(label.trim())] = value.trim()
        }
        return data
    } catch (e) {
        return new SubscriptionStatus(rssFeed)
    }
}
