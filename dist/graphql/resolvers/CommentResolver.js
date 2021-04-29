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
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const Comment_1 = require("../../models/Comment");
const Podcast_1 = require("../../models/Podcast");
let CommentResolver = class CommentResolver {
    async getComment() {
        console.log("here");
        const comment = await Comment_1.CommentModel.findOne();
        let pod = await Podcast_1.PodcastModel.find();
        console.log(pod[0].episodes[0]);
        console.log(comment);
        return comment;
    }
};
__decorate([
    type_graphql_1.Query((returns) => Comment_1.Comment, { nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "getComment", null);
CommentResolver = __decorate([
    type_graphql_1.Resolver((of) => Comment_1.Comment)
], CommentResolver);
exports.default = CommentResolver;
