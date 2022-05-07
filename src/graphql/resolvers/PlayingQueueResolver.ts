import { Resolver, Mutation, Arg, Ctx, Query, InputType, Field, Authorized } from 'type-graphql'
import { EpisodeModel, PlayModel, UserModel } from '../../models'
import { UserContext } from '../../models/Context'
import { Play } from '../../models/Play'
import { PlayingQueue, PlayingQueueModel } from '../../models/PlayingQueue'
import { DocumentType, Ref } from '@typegoose/typegoose'
import { insert, remove } from 'ramda'
import { ObjectId } from 'mongodb'

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
        let play = await getPlayForEpisodeInPlayingQueue(playingQueue._id, episode._id)
        console.log(play)
        if (!play) {
            play = new PlayModel({
                episode: episode._id,
                position: 0,
                started: true,
                completed: false,
            })

            await play.save()
            playingQueue.plays = insert(0, play, playingQueue.plays)
            await playingQueue.save()
        } else {
            PlayModel.findOneAndUpdate({ _id: play._id }, { started: true })
            playingQueue.plays = insert(0, play, playingQueue.plays)
            await playingQueue.save()
        }
        // else, place the play in the front of the queue
        return getCompleteQueue(playingQueue._id)
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
    @Query((returns) => PlayingQueue, { description: "Returns a user's player queue" })
    async getUserQueue(@Ctx() { playingQueue }: UserContext): Promise<PlayingQueue> {
        return getCompleteQueue(playingQueue._id)
    }

    @Authorized()
    @Mutation((returns) => PlayingQueue, {
        description: "Adds an episode to a player's queue",
    })
    async addToBeginningOfQueue(@Arg('slug') slug: string, @Ctx() { playingQueue }: UserContext): Promise<PlayingQueue> {
        const episode = await EpisodeModel.findOne({ slug: slug })
        let playInQueue = await getPlayForEpisodeInPlayingQueue(playingQueue._id, episode._id)
        if (!playInQueue) {
            const play = new PlayModel({
                episode: episode._id,
                position: 0,
                started: true,
                completed: false,
            })

            await play.save()
            playingQueue.plays = insert(1, play._id, playingQueue.plays)
            await playingQueue.save()
        } else {
            playInQueue.started = true
            await playingQueue.save()
            let playIndx = playingQueue.plays.indexOf(playInQueue._id)
            let playId = playingQueue.plays[playIndx]
            playingQueue.plays = remove(playIndx, 1, playingQueue.plays)
            playingQueue.plays = insert(1, playId, playingQueue.plays)
            await playingQueue.save()
        }
        return getCompleteQueue(playingQueue._id)
    }

    @Authorized()
    @Mutation((returns) => PlayingQueue, {
        description: "Adds an episode to a player's queue",
    })
    async addToEndOfQueue(@Arg('slug') slug: string, @Ctx() { playingQueue }: UserContext): Promise<PlayingQueue> {
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
            playingQueue.plays.push(play._id)
        } else {
            let playIndx = completeQueue.plays.indexOf(play)
            completeQueue.plays.splice(playIndx, 1)
            playingQueue.plays.push(play._id)
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
    @Mutation((returns) => PlayingQueue, {
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
    @Mutation((returns) => PlayingQueue, {
        description: "Rearrange items in the player's queue",
    })
    async reorderQueue(
        @Arg('from') from: number,
        @Arg('to') to: number,
        @Ctx() { playingQueue }: UserContext,
    ): Promise<PlayingQueue> {
        let movedPlay = playingQueue.plays[from]
        playingQueue.plays = remove(from, 1, playingQueue.plays)
        playingQueue.plays = insert(to, movedPlay, playingQueue.plays)
        await playingQueue.save()
        return getCompleteQueue(playingQueue._id)
    }

    @Authorized()
    @Mutation((returns) => PlayingQueue, {
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
                let: { playIds: '$plays' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ['$_id', '$$playIds'] },
                        },
                    },
                    {
                        $lookup: {
                            from: 'episodes',
                            foreignField: '_id',
                            localField: 'episode',
                            as: 'episode',
                            pipeline: [
                                {
                                    $lookup: {
                                        from: 'podcasts',
                                        foreignField: '_id',
                                        localField: 'podcast',
                                        as: 'podcast',
                                    },
                                },
                                {
                                    $addFields: {
                                        podcast: { $first: '$podcast' },
                                    },
                                },
                                {
                                    $lookup: {
                                        from: 'authors',
                                        localField: 'author',
                                        foreignField: '_id',
                                        as: 'author',
                                    },
                                },
                                {
                                    $addFields: {
                                        author: { $first: '$author' },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            episode: { $first: '$episode' },
                        },
                    },
                    {
                        $addFields: {
                            sort: {
                                $indexOfArray: ['$$playIds', '$_id'],
                            },
                        },
                    },
                    { $sort: { sort: 1 } },
                    { $addFields: { sort: '$$REMOVE' } },
                ],
                as: 'plays',
            },
        },
    ])
    return queues[0]
}

async function getPlayForEpisodeInPlayingQueue(
    playingQueueId: string,
    episodeId: string | ObjectId,
): Promise<DocumentType<Play>> {
    const playingQueue = await PlayingQueueModel.aggregate([
        { $match: { _id: playingQueueId } },
        {
            $lookup: {
                from: 'plays',
                foreignField: '_id',
                localField: 'plays',
                as: 'plays',
                pipeline: [
                    {
                        $match: {
                            episode: episodeId,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                play: { $first: '$plays' },
            },
        },
    ])
    if (playingQueue.length > 0) {
        return playingQueue[0].play
    }
    return null
}
