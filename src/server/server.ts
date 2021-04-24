import fastify from "fastify";
import { ApolloServer } from "apollo-server-fastify";
const mongoose = require("mongoose");

// Require the environment variables
require("dotenv").config("../../");

mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

import "reflect-metadata";
import { buildSchema } from "type-graphql";
const AltairFastify = require("altair-fastify-plugin");

import {
  EpisodeResolver,
  CommentResolver,
  LocationResolver,
  PersonResolver,
  PodcastResolver,
  ThemeResolver,
  UserResolver,
} from "../graphql/resolvers";

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

  app.register(AltairFastify, {
    path: "/altair",
    baseURL: "/altair/",
    endpointURL: "/graphql",
  });
  const PORT = process.env.PORT || 8080;


  app.listen(PORT, () => {
    console.log(`api running on port ${PORT}`);
  });
  app.get("**", (req, res) => {
    res.send({ message: "perhaps you were looking for the frontend" });
  });
})();

function checkAllowedOrigins(origin: string): boolean {
  console.log(origin);
  return false;
}
