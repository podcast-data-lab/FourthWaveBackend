import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { UserContext } from '../../models/Context'
import { UserPreference, UserPreferenceModel } from '../../models/Preference'
import { DocumentType } from '@typegoose/typegoose'

@Resolver((of) => UserPreference)
export class PreferencesResolver {
    @Query((returns) => UserPreference, { description: "Gets a user' preferences." })
    async getUserPreferences(@Ctx() { user }: UserContext): Promise<UserPreference> {
        let preferences = await UserPreferenceModel.findById<DocumentType<UserPreference>>({ _id: user.preferences })
        return preferences
    }

    @Mutation((returns) => UserPreference, { description: 'Sets a user Volume.' })
    async setUserVolume(@Arg('volume') volume: number, @Ctx() { user }: UserContext): Promise<UserPreference> {
        let preferences = await UserPreferenceModel.findById<DocumentType<UserPreference>>({ _id: user.preferences })
        preferences.speed = volume
        return preferences
    }

    @Mutation((returns) => UserPreference, {
        description: "Changes a user's playing speed.",
    })
    async changePlayingSpeed(@Arg('speed') speed: number, @Ctx() { user }: UserContext): Promise<UserPreference> {
        let preferences = await UserPreferenceModel.findById<DocumentType<UserPreference>>({ _id: user.preferences })
        preferences.speed = speed
        return preferences
    }

    @Mutation((returns) => UserPreference, {
        description: 'Sets whether or not to trim silence for an podcast episode',
    })
    async setTrimSilence(@Arg('trimSilence') trimSilence: boolean, @Ctx() { user }: UserContext): Promise<UserPreference> {
        let preferences = await UserPreferenceModel.findById<DocumentType<UserPreference>>({ _id: user.preferences })
        preferences.trimSilence = trimSilence
        return preferences
    }

    @Mutation((returns) => UserPreference, {
        description: 'Sets whether or not to skip ads in an episode.',
    })
    async setSkipAds(@Arg('skipAds') skipAds: boolean, @Ctx() { user }: UserContext): Promise<UserPreference> {
        let preferences = await UserPreferenceModel.findById<DocumentType<UserPreference>>({ _id: user.preferences })
        preferences.skipAds = skipAds
        return preferences
    }
}
