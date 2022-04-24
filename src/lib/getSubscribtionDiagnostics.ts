import request from 'request'
import { parse } from 'node-html-parser'
import { captureException } from '@sentry/node'

export async function getSubscriptionStatus(rssUrl: string, hmac: string) {
    const urlParams = new URLSearchParams({
        'hub.callback': encodeURIComponent('https://fourthwave-api.herokuapp.com/pubsub'),
        'hub.secret': hmac,
        'hub.topic': encodeURIComponent(rssUrl),
    })
    new Promise((resolve, reject) => {
        request(
            {
                method: 'GET',
                url: 'https://pubsubhubbub.appspot.com/subscription-details' + '?' + urlParams.toString(),
            },
            (error, response, body) => {
                if (error) {
                    captureException(error)
                    reject(error)
                } else {
                    let data = extractPodcastData(body)
                    resolve(data)
                }
            },
        )
    })
}

async function extractPodcastData(html) {
    let parsed = parse(html)
    let labels = parsed.querySelectorAll('dl')[0].querySelectorAll('dt').length
    let values = parsed.querySelectorAll('dl')[0].querySelectorAll('dd').length

    let data = {}
    for (let i = 0; i < labels; i++) {
        let label = labels[i].innerHTML
        let value = values[i].innerHTML
        data[label.trim()] = [value.trim()]
    }
    return data
}
