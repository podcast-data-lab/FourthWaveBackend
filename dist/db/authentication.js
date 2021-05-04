"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genPassword = exports.resetPassword = exports.getAuthenticatedUser = exports.verifyToken = exports.generateToken = exports.authenticateUser = void 0;
const graphql_1 = require("graphql");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
// let conf = require("dotenv").config("../../").parsed;
/**
 * A function to authenticate a user
 * @param email
 * @param password
 * @returns null if a user can't be authenticated, the email and token if otherwise
 */
const authenticateUser = async (username, password) => {
    try {
        // Verify the Use
        let user = await models_1.UserModel.findOne({
            username: username
        }).exec();
        if (!user) {
            await models_1.UserModel.findOne({
                email: username
            }).exec();
        }
        if (!user) {
            return new graphql_1.GraphQLError('user does not exist');
        }
        const passwordOK = await user.comparePassword(password);
        if (!passwordOK) {
            console.log('wrong pass');
            return new graphql_1.GraphQLError('wrong password');
        }
        const token = exports.generateToken(user.username, user.admin);
        user.authtoken = token;
        await user.save();
        const userQueue = user.queue;
        let userData = await models_1.UserModel.aggregate([
            { $match: { username: user.username } },
            {
                $lookup: {
                    from: 'plays',
                    foreignField: '_id',
                    localField: 'queue',
                    as: 'queue'
                }
            }
        ]);
        userData[0].queue = userData[0].queue.sort((a, b) => userQueue.indexOf(a._id) - userQueue.indexOf(b._id));
        return userData[0];
    }
    catch (error) {
        console.log(error.message);
        return Error['INCORRECT_PASSWORD'];
    }
};
exports.authenticateUser = authenticateUser;
/**
 * Generates a JWT Token
 * @param email
 * @param password
 */
const generateToken = (username, admin) => {
    const token = jsonwebtoken_1.default.sign({
        username: username,
        admin: admin,
        iat: Math.floor(Date.now())
    }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;
};
exports.generateToken = generateToken;
/**
 * Verifies if a token is valid, otherwise throws an error
 * @param token
 */
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return decoded;
    }
    catch (e) {
        return null;
    }
};
exports.verifyToken = verifyToken;
/**
 * Retrieves an authenticated user if a token is valid
 * @param token
 */
const getAuthenticatedUser = async (token) => {
    try {
        let decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        let user = await models_1.UserModel.find({ email: decoded.email });
        return user;
    }
    catch (error) {
        console.log(error.message);
        return null;
    }
};
exports.getAuthenticatedUser = getAuthenticatedUser;
const resetPassword = async (email) => {
    // try {
    //   let user = await UserModel.findOne({ email: email })
    //   let random = Math.floor(Math.random() * passes.length)
    //   let randomPass = passes[random]
    //   user.password = randomPass
    //   await user.save()
    //   return [user.email, randomPass]
    // } catch (error) {
    //   console.log(error)
    //   return [null, null]
    // }
};
exports.resetPassword = resetPassword;
const genPassword = async (email) => {
    // let random = Math.floor(Math.random() * passes.length)
    // let randomPass = passes[random]
    // return randomPass
};
exports.genPassword = genPassword;
