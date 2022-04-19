import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { UserPreference } from '../../models/Preference'

@Resolver((of) => UserPreference)
export class PreferencesResolver {
    @Mutation((returns) => Number, { description: 'Sets a user Volume' })
    async setUserVolume(@Arg('volume') volume: number, @Ctx() context): Promise<number> {
        const user = context
        user.volume = volume
        await user.save()

        return volume
    }

    @Mutation((returns) => Number, {
        description: "Changes a user's playing speed",
    })
    async changePlayingSpeed(@Arg('speed') speed: number, @Ctx() context): Promise<Number> {
        const user = context

        user.playingSpeed = speed
        await user.save()
        return user.playingSpeed
    }
}
