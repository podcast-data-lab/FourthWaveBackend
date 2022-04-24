import { GraphQLError } from 'graphql'
import { ObjectId } from 'mongodb'
import { firebaseAuth } from '../lib/firebase'
import { UserModel } from '../models'
import { LibraryModel } from '../models/Library'
import { User } from '../models/User'
import { captureException } from '@sentry/node'
import { UserContext } from '../models/Context'

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
}

/**
 * Verifies if a token is valid, otherwise throws an error
 * @param token
 */
export const verifyTokenAndGetUser = async (token: string): Promise<Omit<UserContext, 'roles'>> => {
    try {
        const verifiedToken = await firebaseAuth.verifyIdToken(token)
        let user = await UserModel.findOne({ uid: verifiedToken.uid, email: verifiedToken.email })
        let library

        if (!user) {
            user = new UserModel({
                uid: verifiedToken.uid,
                email: verifiedToken.email,
            })
            library = new LibraryModel({})
            user.library = library._id
            await library.save()
            await user.save()
        } else {
            library = await LibraryModel.findById({ _id: new ObjectId(user.library as any) })
            if (!library) {
                library = new LibraryModel({})
                user.library = library._id
                await library.save()
                await user.save()
            }
        }
        return { user, library }
    } catch (e) {
        captureException(e)
        throw new Error(e)
    }
}
