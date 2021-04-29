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
exports.PodcastModel = exports.Podcast = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
const Episode_1 = require("./Episode");
let Podcast = class Podcast {
};
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Podcast.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Podcast.prototype, "publisher", void 0);
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Podcast.prototype, "rssFeed", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Podcast.prototype, "link", void 0);
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Podcast.prototype, "image", void 0);
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Podcast.prototype, "description", void 0);
__decorate([
    type_graphql_1.Field((type) => [String]),
    typegoose_1.prop({ type: () => [String] }),
    __metadata("design:type", Array)
], Podcast.prototype, "palette", void 0);
__decorate([
    type_graphql_1.Field((type) => Date),
    typegoose_1.prop({ type: () => Date }),
    __metadata("design:type", Date)
], Podcast.prototype, "lastRssBuildDate", void 0);
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop({
        type: String,
        required: true,
        unique: true,
    }),
    __metadata("design:type", String)
], Podcast.prototype, "slug", void 0);
__decorate([
    type_graphql_1.Field((type) => [String]),
    typegoose_1.prop({ type: () => [String] }),
    __metadata("design:type", Array)
], Podcast.prototype, "categories", void 0);
__decorate([
    type_graphql_1.Field((type) => [Episode_1.Episode]),
    typegoose_1.prop({ ref: () => "Episode" }),
    __metadata("design:type", Object)
], Podcast.prototype, "episodes", void 0);
Podcast = __decorate([
    type_graphql_1.ObjectType()
], Podcast);
exports.Podcast = Podcast;
exports.PodcastModel = typegoose_1.getModelForClass(Podcast);
