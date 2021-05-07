import fastify from 'fastify'
import { ApolloServer } from 'apollo-server-fastify'
const mongoose = require('mongoose')

// Require the environment variables
require('dotenv').config('../../')

mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
const AltairFastify = require('altair-fastify-plugin')

import {
  EpisodeResolver,
  CommentResolver,
  LocationResolver,
  PersonResolver,
  PodcastResolver,
  ThemeResolver,
  UserResolver,
  CategoryResolver,
  TopicResolver
} from '../graphql/resolvers'
import { AuthCheckerFn } from '../graphql/AuthChecker'
import { verifyToken } from '../db/authentication'
import { User } from '../models/User'
;(async () => {
  const schema = await buildSchema({
    resolvers: [
      CommentResolver,
      EpisodeResolver,
      LocationResolver,
      PersonResolver,
      PodcastResolver,
      ThemeResolver,
      UserResolver,
      CategoryResolver,
      TopicResolver
    ],

    emitSchemaFile: true,
    authChecker: AuthCheckerFn,
    validate: false
  })

  const app = fastify()

  const server = new ApolloServer({
    schema,
    context: async ({ request, reply }): Promise<User> => {
      let token = request.headers.authorization || ''
      const user: User = await verifyToken(token)
      return user
    }
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
    }
  })
  // app.register(require("fastify-cors"), {
  //   origin: (origin, cb) => {
  //     if (/localhost/.test(origin) || !origin) {
  //       //  Request from localhost will pass
  //       cb(null, true);
  //       return;
  //     }
  //     if (checkAllowedOrigins(origin)) {
  //       cb(null, true);
  //       return;
  //     }
  //     // Generate an error on other origins, disabling access
  //     cb(new Error("Not allowed"));
  //   },
  // });

  app.register(AltairFastify, {
    path: '/altair',
    baseURL: '/altair/',
    endpointURL: '/graphql'
  })

  var PORT = process.env.PORT || 8000

  app.listen(PORT, () => {
    console.log(`api listening on port ${PORT}`)
  })
})()

function checkAllowedOrigins (origin: string): boolean {
  console.log(origin)
  return false
}
