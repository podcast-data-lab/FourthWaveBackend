import fastify from "fastify";
import { ApolloServer } from "apollo-server-fastify";
const mongoose = require("mongoose");
const PORT = +process.env.PORT || 6500;

mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

import "reflect-metadata";
import { buildSchema } from "type-graphql";
import {
  EpisodeResolver,
  CommentResolver,
  LocationResolver,
  PersonResolver,
  PodcastResolver,
  ThemeResolver,
  UserResolver,
} from "./graphql/resolvers";

(async () => {
  const schema = await buildSchema({
    resolvers: [
      CommentResolver,
      EpisodeResolver,
      LocationResolver,
      PersonResolver,
      PodcastResolver,
      ThemeResolver,
      UserResolver,
    ],
    emitSchemaFile: true,
  });

  const app = fastify();

  const server = new ApolloServer({
    schema,
  });

  await server.start();
  app.register(server.createHandler());

  app.register(require("fastify-cors"), {
    origin: (origin, cb) => {
      if (/localhost/.test(origin) || !origin) {
        //  Request from localhost will pass
        cb(null, true);
        return;
      }
      if (checkAllowedOrigins(origin)) {
        cb(null, true);
        return;
      }
      // Generate an error on other origins, disabling access
      cb(new Error("Not allowed"));
    },
  });

  await app.listen(PORT);
})();

function checkAllowedOrigins(origin: string): boolean {
  console.log(origin);
  return false;
}
