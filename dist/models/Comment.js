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
exports.CommentModel = exports.Comment = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
const Podcast_1 = require("./Podcast");
const Theme_1 = require("./Theme");
const User_1 = require("./User");
let Comment = class Comment {
};
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop({ type: String, required: true }),
    __metadata("design:type", String)
], Comment.prototype, "content", void 0);
__decorate([
    type_graphql_1.Field((type) => Theme_1.Theme),
    typegoose_1.prop({ ref: () => Theme_1.Theme }),
    __metadata("design:type", Array)
], Comment.prototype, "theme", void 0);
__decorate([
    type_graphql_1.Field((type) => Podcast_1.Podcast),
    typegoose_1.prop({ ref: () => Podcast_1.Podcast }),
    __metadata("design:type", Object)
], Comment.prototype, "podcast", void 0);
__decorate([
    type_graphql_1.Field((type) => User_1.User),
    typegoose_1.prop({ type: () => User_1.User }),
    __metadata("design:type", Object)
], Comment.prototype, "userId", void 0);
__decorate([
    type_graphql_1.Field((type) => [User_1.User]),
    typegoose_1.prop({ ref: () => User_1.User }),
    __metadata("design:type", Array)
], Comment.prototype, "likes", void 0);
Comment = __decorate([
    type_graphql_1.ObjectType()
], Comment);
exports.Comment = Comment;
exports.CommentModel = typegoose_1.getModelForClass(Comment);
