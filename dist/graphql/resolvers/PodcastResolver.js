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
const models_1 = require("../../models");
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
        const episodes = await models_1.EpisodeModel.aggregate([
            { $match: { podcast: slug } },
            { $sort: { datePublished: -1 } },
            {
                $lookup: {
                    from: 'topics',
                    foreignField: '_id',
                    localField: 'topics',
                    as: 'topics'
                }
            },
            {
                $skip: 15 * page
            },
            {
                $limit: 15
            }
        ]);
        return episodes;
    }
    async getPodcast(slug) {
        const podcast = await Podcast_1.PodcastModel.aggregate([
            { $match: { slug: slug } },
            {
                $lookup: {
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'categories',
                    as: 'categories'
                }
            },
            {
                $lookup: {
                    from: 'topics',
                    foreignField: '_id',
                    localField: 'topics',
                    as: 'topics'
                }
            },
            {
                $lookup: {
                    from: 'episodes',
                    foreignField: '_id',
                    localField: 'episodes',
                    as: 'episodes'
                }
            },
            {
                $limit: 10
            }
        ]);
        return podcast[0];
    }
    async findPodcasts(searchString) {
        const podcasts = await Podcast_1.PodcastModel.aggregate([
            {
                $search: {
                    index: 'podcasts',
                    compound: {
                        should: [
                            {
                                autocomplete: {
                                    query: searchString,
                                    path: 'title',
                                    fuzzy: {
                                        maxEdits: 2,
                                        prefixLength: 3
                                    }
                                }
                            },
                            {
                                autocomplete: {
                                    query: searchString,
                                    path: 'description',
                                    fuzzy: {
                                        maxEdits: 2,
                                        prefixLength: 3
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    link: 1,
                    image: 1,
                    datePublished: 1,
                    duration: 1,
                    podcast: 1,
                    palette: 1,
                    slug: 1,
                    categories: 1,
                    topics: 1,
                    _id: 0,
                    score: { $meta: 'searchScore' }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'categories',
                    as: 'categories'
                }
            }
        ]);
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
    async getFeatured() {
        const pods = await Podcast_1.PodcastModel.aggregate([
            { $sample: { size: 7 } },
            {
                $lookup: {
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'categories',
                    as: 'categories'
                }
            },
            {
                $lookup: {
                    from: 'topics',
                    foreignField: '_id',
                    localField: 'topics',
                    as: 'topics'
                }
            }
        ]);
        return pods;
    }
    async getTrending() {
        const pods = await Podcast_1.PodcastModel.aggregate([
            { $sample: { size: 5 } },
            {
                $lookup: {
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'categories',
                    as: 'categories'
                }
            },
            {
                $lookup: {
                    from: 'topics',
                    foreignField: '_id',
                    localField: 'topics',
                    as: 'topics'
                }
            }
        ]);
        return pods;
    }
    async getTopPlayed() {
        const pods = await Podcast_1.PodcastModel.aggregate([
            { $sample: { size: 5 } },
            {
                $lookup: {
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'categories',
                    as: 'categories'
                }
            },
            {
                $lookup: {
                    from: 'topics',
                    foreignField: '_id',
                    localField: 'topics',
                    as: 'topics'
                }
            }
        ]);
        return pods;
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
    type_graphql_1.Mutation(returns => String, {
        description: 'Generates the palettes of a podcast based on the podcasts image'
    }),
    __param(0, type_graphql_1.Arg('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PodcastResolver.prototype, "generatePalettes", null);
__decorate([
    type_graphql_1.Query(returns => [Podcast_1.Podcast], { description: 'Returns the featured podcasts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PodcastResolver.prototype, "getFeatured", null);
__decorate([
    type_graphql_1.Query(returns => [Podcast_1.Podcast], { description: 'Returns the Trending Podcasts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PodcastResolver.prototype, "getTrending", null);
__decorate([
    type_graphql_1.Query(returns => [Podcast_1.Podcast], {
        description: 'Returns the Most Played Podcasts'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PodcastResolver.prototype, "getTopPlayed", null);
PodcastResolver = __decorate([
    type_graphql_1.Resolver(of => Podcast_1.Podcast)
], PodcastResolver);
exports.default = PodcastResolver;
