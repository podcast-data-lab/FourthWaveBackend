import { GraphQLError } from 'graphql'
import { ObjectId } from 'mongodb'
import { firebaseAuth } from '../lib/firebase'
import { UserModel } from '../models'
import { LibraryModel } from '../models/Library'
import { User } from '../models/User'
import { captureException } from '@sentry/node'
import { UserContext } from '../models/Context'
import { PlayingQueueModel } from '../models/PlayingQueue'
import { UserPermission } from '../models/enums/Permissions'
import { UserPreferenceModel } from '../models/Preference'

/**
 * A function to authenticate a user
 * @param uid
 * @returns {User} - if no user was initially found, creates a new user
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
        return firebaseAuth
            .verifyIdToken(token)
            .then(async (verifiedToken) => {
                let user = await UserModel.findOne({ uid: verifiedToken.uid, email: verifiedToken.email })
                let library
                let playingQueue
                if (!user) {
                    user = new UserModel({
                        uid: verifiedToken.uid,
                        email: verifiedToken.email,
                        permissions: [UserPermission.User],
                        name: verifiedToken.name,
                    })
                    library = new LibraryModel()
                    await library.save()

                    playingQueue = new PlayingQueueModel()
                    await playingQueue.save()

                    let preferences = new UserPreferenceModel()
                    await preferences.save()

                    user.library = library
                    user.playingQueue = playingQueue._id
                    user.preferences = preferences._id
                    await user.save()
                } else {
                    library = await LibraryModel.findById({ _id: user.library })
                    if (!library) {
                        library = new LibraryModel()
                        user.library = library
                        await library.save()
                        await user.save()
                    }
                    playingQueue = await PlayingQueueModel.findById({ _id: user.playingQueue })
                    if (!playingQueue) {
                        playingQueue = new PlayingQueueModel()
                        user.playingQueue = playingQueue._id
                        await playingQueue.save()
                        await user.save()
                    }
                }
                return { user, library, playingQueue }
            })
            .catch((error) => {
                captureException(error)
                return null
            })
    } catch (e: any) {
        captureException(e)
        return null
    }
}

export async function getOrCreateTemporaryUser(deviceId: string) {
    let user = await UserModel.findOne({ deviceId })
    let library
    let playingQueue
    if (!user) {
        user = new UserModel({
            deviceId,
            active: false,
            permissions: [UserPermission.User],
        })
        library = new LibraryModel()
        await library.save()

        playingQueue = new PlayingQueueModel()
        await playingQueue.save()

        let preferences = new UserPreferenceModel()
        await preferences.save()

        user.library = library
        user.playingQueue = playingQueue._id
        user.preferences = preferences._id
        await user.save()
    } else {
        library = await LibraryModel.findById({ _id: user.library })
        if (!library) {
            library = new LibraryModel()
            user.library = library
            await library.save()
            await user.save()
        }
        playingQueue = await PlayingQueueModel.findById({ _id: user.playingQueue })
        if (!playingQueue) {
            playingQueue = new PlayingQueueModel()
            user.playingQueue = playingQueue._id
            await playingQueue.save()
            await user.save()
        }
    }
    console.log('user', user)
    return { user, library, playingQueue }
}
