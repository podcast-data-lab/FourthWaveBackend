import { Resolver, Mutation, Arg, Ctx, Query, InputType, Field, Authorized } from 'type-graphql'
import { EpisodeModel, PlayModel, UserModel } from '../../models'
import { UserContext } from '../../models/Context'
import { Play } from '../../models/Play'
import { PlayingQueue, PlayingQueueModel } from '../../models/PlayingQueue'
import { DocumentType, Ref } from '@typegoose/typegoose'

@InputType()
class QueueInput {
    @Field(() => [String])
    public plays: string[]
}

@Resolver((of) => PlayingQueue)
export class PlayingQueueResolver {
    @Authorized()
    @Mutation((returns) => PlayingQueue, {
        description: 'Starts the playing of a Play object',
    })
    async startPlay(@Arg('slug') slug: string, @Ctx() { playingQueue }: UserContext): Promise<PlayingQueue> {
        const episode = await EpisodeModel.findOne({ slug: slug })
        const play = new PlayModel({
            episode,
            position: 0,
            started: true,
            completed: false,
        })

        playingQueue.plays.unshift(play._id)
        await playingQueue.save()
        return playingQueue
    }

    @Authorized()
    @Mutation((returns) => Play, {
        description: 'Updates the play position of a Play object',
    })
    async updatePlayPosition(@Arg('position') position: number, @Arg('playId') playId: number) {
        const play = await PlayModel.findById<DocumentType<Play>>(playId)
        if (play.position > 0 && play.started == false) play.started = true
        play.position = position

        await play.save()
        return play
    }

    @Authorized()
    @Query((returns) => [PlayingQueue], { description: "Returns a user's player queue" })
    async getUserQueue(@Ctx() { playingQueue }: UserContext): Promise<PlayingQueue> {
        return getCompleteQueue(playingQueue._id)
    }

    @Authorized()
    @Mutation((returns) => [PlayingQueue], {
        description: "Adds an episode to a player's queue",
    })
    async addToPlayerQueue(@Arg('slug') slug: string, @Ctx() { playingQueue }: UserContext): Promise<PlayingQueue> {
        const episode = await EpisodeModel.findOne({ slug: slug })
        const play = new PlayModel({
            episode: episode,
            position: 0,
            started: false,
            completed: false,
        })
        playingQueue.plays.push(play._id)
        await playingQueue.save()
        return playingQueue
    }

    @Authorized()
    @Mutation((returns) => PlayingQueue, {
        description: "Adds an episode to a player's queue",
    })
    async addToBeginningOfQueue(@Arg('slug') slug: string, @Ctx() { playingQueue }: UserContext): Promise<PlayingQueue> {
        const episode = await EpisodeModel.findOne({ slug: slug })
        const completeQueue = await getCompleteQueue(playingQueue._id)
        //@ts-ignore
        let play = completeQueue.plays.find<DocumentType<Play>>((play) => play.episode === slug)
        if (!play) {
            play = new PlayModel({
                episode: episode,
                position: 0,
                started: false,
                completed: false,
            })
            playingQueue.plays.unshift(play._id)
        } else {
            let playIndx = completeQueue.plays.indexOf(play)
            completeQueue.plays.splice(playIndx, 1)
            playingQueue.plays.unshift(play._id)
        }
        await playingQueue.save()
        return playingQueue
    }

    @Mutation((returns) => Play, {
        description: "Updates the position of a user's Play object",
    })
    async updatePosition(@Arg('playId') playId: string, @Arg('position') position: number): Promise<Play> {
        const play = await PlayModel.findById(playId)
        play.position = position
        await play.save()
        return play
    }

    @Authorized()
    @Mutation((returns) => [PlayingQueue], {
        description: 'completes the currently playing item and loads the current queue',
    })
    async completeAndGoToNext(@Arg('playId') playId: string, @Ctx() { playingQueue }: UserContext): Promise<PlayingQueue> {
        const play = await PlayModel.findById(playId)
        play.completed = true
        await play.save()

        playingQueue.plays.shift()
        await playingQueue.save()
        return getCompleteQueue(playingQueue._id)
    }

    @Authorized()
    @Mutation((returns) => [PlayingQueue], {
        description: "Rearrange items in the player's queue",
    })
    async rearrangeQueue(@Arg('queue') queue: QueueInput, @Ctx() { playingQueue }: UserContext): Promise<PlayingQueue> {
        let tempQueue = []
        for (let playId of queue.plays) {
            const play = await PlayModel.findById(playId)
            tempQueue.push(play)
        }
        playingQueue.plays = tempQueue

        return getCompleteQueue(playingQueue._id)
    }

    @Authorized()
    @Mutation((returns) => [PlayingQueue], {
        description: "Deletes/Clears a user's playing queue",
    })
    async clearQueue(@Ctx() { playingQueue }: UserContext): Promise<PlayingQueue> {
        playingQueue.plays = []
        await playingQueue.save()
        return playingQueue
    }
}

export async function getCompleteQueue(_id: string): Promise<DocumentType<PlayingQueue>> {
    let queues = await PlayingQueueModel.aggregate<DocumentType<PlayingQueue>>([
        { $match: { _id } },
        {
            $lookup: {
                from: 'plays',
                foreignField: '_id',
                localField: 'plays',
                as: 'plays',
                pipeline: [
                    {
                        $lookup: {
                            from: 'episodes',
                            foreignField: '_id',
                            localField: 'episode',
                            as: 'episode',
                        },
                    },
                ],
            },
        },
    ])
    return queues[0]
}
