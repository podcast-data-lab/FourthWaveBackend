import { GraphQLError } from 'graphql'
import jwt from 'jsonwebtoken'
import { firebaseAuth } from '../lib/firebase'
import { UserModel } from '../models'
import { User } from '../models/User'
// let conf = require("dotenv").config("../../").parsed;

/**
 * A function to authenticate a user
 * @param email
 * @param password
 * @returns null if a user can't be authenticated, the email and token if otherwise
 */

export const signInOrCreateUser = async (uid: string, email: string): Promise<User | GraphQLError> => {
    let user = await UserModel.findOne({ uid, email })
    if (!user) {
        user = new UserModel({
            uid,
            email,
        })
        await user.save()
    }
    return user
    let usr: User[] = await UserModel.aggregate([
        { $match: { uid } },
        {
            $lookup: {
                from: 'plays',
                foreignField: '_id',
                localField: 'queue',
                as: 'queue',
            },
        },
        {
            $lookup: {
                from: 'podcasts',
                foreignField: '_id',
                localField: 'subscribedPodcasts',
                as: 'subscribedPodcasts',
            },
        },

        {
            $lookup: {
                from: 'podcasts',
                foreignField: '_id',
                localField: 'likedPodcasts',
                as: 'likedPodcasts',
            },
        },
        {
            $lookup: {
                from: 'episodes',
                foreignField: '_id',
                localField: 'likedEpisodes',
                as: 'likedEpisodes',
            },
        },

        {
            $lookup: {
                from: 'episodes',
                foreignField: '_id',
                localField: 'bookmarkedEpisodes',
                as: 'bookmarkedEpisodes',
            },
        },
        {
            $project: {
                password: 0,
            },
        },
    ])
    // usr[0].queue = usr[0].queue.sort((a: Play, b: Play) => {
    //     return userQueue.indexOf(a._id) - userQueue.indexOf(b._id)
    // })
    console.log(usr[0].queue)

    return usr[0]
}

/**
 * Verifies if a token is valid, otherwise throws an error
 * @param token
 */
export const verifyTokenAndGetUser = async (token: string): Promise<User> => {
    try {
        const verifiedToken = await firebaseAuth.verifyIdToken(token)
        let user = await UserModel.findOne({ uid: verifiedToken.uid, email: verifiedToken.email })
        if (!user) {
            user = new UserModel({
                uid: verifiedToken.uid,
                email: verifiedToken.email,
            })
            await user.save()
        }
        return user
    } catch (e) {
        throw new Error(e)
    }
}

/**
 * Retrieves an authenticated user if a token is valid
 * @param token
 */
export const getAuthenticatedUser = async (token: String) => {
    try {
        let decoded = jwt.verify(token, process.env.JWT_SECRET)
        let user = await UserModel.find({ email: decoded.email })
        return user
    } catch (error) {
        console.log(error.message)
        return null
    }
}
