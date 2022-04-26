import fastify from 'fastify'
import { ApolloServer } from 'apollo-server-fastify'
const mongoose = require('mongoose')
import urllib from 'url'
import { initializeSentry } from '../lib/sentry'
import { captureMessage, captureException } from '@sentry/node'
// Require the environment variables
require('dotenv').config('../../')

mongoose.connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
const AltairFastify = require('altair-fastify-plugin')

import {
    EpisodeResolver,
    CommentResolver,
    PodcastResolver,
    ThemeResolver,
    LibraryResolver,
    PlayingQueueResolver,
    PreferencesResolver,
    CategoryResolver,
    EntityResolver,
    AuthResolver,
} from '../graphql/resolvers'
import { AuthCheckerFn } from '../graphql/AuthChecker'
import { verifyTokenAndGetUser } from '../db/authentication'
import { handleFeedContentUpdate } from '../lib/handleFeedInput'
import { UserContext } from '../models/Context'

initializeSentry()
;(async () => {
    const schema = await buildSchema({
        resolvers: [
            AuthResolver,
            CommentResolver,
            EpisodeResolver,
            PodcastResolver,
            ThemeResolver,
            LibraryResolver,
            PlayingQueueResolver,
            PreferencesResolver,
            CategoryResolver,
            EntityResolver,
        ],
        emitSchemaFile: {
            path: './schema.graphql',
            sortedSchema: true,
        },
        authChecker: AuthCheckerFn,
        validate: false,
    })

    const app = fastify()

    app.register(require('fastify-xml-body-parser'))
    //Can use default JSON/Text parser for different content Types
    app.addContentTypeParser('text/json', { parseAs: 'string' }, app.getDefaultJsonParser('ignore', 'ignore'))
    app.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
        try {
            // @ts-ignore
            var json = JSON.parse(body)
            done(null, json)
        } catch (err) {
            err.statusCode = 400
            done(err, undefined)
        }
    })
    app.get('/health', async (request, reply) => {
        reply.send('OK')
    })

    app.get('/pubsub', async (request, reply) => {
        let params = urllib.parse(request.url, true, true)
        // Does not seem to be a valid PubSubHubbub request
        if (!params.query['hub.topic'] || !params.query['hub.mode']) {
            captureMessage('Invalid PubSubHubbub request')
            return reply.code(400).send('Bad Request')
        }
        switch (params.query['hub.mode']) {
            case 'denied':
                reply
                    .header('Content-Type', 'text/plain')
                    .code(200)
                    .send(params.query['hub.challenge'] || 'ok')
                break
            case 'subscribe':
                captureMessage('Subscribed to ' + params.query['hub.topic'])
                reply.header('Content-Type', 'text/plain').code(200).send(params.query['hub.challenge'])
                break
            case 'unsubscribe':
                captureMessage('Unsubscribe request received')
                reply.header('Content-Type', 'text/plain').code(200).send(params.query['hub.challenge'])
                break
            default:
                // Not a valid mode
                captureMessage('Pub Sub Request has an invalid mode')
                return reply.code(403).send('Forbidden')
        }
    })

    app.post('/pubsub', async (request, reply) => {
        let links = /<(.*?)>/.exec(request.headers['link'] as string)
        captureMessage('pubsub request headers: ' + JSON.stringify(request.headers))
        console.log('pubsub request headers: ' + JSON.stringify(request.headers))
        let topicUrl = links && links[1]
        /* Only register podcasts that have an X-hub signature */
        if (topicUrl && request.headers['x-hub-signature']) {
            captureMessage('Updating feed :: ' + topicUrl)
            await handleFeedContentUpdate(topicUrl)
        } else captureException('No topic found in request')
        return reply.code(200).send('OK. But not topic found')
    })

    const server = new ApolloServer({
        schema,
        context: async ({ request, reply }): Promise<UserContext> => {
            let token = request.headers.authorization
            if (!token) return null
            let userAndLib = await verifyTokenAndGetUser(token)
            if (!userAndLib) return null
            return { ...userAndLib, roles: [] }
        },
    })

    await server.start()
    app.register(server.createHandler())

    app.register(require('fastify-cors'), {
        origin: (origin, cb) => {
            if (/localhost/.test(origin) || !origin) {
                //  Request from localhost will pass
                cb(null, true)
                return
            }
            if (checkAllowedOrigins(origin)) {
                cb(null, true)
                return
            }
            // Generate an error on other origins, disabling access
            cb(new Error('Not allowed'))
        },
    })

    app.register(AltairFastify, {
        path: '/altair',
        baseURL: '/altair/',
        endpointURL: '/graphql',
    })

    const host = '0.0.0.0'
    const PORT = process.env.PORT || 6500

    app.listen(PORT, host, () => {
        const message = `api listening on port ${PORT}`
        console.log(message)
    })
})()

function checkAllowedOrigins(origin: string): boolean {
    const allowedOrigins = ['https://onthistopic.firebaseapp.com', 'https://onthistopic.web.app']
    // if (allowedOrigins.includes(origin)) return true
    // else return true
    return true
}
