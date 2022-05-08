import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { UserContext } from '../../models/Context'
import { UserPreference, UserPreferenceModel } from '../../models/Preference'
import { DocumentType } from '@typegoose/typegoose'

@Resolver((of) => UserPreference)
export class PreferencesResolver {
    @Mutation((returns) => UserPreference, { description: 'Sets a user Volume' })
    async setUserVolume(@Arg('volume') volume: number, @Ctx() { user }: UserContext): Promise<UserPreference> {
        let preferences = await UserPreferenceModel.findById<DocumentType<UserPreference>>({ _id: user.preferences })
        preferences.speed = volume
        return preferences
    }

    @Mutation((returns) => UserPreference, {
        description: "Changes a user's playing speed",
    })
    async changePlayingSpeed(@Arg('speed') speed: number, @Ctx() { user }: UserContext): Promise<UserPreference> {
        let preferences = await UserPreferenceModel.findById<DocumentType<UserPreference>>({ _id: user.preferences })
        preferences.speed = speed
        return preferences
    }
}
