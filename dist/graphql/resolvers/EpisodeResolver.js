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
const Episode_1 = require("../../models/Episode");
let EpisodeResolver = class EpisodeResolver {
    async findEpisodes(searchString) {
        const searchResult = await Episode_1.EpisodeModel.aggregate([
            {
                $search: {
                    index: 'episodes',
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
                    sourceUrl: 1,
                    image: 1,
                    datePublished: 1,
                    duration: 1,
                    podcast: 1,
                    _id: 0,
                    score: { $meta: 'searchScore' }
                }
            }
        ]);
        console.log('result : ');
        console.log(searchResult);
        return searchResult;
    }
    async topEpisodes() {
        const eps = await Episode_1.EpisodeModel.find({})
            .limit(5)
            .skip(120);
        return eps;
    }
};
__decorate([
    type_graphql_1.Query(returns => [Episode_1.Episode], {
        description: 'Find episodes based on a search string'
    }),
    __param(0, type_graphql_1.Arg('searchString')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EpisodeResolver.prototype, "findEpisodes", null);
__decorate([
    type_graphql_1.Query(returns => [Episode_1.Episode], {
        description: 'Returns the Most Popular Podcast Episodes'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EpisodeResolver.prototype, "topEpisodes", null);
EpisodeResolver = __decorate([
    type_graphql_1.Resolver(of => Episode_1.Episode)
], EpisodeResolver);
exports.default = EpisodeResolver;
