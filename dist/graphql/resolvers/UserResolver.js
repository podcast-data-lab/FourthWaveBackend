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
        const user = await models_1.UserModel.aggregate([
            { $match: { username: context.username } },
            {
                $lookup: {
                    from: 'plays',
                    foreignField: '_id',
                    localField: 'queue',
                    as: 'queue'
                }
            }
        ]);
        TODO: 'Move this sorting work to the database';
        const userQueue = await (await models_1.UserModel.findOne({ username: context.username })).queue;
        user[0].queue = user[0].queue.sort((a, b) => userQueue.indexOf(a._id) - userQueue.indexOf(b._id));
        return user[0];
    }
    async setUserVolume(volume, context) {
        console.log(context);
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
    async updatePlayPosition(position, playId) {
        const play = await models_1.PlayModel.findById(playId);
        if (play.position > 0 && play.started == false)
            play.started = true;
        play.position = position;
        await play.save();
        return play;
    }
    async getUserQueue(context) {
        const userQueue = await (await models_1.UserModel.findOne({ username: context.username })).queue;
        const user = await models_1.UserModel.aggregate([
            { $match: { username: context.username } },
            {
                $lookup: {
                    from: 'plays',
                    foreignField: '_id',
                    localField: 'queue',
                    as: 'queue'
                }
            }
        ]);
        user[0].queue = user[0].queue.sort((a, b) => userQueue.indexOf(a._id) - userQueue.indexOf(b._id));
        return user[0].queue;
    }
    async addToPlayerQueue(slug, context) {
        const user = await models_1.UserModel.findOne({ username: context.username });
        console.log(user.queue);
        const episode = await models_1.EpisodeModel.findOne({ slug: slug });
        const play = new models_1.PlayModel({
            episode: episode,
            position: 0,
            started: false,
            completed: false
        });
        episode.plays.push(play._id);
        user.plays.push(play._id);
        user.queue.push(play);
        await user.save();
        await episode.save();
        await play.save();
        const userDetails = await models_1.UserModel.aggregate([
            { $match: { username: context.username } },
            {
                $lookup: {
                    from: 'plays',
                    foreignField: '_id',
                    localField: 'queue',
                    as: 'queue'
                }
            }
        ]);
        return userDetails[0].queue;
    }
    async addToBeginningOfQueue(slug, context) {
        const user = await models_1.UserModel.findOne({ username: context.username });
        TODO: 'Check if the episode is already in the users queue!!!';
        const episode = await models_1.EpisodeModel.findOne({ slug: slug });
        const play = new models_1.PlayModel({
            episode: episode,
            position: 0,
            started: false,
            completed: false
        });
        episode.plays.push(play._id);
        user.plays.push(play._id);
        user.queue.unshift(play._id);
        await user.save();
        await episode.save();
        await play.save();
        return play;
    }
    async updatePlayerQueue(queue, context) {
        const user = await models_1.UserModel.findOne({ username: context.username });
        console.log(queue);
        const userDeets = await models_1.UserModel.aggregate([
            { $match: { username: context.username } },
            {
                $lookup: {
                    from: 'plays',
                    foreignField: '_id',
                    localField: 'queue',
                    as: 'queue'
                }
            }
        ]);
        return userDeets[0].queue;
    }
    async changePlayingSpeed(speed, context) {
        const user = await models_1.UserModel.findOne({ username: context.username });
        console.log(user.queue);
        user.playingSpeed = speed;
        await user.save();
        return user.playingSpeed;
    }
    async updatePosition(playId, position, context) {
        const play = await models_1.PlayModel.findById(playId);
        play.position = position;
        await play.save();
        const userDeets = await models_1.UserModel.aggregate([
            { $match: { username: context.username } },
            {
                $lookup: {
                    from: 'plays',
                    foreignField: '_id',
                    localField: 'queue',
                    as: 'queue'
                }
            }
        ]);
        return userDeets[0].queue[0];
    }
    async clearQueue(context) {
        const user = await models_1.UserModel.findOne({ username: context.username });
        user.queue = [];
        await user.save();
        return [];
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
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
__decorate([
    type_graphql_1.Mutation(returns => Play_1.Play, {
        description: "Adds an episode to a player's queue"
    }),
    __param(0, type_graphql_1.Arg('slug')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "addToBeginningOfQueue", null);
__decorate([
    type_graphql_1.Mutation(returns => Play_1.Play),
    __param(0, type_graphql_1.Arg('queue')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updatePlayerQueue", null);
__decorate([
    type_graphql_1.Mutation(returns => Number),
    __param(0, type_graphql_1.Arg('speed')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePlayingSpeed", null);
__decorate([
    type_graphql_1.Mutation(returns => Play_1.Play),
    __param(0, type_graphql_1.Arg('playId')),
    __param(1, type_graphql_1.Arg('position')),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updatePosition", null);
__decorate([
    type_graphql_1.Mutation(returns => [Play_1.Play]),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "clearQueue", null);
UserResolver = __decorate([
    type_graphql_1.Resolver(of => User_1.User)
], UserResolver);
exports.default = UserResolver;
