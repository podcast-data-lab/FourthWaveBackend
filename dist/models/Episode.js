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
exports.EpisodeInput = exports.Episode = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
const Locale_1 = require("./Locale");
const Comment_1 = require("./Comment");
const Person_1 = require("./Person");
const Theme_1 = require("./Theme");
const User_1 = require("./User");
const Topic_1 = require("./Topic");
const Play_1 = require("./Play");
let Episode = class Episode {
};
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Episode.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(type => Date),
    typegoose_1.prop({ type: () => Date }),
    __metadata("design:type", Date)
], Episode.prototype, "datePublished", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Episode.prototype, "description", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Episode.prototype, "duration", void 0);
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Episode.prototype, "sourceUrl", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Episode.prototype, "image", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Episode.prototype, "podcast", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    typegoose_1.prop({ default: 0 }),
    __metadata("design:type", Number)
], Episode.prototype, "epNo", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    typegoose_1.prop({ default: 0 }),
    __metadata("design:type", Number)
], Episode.prototype, "snNo", void 0);
__decorate([
    type_graphql_1.Field(type => [User_1.User], { nullable: true }),
    typegoose_1.prop({ ref: () => User_1.User }),
    __metadata("design:type", Array)
], Episode.prototype, "likes", void 0);
__decorate([
    type_graphql_1.Field(type => [Topic_1.Topic]),
    typegoose_1.prop({ type: () => [Topic_1.Topic] }),
    __metadata("design:type", Array)
], Episode.prototype, "topics", void 0);
__decorate([
    type_graphql_1.Field(type => [Theme_1.Theme], { nullable: true }),
    typegoose_1.prop({ ref: () => 'Theme', default: [] }),
    __metadata("design:type", Array)
], Episode.prototype, "themes", void 0);
__decorate([
    type_graphql_1.Field(type => [Comment_1.Comment], { nullable: true }),
    typegoose_1.prop({ ref: 'Comment', default: [] }),
    __metadata("design:type", Array)
], Episode.prototype, "comments", void 0);
__decorate([
    type_graphql_1.Field(type => [Person_1.Person], { nullable: true }),
    typegoose_1.prop({ ref: 'Person', default: [] }),
    __metadata("design:type", Array)
], Episode.prototype, "people", void 0);
__decorate([
    type_graphql_1.Field(type => [Locale_1.Locale], { nullable: true }),
    typegoose_1.prop({ ref: 'Locale', default: [] }),
    __metadata("design:type", Array)
], Episode.prototype, "locations", void 0);
__decorate([
    type_graphql_1.Field(type => Play_1.Play, { nullable: true }),
    typegoose_1.prop({ ref: () => 'Play', default: 0 }),
    __metadata("design:type", Array)
], Episode.prototype, "plays", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    typegoose_1.prop({
        type: String,
        required: true
    }),
    __metadata("design:type", String)
], Episode.prototype, "slug", void 0);
Episode = __decorate([
    type_graphql_1.ObjectType()
], Episode);
exports.Episode = Episode;
let EpisodeInput = class EpisodeInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], EpisodeInput.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(type => Date),
    __metadata("design:type", Date)
], EpisodeInput.prototype, "datePublished", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], EpisodeInput.prototype, "description", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], EpisodeInput.prototype, "duration", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], EpisodeInput.prototype, "sourceUrl", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], EpisodeInput.prototype, "image", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], EpisodeInput.prototype, "podcast", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], EpisodeInput.prototype, "epNo", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], EpisodeInput.prototype, "snNo", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], EpisodeInput.prototype, "slug", void 0);
EpisodeInput = __decorate([
    type_graphql_1.InputType()
], EpisodeInput);
exports.EpisodeInput = EpisodeInput;