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
exports.Play = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
const Episode_1 = require("./Episode");
let Play = class Play {
};
__decorate([
    type_graphql_1.Field(type => Episode_1.Episode, { description: 'The slug of the epiosde' }),
    typegoose_1.prop({ type: () => Episode_1.Episode }),
    __metadata("design:type", Episode_1.Episode)
], Play.prototype, "episode", void 0);
__decorate([
    type_graphql_1.Field(type => Number),
    typegoose_1.prop({ type: () => Number }),
    __metadata("design:type", Number)
], Play.prototype, "position", void 0);
__decorate([
    type_graphql_1.Field(type => Boolean),
    typegoose_1.prop({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], Play.prototype, "started", void 0);
__decorate([
    type_graphql_1.Field(type => Boolean, { nullable: true }),
    typegoose_1.prop({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], Play.prototype, "completed", void 0);
Play = __decorate([
    type_graphql_1.ObjectType()
], Play);
exports.Play = Play;
