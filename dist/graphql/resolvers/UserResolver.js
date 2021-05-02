"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const Episode_1 = require("./../../models/Episode");
const authentication_1 = require("./../../db/authentication");
const models_1 = require("./../../models");
const type_graphql_1 = require("type-graphql");
const User_1 = require("../../models/User");
const graphql_1 = require("graphql");
const Play_1 = require("../../models/Play");
let UserSignUpArgs = class UserSignUpArgs {
};
__decorate([
    type_graphql_1.Field(type => String, { nullable: false }),
    __metadata("design:type", String)
], UserSignUpArgs.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(type => String, { nullable: false }),
    __metadata("design:type", String)
], UserSignUpArgs.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(type => String, { nullable: false }),
    __metadata("design:type", String)
], UserSignUpArgs.prototype, "firstname", void 0);
__decorate([
    type_graphql_1.Field(type => String, { nullable: true }),
    __metadata("design:type", String)
], UserSignUpArgs.prototype, "lastname", void 0);
__decorate([
    type_graphql_1.Field(type => String, { nullable: true }),
    __metadata("design:type", String)
], UserSignUpArgs.prototype, "password", void 0);
UserSignUpArgs = __decorate([
    type_graphql_1.ArgsType()
], UserSignUpArgs);
let UserResolver = class UserResolver {
    async signup({ username, email, firstname, lastname, password }) {
        const user = new models_1.UserModel({
            username: username,
            email: email,
            firstname: firstname,
            lastname: lastname,
            password: password
        });
        try {
            await user.save();
        }
        catch (error) {
            console.log(error);
            return new graphql_1.GraphQLError(error.message);
        }
        return JSON.stringify(user);
    }
    async signin(username, password) {
        const user = await authentication_1.authenticateUser(username, password);
        return user;
    }
    async signout() {
        return true;
    }
    async signInWithToken(context) {
        const userContext = context;
        const user = await models_1.UserModel.findOne({ username: userContext.username });
        return user;
    }
    async setUserVolume(volume, context) {
        const user = await models_1.UserModel.findOne({ username: context.username });
        user.volume = volume;
        await user.save();
        return volume;
    }
    async startPlay(slug, context) {
        const user = await models_1.UserModel.findOne({ username: context.username });
        const episode = await models_1.EpisodeModel.findOne({ slug: slug });
        const play = new models_1.PlayModel({
            episode: Episode_1.Episode,
            position: 0,
            started: true,
            completed: false
        });
        if (!episode.plays)
            episode.plays = [];
        if (!user.plays)
            user.plays = [];
        episode.plays.push(play);
        user.plays.push(play);
        await episode.save();
        await play.save();
        await user.save();
        return play;
    }
    async updatePlayPosition(position, playId, context) {
        const play = await models_1.PlayModel.findById(playId);
        play.position = position;
        play.save();
        return play;
    }
    async getUserQueue(context) {
        const user = await models_1.UserModel.findOne({ username: context.username });
        const queue = user.queue;
        return queue;
    }
    async addToPlayerQueue(slug, context) {
        const user = await models_1.UserModel.findOne({ username: context.username });
        const episode = await models_1.EpisodeModel.findOne({ slug: slug });
        const play = new models_1.PlayModel({
            episode: episode,
            position: 0,
            started: false,
            completed: false
        });
        episode.plays.push(play._id);
        user.plays.push(play);
        user.queue.push(play);
        await user.save();
        await episode.save();
        await play.save();
        console.log(slug);
        return user.queue;
    }
};
__decorate([
    type_graphql_1.Mutation(returns => String),
    __param(0, type_graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserSignUpArgs]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "signup", null);
__decorate([
    type_graphql_1.Mutation(returns => User_1.User),
    __param(0, type_graphql_1.Arg('username')),
    __param(1, type_graphql_1.Arg('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "signin", null);
__decorate([
    type_graphql_1.Mutation(returns => Boolean),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "signout", null);
__decorate([
    type_graphql_1.Mutation(returns => User_1.User),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "signInWithToken", null);
__decorate([
    type_graphql_1.Mutation(returns => Number, { description: 'Sets a user Volume' }),
    __param(0, type_graphql_1.Arg('volume')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "setUserVolume", null);
__decorate([
    type_graphql_1.Mutation(returns => Play_1.Play),
    __param(0, type_graphql_1.Arg('slug')), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "startPlay", null);
__decorate([
    type_graphql_1.Mutation(returns => Play_1.Play),
    __param(0, type_graphql_1.Arg('position')),
    __param(1, type_graphql_1.Arg('playId')),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updatePlayPosition", null);
__decorate([
    type_graphql_1.Query(returns => [Play_1.Play], { description: "Returns a user's player queue" }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getUserQueue", null);
__decorate([
    type_graphql_1.Mutation(returns => [Play_1.Play], {
        description: "Adds an episode to a player's queue"
    }),
    __param(0, type_graphql_1.Arg('slug')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "addToPlayerQueue", null);
UserResolver = __decorate([
    type_graphql_1.Resolver(of => User_1.User)
], UserResolver);
exports.default = UserResolver;
