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
exports.TopicModel = exports.Topic = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
const Episode_1 = require("./Episode");
const Podcast_1 = require("./Podcast");
let Topic = class Topic {
};
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Topic.prototype, "type", void 0);
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop(),
    __metadata("design:type", String)
], Topic.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(type => [Episode_1.Episode]),
    typegoose_1.prop({ ref: 'Episode', default: [] }),
    __metadata("design:type", Array)
], Topic.prototype, "episodes", void 0);
__decorate([
    type_graphql_1.Field(type => [Podcast_1.Podcast]),
    typegoose_1.prop({ ref: 'Podcast', default: [] }),
    __metadata("design:type", Array)
], Topic.prototype, "podcasts", void 0);
Topic = __decorate([
    type_graphql_1.ObjectType()
], Topic);
exports.Topic = Topic;
exports.TopicModel = typegoose_1.getModelForClass(Topic);
