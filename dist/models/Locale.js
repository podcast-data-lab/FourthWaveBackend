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
exports.LocationModel = exports.Locale = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
const Comment_1 = require("./Comment");
const Episode_1 = require("./Episode");
const User_1 = require("./User");
let Locale = class Locale {
};
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop({
        type: String,
        required: true,
        unique: true,
    }),
    __metadata("design:type", String)
], Locale.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field((type) => User_1.User),
    typegoose_1.prop({ ref: "User" }),
    __metadata("design:type", Object)
], Locale.prototype, "contributor", void 0);
__decorate([
    type_graphql_1.Field((type) => [Episode_1.Episode]),
    typegoose_1.prop({ ref: "Episode" }),
    __metadata("design:type", Array)
], Locale.prototype, "podcastEpisodes", void 0);
__decorate([
    type_graphql_1.Field((type) => [Comment_1.Comment]),
    typegoose_1.prop({ ref: "Comment" }),
    __metadata("design:type", Array)
], Locale.prototype, "comments", void 0);
__decorate([
    typegoose_1.prop({
        type: String,
        required: true,
        unique: true,
    }),
    __metadata("design:type", String)
], Locale.prototype, "slug", void 0);
Locale = __decorate([
    type_graphql_1.ObjectType()
], Locale);
exports.Locale = Locale;
exports.LocationModel = typegoose_1.getModelForClass(Locale);
