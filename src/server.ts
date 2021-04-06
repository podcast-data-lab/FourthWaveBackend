import express from "express";
import { ApolloServer } from "apollo-server-express";
import { createServer } from "http";

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

const runServer = async () => {
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

  const app = express();

  const apolloServer = new ApolloServer({
    schema,
  });

  apolloServer.applyMiddleware({ app });
  const httpServer = createServer(app);

  apolloServer.installSubscriptionHandlers(httpServer);

  const PORT = process.env.PORT || 6500;

  httpServer.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
  });
};

runServer();
