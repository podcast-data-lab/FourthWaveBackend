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
const type_graphql_1 = require("type-graphql");
const functions_1 = require("../../lib/functions");
const Episode_1 = require("../../models/Episode");
const Podcast_1 = require("../../models/Podcast");
let PodcastResolver = class PodcastResolver {
    async getPodcasts(page) {
        const podcasts = await Podcast_1.PodcastModel.find()
            .skip(50 * page)
            .limit(50);
        return podcasts;
    }
    async getPodcastEpisodes(slug, page) {
        const episodes = await Episode_1.EpisodeModel.find({
            podcast: slug
        })
            .sort({ datePublished: -1 })
            .skip(15 * page)
            .limit(15);
        return episodes;
    }
    async getPodcast(slug) {
        const podcast = await Podcast_1.PodcastModel.findOne({ slug: `${slug}` });
        return podcast;
    }
    async findPodcasts(searchString) {
        const regex = new RegExp(`^${searchString}`);
        const podcasts = await Podcast_1.PodcastModel.find({
            title: { $regex: regex, $options: 'ix' }
        });
        return podcasts;
    }
    async rerunPods() {
        return 'working';
    }
    async generatePalettes(slug) {
        const podcast = await Podcast_1.PodcastModel.findOne({ slug: slug });
        functions_1.getImagePalettes(podcast);
        return 'generating palettes';
    }
};
__decorate([
    type_graphql_1.Query(returns => [Podcast_1.Podcast], { description: 'Get all podcasts' }),
    __param(0, type_graphql_1.Arg('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PodcastResolver.prototype, "getPodcasts", null);
__decorate([
    type_graphql_1.Query(returs => [Episode_1.Episode], { description: "Returns a podcasts'episodes" }),
    __param(0, type_graphql_1.Arg('slug')),
    __param(1, type_graphql_1.Arg('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PodcastResolver.prototype, "getPodcastEpisodes", null);
__decorate([
    type_graphql_1.Query(returns => Podcast_1.Podcast, {
        description: "Find a podcast based on it's slug"
    }),
    __param(0, type_graphql_1.Arg('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PodcastResolver.prototype, "getPodcast", null);
__decorate([
    type_graphql_1.Query(returns => [Podcast_1.Podcast], {
        description: 'Searches for a podcast based on a search string'
    }),
    __param(0, type_graphql_1.Arg('searchString')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PodcastResolver.prototype, "findPodcasts", null);
__decorate([
    type_graphql_1.Mutation(returns => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PodcastResolver.prototype, "rerunPods", null);
__decorate([
    type_graphql_1.Mutation(returns => String),
    __param(0, type_graphql_1.Arg('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PodcastResolver.prototype, "generatePalettes", null);
PodcastResolver = __decorate([
    type_graphql_1.Resolver(of => Podcast_1.Podcast)
], PodcastResolver);
exports.default = PodcastResolver;
