"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const apollo_server_fastify_1 = require("apollo-server-fastify");
const mongoose = require("mongoose");
// Require the environment variables
require("dotenv").config("../../");
mongoose.connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const AltairFastify = require("altair-fastify-plugin");
const resolvers_1 = require("../graphql/resolvers");
(async () => {
    const schema = await type_graphql_1.buildSchema({
        resolvers: [
            resolvers_1.CommentResolver,
            resolvers_1.EpisodeResolver,
            resolvers_1.LocationResolver,
            resolvers_1.PersonResolver,
            resolvers_1.PodcastResolver,
            resolvers_1.ThemeResolver,
            resolvers_1.UserResolver,
        ],
        emitSchemaFile: true,
    });
    const app = fastify_1.default();
    const server = new apollo_server_fastify_1.ApolloServer({
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
    app.listen(process.env.PORT || 8080, () => {
        console.log(`api running`);
    });
    app.get("**", (req, res) => {
        res.send({ message: "perhaps you were looking for the frontend" });
    });
})();
function checkAllowedOrigins(origin) {
    console.log(origin);
    return false;
}
