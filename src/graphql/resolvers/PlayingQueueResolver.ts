import { Resolver, Mutation, Arg, Ctx, Query } from 'type-graphql'
import { EpisodeModel, PlayModel, UserModel } from '../../models'
import { UserContext } from '../../models/Context'
import { LibraryModel } from '../../models/Library'
import { Play } from '../../models/Play'
import { getUserWithPlayingQueue } from './helpers'

@Resolver((of) => Play)
export class PlayingQueueResolver {
    @Mutation((returns) => Play, {
        description: 'Starts the playing of a Play object',
    })
    async startPlay(@Arg('slug') slug: string, @Ctx() context): Promise<Play> {
        const user = context

        const episode = await EpisodeModel.findOne({ slug: slug })
        const play = new PlayModel({
            episode,
            position: 0,
            started: true,
            completed: false,
        })

        if (!episode.plays) episode.plays = []
        if (!user.plays) user.plays = []
        episode.plays.push(play)
        user.plays.push(play)

        await episode.save()
        await play.save()
        await user.save()

        return play
    }

    @Mutation((returns) => Play, {
        description: 'Updates the play position of a Play object',
    })
    async updatePlayPosition(@Arg('position') position: number, @Arg('playId') playId: number) {
        const play = await PlayModel.findById(playId)
        if (play.position > 0 && play.started == false) play.started = true
        play.position = position

        await play.save()
        return play
    }

    @Query((returns) => [Play], { description: "Returns a user's player queue" })
    async getUserQueue(@Ctx() { library }: UserContext): Promise<Play[]> {
        const queue = await LibraryModel.aggregate([
            { $match: { _id: library._id } },
            {
                $lookup: {
                    from: 'plays',
                    foreignField: '_id',
                    localField: 'queue',
                    as: 'queue',
                },
            },
            { $unwind: '$queue' },
            {
                $replaceWith: '$queue',
            },
        ])
        return queue
    }

    @Mutation((returns) => [Play], {
        description: "Adds an episode to a player's queue",
    })
    async addToPlayerQueue(@Arg('slug') slug: string, @Ctx() { user: { _id } }: UserContext): Promise<Play[]> {
        const episode = await EpisodeModel.findOne({ slug: slug })
        const play = new PlayModel({
            episode: episode,
            position: 0,
            started: false,
            completed: false,
        })
        let user = await getUserWithPlayingQueue(_id)

        episode.plays.push(play._id)
        user.plays.push(play._id)
        user.queue.push(play)

        await user.save()
        await episode.save()
        await play.save()

        return user.queue
    }

    @Mutation((returns) => Play, {
        description: "Adds an episode to a player's queue",
    })
    async addToBeginningOfQueue(@Arg('slug') slug: string, @Ctx() { user: { _id } }: UserContext): Promise<Play> {
        TODO: 'Check if the episode is already in the users queue!!!'
        const episode = await EpisodeModel.findOne({ slug: slug })
        const play = new PlayModel({
            episode: episode,
            position: 0,
            started: false,
            completed: false,
        })
        let user = await getUserWithPlayingQueue(_id)
        episode.plays.push(play._id)
        user.plays.push(play._id)
        user.queue.unshift(play._id)

        await user.save()
        await episode.save()
        await play.save()

        return play
    }

    @Mutation((returns) => Play, { description: "Updates a user's player queue" })
    async updatePlayerQueue(@Arg('queue') queue: string, @Ctx() context): Promise<Play[]> {
        const user = context

        const userDeets = await UserModel.aggregate([
            { $match: { username: context.username } },
            {
                $lookup: {
                    from: 'plays',
                    foreignField: '_id',
                    localField: 'queue',
                    as: 'queue',
                },
            },
        ])

        return userDeets[0].queue
    }

    @Mutation((returns) => Play, {
        description: "Updates the position of a user's Play object",
    })
    async updatePosition(@Arg('playId') playId: string, @Arg('position') position: number, @Ctx() context): Promise<Play> {
        const play = await PlayModel.findById(playId)
        play.position = position

        await play.save()

        const userDeets = await UserModel.aggregate([
            { $match: { username: context.username } },
            {
                $lookup: {
                    from: 'plays',
                    foreignField: '_id',
                    localField: 'queue',
                    as: 'queue',
                },
            },
        ])

        return userDeets[0].queue[0]
    }

    @Mutation((returns) => [Play], {
        description: 'completes the currently playing item and loads the current queue',
    })
    async completeAndGoToNext(@Arg('playId') playId: string, @Ctx() { user: { _id } }: UserContext): Promise<Play[]> {
        const play = await PlayModel.findById(playId)
        play.completed = true

        await play.save()
        const user = await getUserWithPlayingQueue(_id)

        if (user.queue.length == 1) user.queue = []
        else user.queue.shift()

        // await user.save()
        return user.queue as Play[]
    }
    @Mutation((returns) => [Play], {
        description: "Deletes/Clears a user's playing queue",
    })
    async clearQueue(@Ctx() context): Promise<Play[]> {
        const user = context
        user.queue = []
        await user.save()

        return []
    }
}
