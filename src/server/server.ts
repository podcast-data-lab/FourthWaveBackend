import fastify from 'fastify'
import { ApolloServer } from 'apollo-server-fastify'
const mongoose = require('mongoose')
import urllib from 'url'
import crypto from 'crypto'
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
import { User } from '../models/User'
import { Library } from '../models/Library'
import { UserPermission } from '../models/enums/Permissions'

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

    app.get('/health', async (request, reply) => {
        reply.send('OK')
    })

    app.get('/pubsub', async (request, reply) => {
        let params = urllib.parse(request.url, true, true)
        // Does not seem to be a valid PubSubHubbub request
        if (!params.query['hub.topic'] || !params.query['hub.mode']) {
            captureMessage
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
        captureMessage('Pub Sub Message received: ' + JSON.stringify({ request }))
        let bodyChunks = []
        let params = urllib.parse(request.url, true, true)
        let topic = params && params.query && params.query.topic
        let hub = params && params.query && params.query.hub
        let bodyLen = 0
        let tooLarge = false
        let signatureParts
        let algo
        let signature
        let hmac

        const setTopicHub = (o, url, rel) => {
            rel = rel || ''

            switch (rel.toLowerCase()) {
                case 'self':
                    topic = url
                    break
                case 'hub':
                    hub = url
                    break
            }
        }

        // v0.4 hubs have a link header that includes both the topic url and hub url
        let regex = /<([^>]+)>;\s*rel=(?:["'](?=.*["']))?([A-z]+)/gi
        let requestLink = (request.headers && request.headers.link) || ''
        //@ts-ignore
        let requestRels = regex.exec(requestLink)

        //@ts-ignore
        setTopicHub(...requestRels)

        if (!topic) {
            captureException('No topic found in request')
            return reply.code(400).send('Bad Request')
        }

        if (!request.headers['x-hub-signature']) {
            captureException(new Error('No X-Hub-Signature header found'))
            return reply.code(400).send('Forbidden')
        }

        signatureParts = (request.headers['x-hub-signature'] as string).split('=')
        algo = (signatureParts.shift() || '').toLowerCase()
        signature = (signatureParts.pop() || '').toLowerCase()

        try {
            hmac = crypto.createHmac(algo, process.env.HMAC_SECRET)
        } catch (E) {
            captureMessage('Invalid HMAC algorithm')
            return reply.code(400).send('Forbidden')
        }
        reply.send('OK')
    })

    const server = new ApolloServer({
        schema,
        context: async ({ request, reply }): Promise<{ user: User; library: Library; roles: UserPermission[] }> => {
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
