"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const apollo_server_fastify_1 = require("apollo-server-fastify");
const mongoose = require('mongoose');
// Require the environment variables
require('dotenv').config('../../');
mongoose.connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const AltairFastify = require('altair-fastify-plugin');
const resolvers_1 = require("../graphql/resolvers");
const AuthChecker_1 = require("../graphql/AuthChecker");
const authentication_1 = require("../db/authentication");
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
            resolvers_1.CategoryResolver,
            resolvers_1.TopicResolver
        ],
        emitSchemaFile: true,
        authChecker: AuthChecker_1.AuthCheckerFn,
        validate: false
    });
    const app = fastify_1.default();
    const server = new apollo_server_fastify_1.ApolloServer({
        schema,
        context: async ({ request, reply }) => {
            let token = request.headers.authorization || '';
            const user = await authentication_1.verifyToken(token);
            return user;
        }
    });
    await server.start();
    app.register(server.createHandler());
    app.register(require('fastify-cors'), {
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
            cb(new Error('Not allowed'));
        }
    });
    app.register(AltairFastify, {
        path: '/altair',
        baseURL: '/altair/',
        endpointURL: '/graphql'
    });
    const host = '0.0.0.0';
    const port = process.env.PORT || 6500;
    app.listen(port, host, () => {
        console.log(`api listening on port some port if not 6500`);
    });
})();
function checkAllowedOrigins(origin) {
    const allowedOrigins = [
        'https://onthistopic.firebaseapp.com',
        'https://onthistopic.web.app'
    ];
    // if (allowedOrigins.includes(origin)) return true
    // else return true
    return true;
}
