import { GraphQLError } from 'graphql'
import { Resolver, Mutation, Ctx, ObjectType, Field, Authorized } from 'type-graphql'
import { UserModel } from '../../models'
import { UserContext } from '../../models/Context'
import { UserPermission } from '../../models/enums/Permissions'
import { Library } from '../../models/Library'
import { PlayingQueue } from '../../models/PlayingQueue'
import { UserPreference, UserPreferenceModel } from '../../models/Preference'
import { User } from '../../models/User'
import { getFullLibrary } from './LibraryResolver'
import { getCompleteQueue } from './PlayingQueueResolver'

@ObjectType()
class AuthOutput {
    @Field()
    user: User
    @Field()
    preferences: UserPreference
    @Field()
    library: Library
    @Field()
    playingQueue: PlayingQueue
}

@Resolver((of) => User)
export default class AuthResolver {
    @Authorized([UserPermission.User])
    @Mutation((returns) => AuthOutput)
    async signUpOrIn(@Ctx() context: UserContext): Promise<AuthOutput | GraphQLError> {
        return getUserData(context)
    }
}

async function getUserData(context: UserContext): Promise<AuthOutput> {
    let users = await UserModel.find({ uid: context.user.uid })
    let user = users[0] as any
    let playingQueue = await getCompleteQueue(context.playingQueue._id)
    let library = await getFullLibrary(context.library._id)
    let preferences = await UserPreferenceModel.findById({ _id: user.preferences })
    return { user: user._doc, preferences, library, playingQueue }
}
