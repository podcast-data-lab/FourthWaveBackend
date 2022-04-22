import fastify from 'fastify'
import { ApolloServer } from 'apollo-server-fastify'
const mongoose = require('mongoose')

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

    const server = new ApolloServer({
        schema,
        context: async ({ request, reply }): Promise<User> => {
            let token = request.headers.authorization
            if (!token) return null
            let user = verifyTokenAndGetUser(token)
            if (!user) return null
            return user
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
    const port = process.env.PORT || 6500

    app.listen(port, host, () => {
        console.log(`api listening on port some port if not 6500`)
    })
})()

function checkAllowedOrigins(origin: string): boolean {
    const allowedOrigins = ['https://onthistopic.firebaseapp.com', 'https://onthistopic.web.app']
    // if (allowedOrigins.includes(origin)) return true
    // else return true
    return true
}
