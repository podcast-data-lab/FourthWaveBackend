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
const User_1 = require("./../../models/User");
const type_graphql_1 = require("type-graphql");
const User_2 = require("../../models/User");
const graphql_1 = require("graphql");
let UserSignUpArgs = class UserSignUpArgs {
};
__decorate([
    type_graphql_1.Field((type) => String, { nullable: false }),
    __metadata("design:type", String)
], UserSignUpArgs.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field((type) => String, { nullable: false }),
    __metadata("design:type", String)
], UserSignUpArgs.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field((type) => String, { nullable: false }),
    __metadata("design:type", String)
], UserSignUpArgs.prototype, "firstname", void 0);
__decorate([
    type_graphql_1.Field((type) => String, { nullable: true }),
    __metadata("design:type", String)
], UserSignUpArgs.prototype, "lastname", void 0);
__decorate([
    type_graphql_1.Field((type) => String, { nullable: true }),
    __metadata("design:type", String)
], UserSignUpArgs.prototype, "password", void 0);
UserSignUpArgs = __decorate([
    type_graphql_1.ArgsType()
], UserSignUpArgs);
let UserResolver = class UserResolver {
    async signup({ username, email, firstname, lastname, password }) {
        const user = new User_1.UserModel({
            username: username,
            email: email,
            firstname: firstname,
            lastname: lastname,
            password: password,
        });
        try {
            await user.save();
        }
        catch (error) {
            console.log(error);
            return new graphql_1.GraphQLError(error.message);
        }
        return JSON.stringify(user);
    }
    async signin(username, password) {
        return "signedin";
    }
};
__decorate([
    type_graphql_1.Mutation((returns) => String),
    __param(0, type_graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserSignUpArgs]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "signup", null);
__decorate([
    type_graphql_1.Mutation((returns) => String),
    __param(0, type_graphql_1.Arg('username')), __param(1, type_graphql_1.Arg("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "signin", null);
UserResolver = __decorate([
    type_graphql_1.Resolver((of) => User_2.User)
], UserResolver);
exports.default = UserResolver;
