import crypto from 'crypto'
import { Headers } from 'node-fetch'
import request from 'request'
import { captureException } from '@sentry/node'
import { IOptions } from '../models/I-Options'
import { Podcast, PodcastModel } from '../models/Podcast'
/**
 * Subsribe or unsubscribe a topic at selected hub
 */
export async function subscribeToHub(options: IOptions) {
    let { mode, topic, hub, callbackUrl, leaseSeconds, secret } = options

    // by default the topic url is added as a GET parameter to the callback url
    let hubCallbackUrl =
        callbackUrl ||
        callbackUrl +
            (callbackUrl.replace(/^https?:\/\//i, '').match(/\//) ? '' : '/') +
            (callbackUrl.match(/\?/) ? '&' : '?') +
            'topic=' +
            encodeURIComponent(topic) +
            '&hub=' +
            encodeURIComponent(hub)

    let form: { [index: string]: any } = {
        'hub.callback': hubCallbackUrl,
        'hub.mode': mode,
        'hub.topic': topic,
        'hub.verify': 'async',
    }

    if (leaseSeconds > 0) {
        form['hub.lease#seconds'] = leaseSeconds
    }

    let hmac = crypto.createHmac('sha1', secret).update(topic).digest('hex')
    form['hub.secret'] = hmac

    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' })

    let postParams = {
        url: hub,
        headers,
        form,
        encoding: 'utf-8',
    }
    return new Promise<Podcast>((resolve, reject) => {
        request.post(postParams, async (error, response, responseBody) => {
            if (error) {
                captureException(error.message)
                resolve(null)
            } else {
                let podcast = await PodcastModel.findOne({ rssFeed: topic })
                if (podcast) {
                    podcast.hmac = hmac
                    podcast.save()
                    resolve(podcast)
                } else resolve(null)
            }
        })
    })
}
