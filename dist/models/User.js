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
exports.UserModel = exports.User = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const type_graphql_1 = require("type-graphql");
const Episode_1 = require("./Episode");
const Podcast_1 = require("./Podcast");
const emailValidator = require("email-validator");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 12;
let User = class User {
    constructor() {
        this.comparePassword = async function comparePassword(candidate) {
            return bcrypt.compare(candidate, this.password);
        };
    }
};
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop(),
    __metadata("design:type", String)
], User.prototype, "firstname", void 0);
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop(),
    __metadata("design:type", String)
], User.prototype, "lastname", void 0);
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop({ required: true, minlength: 4, unique: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop({
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: emailValidator.validate,
            message: (props) => `${props.value} is not a valid email address`,
        },
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(),
    typegoose_1.prop({
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 8,
    }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    type_graphql_1.Field((type) => [String]),
    typegoose_1.prop({ type: () => [String] }),
    __metadata("design:type", Array)
], User.prototype, "contributions", void 0);
__decorate([
    type_graphql_1.Field((type) => [Podcast_1.Podcast]),
    typegoose_1.prop({ ref: "Podcast" }),
    __metadata("design:type", Array)
], User.prototype, "podcastLikes", void 0);
__decorate([
    type_graphql_1.Field((type) => [Episode_1.Episode]),
    typegoose_1.prop({ ref: "Episode" }),
    __metadata("design:type", Array)
], User.prototype, "likedEpisodes", void 0);
User = __decorate([
    typegoose_1.pre("save", async function preSave(next) {
        const user = this;
        if (!user.isModified("password"))
            return next();
        try {
            const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
            user.password = hash;
            return next();
        }
        catch (err) {
            return next(err);
        }
    }),
    type_graphql_1.ObjectType()
], User);
exports.User = User;
exports.UserModel = typegoose_1.getModelForClass(User);
