import { GraphQLError } from 'graphql'
import { Resolver, Mutation, Ctx } from 'type-graphql'
import { signInOrCreateUser } from '../../db/authentication'
import { UserModel } from '../../models'
import { UserContext } from '../../models/Context'
import { UserPreferenceModel } from '../../models/Preference'
import { User } from '../../models/User'
import { getFullLibrary } from './LibraryResolver'
import { getCompleteQueue } from './PlayingQueueResolver'

@Resolver((of) => User)
export default class AuthResolver {
    @Mutation((returns) => User)
    async signUpOrIn(@Ctx() context: UserContext): Promise<User | GraphQLError> {
        return getUserData(context)
    }
}

async function getUserData(context: UserContext): Promise<User> {
    let users = await UserModel.find({ uid: context.user.uid })
    let user = users[0] as any
    let playingQueue = await getCompleteQueue(context.playingQueue._id)
    let library = await getFullLibrary(context.library._id)
    let preferences = await UserPreferenceModel.findById({ _id: user.preferences })
    return { ...user._doc, preferences, library, playingQueue }
}
