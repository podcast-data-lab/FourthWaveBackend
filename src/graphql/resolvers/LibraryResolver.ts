import { Episode, EpisodeInput } from '../../models/Episode'
import { signInOrCreateUser } from '../../db/authentication'
import { UserModel, EpisodeModel, PlayModel } from '../../models'
import { Arg, Args, ArgsType, Ctx, Field, InputType, Mutation, Query, Resolver } from 'type-graphql'
import { User } from '../../models/User'
import { GraphQLError } from 'graphql'
import { Play } from '../../models/Play'
import { Podcast, PodcastModel } from '../../models/Podcast'
import { Library } from '../../models/Library'

@Resolver((of) => Library)
export default class LibraryResolver {
    @Mutation((returns) => Podcast)
    async subscribeToPodcast(@Arg('slug') slug: string, @Ctx() context): Promise<Podcast> {
        const podcasts = await PodcastModel.aggregate([
            { $match: { slug: slug } },
            {
                $lookup: {
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'categories',
                    as: 'categories',
                },
            },
            {
                $lookup: {
                    from: 'topics',
                    foreignField: '_id',
                    localField: 'topics',
                    as: 'topics',
                },
            },
            // { $project: { _id: 1 } }
        ])
        const user = context
        user.subscribedPodcasts ? user.subscribedPodcasts.push(podcasts[0]._id) : (user.subscribedPodcasts = [podcasts[0]._id])
        await user.save()
        return podcasts[0]
    }

    @Mutation((returns) => Podcast)
    async likePodcast(@Arg('slug') slug: string, @Ctx() context): Promise<Podcast> {
        const podcast = await PodcastModel.aggregate([
            { $match: { slug: slug } },
            {
                $lookup: {
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'categories',
                    as: 'categories',
                },
            },
            {
                $lookup: {
                    from: 'topics',
                    foreignField: '_id',
                    localField: 'topics',
                    as: 'topics',
                },
            },
        ])
        const user = context
        user.likedPodcasts.push(podcast[0]._id)
        await user.save()
        return podcast[0]
    }

    @Mutation((returns) => Episode)
    async likeEpisode(@Arg('slug') slug: string, @Ctx() context): Promise<Episode> {
        const episode = await EpisodeModel.aggregate([
            { $match: { slug: slug } },
            {
                $lookup: {
                    from: 'topics',
                    foreignField: '_id',
                    localField: 'topics',
                    as: 'topics',
                },
            },
        ])

        const user = context
        user.likedEpisodes.push(episode[0]._id)
        await user.save()
        return episode[0]
    }

    @Mutation((returns) => Episode)
    async bookmarkEpisode(@Arg('slug') slug: string, @Ctx() context): Promise<Episode> {
        const episode = await EpisodeModel.aggregate([
            { $match: { slug: slug } },
            {
                $lookup: {
                    from: 'topics',
                    foreignField: '_id',
                    localField: 'topics',
                    as: 'topics',
                },
            },
        ])

        const user = context
        user.bookmarkedEpisodes.push(episode[0]._id)
        await user.save()
        return episode[0]
    }

    // UNDO AN ACTION

    @Mutation((returns) => Podcast)
    async unsubscribeToPodcast(@Arg('slug') slug: string, @Ctx() context): Promise<Podcast> {
        const podcasts = await PodcastModel.aggregate([
            { $match: { slug: slug } },
            {
                $lookup: {
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'categories',
                    as: 'categories',
                },
            },
            {
                $lookup: {
                    from: 'topics',
                    foreignField: '_id',
                    localField: 'topics',
                    as: 'topics',
                },
            },
            // { $project: { _id: 1 } }
        ])

        const user = context

        const indx = user.subscribedPodcasts.findIndex((podcast_id) => podcast_id == podcasts[0]._id)

        user.subscribedPodcasts.splice(indx, 1)

        await user.save()
        return podcasts[0]
    }

    @Mutation((returns) => Podcast)
    async unlikePodcast(@Arg('slug') slug: string, @Ctx() context): Promise<Podcast> {
        const podcasts = await PodcastModel.aggregate([
            { $match: { slug: slug } },
            {
                $lookup: {
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'categories',
                    as: 'categories',
                },
            },
            {
                $lookup: {
                    from: 'topics',
                    foreignField: '_id',
                    localField: 'topics',
                    as: 'topics',
                },
            },
        ])
        const user = context

        const indx = user.subscribedPodcasts.findIndex((podcast_id) => podcast_id == podcasts[0]._id)

        user.subscribedPodcasts.splice(indx, 1)

        await user.save()
        return podcasts[0]
    }

    @Mutation((returns) => Episode)
    async unlikeEpisode(@Arg('slug') slug: string, @Ctx() context): Promise<Episode> {
        const episodes = await EpisodeModel.aggregate([
            { $match: { slug: slug } },
            {
                $lookup: {
                    from: 'topics',
                    foreignField: '_id',
                    localField: 'topics',
                    as: 'topics',
                },
            },
        ])

        const user = context

        const indx = user.likedEpisodes.findIndex((episode_id) => episode_id == episodes[0]._id)

        user.likedEpisodes.splice(indx, 1)

        await user.save()
        return episodes[0]
    }

    @Mutation((returns) => Episode)
    async unbookmarkEpisode(@Arg('slug') slug: string, @Ctx() context): Promise<Episode> {
        const episodes = await EpisodeModel.aggregate([
            { $match: { slug: slug } },
            {
                $lookup: {
                    from: 'topics',
                    foreignField: '_id',
                    localField: 'topics',
                    as: 'topics',
                },
            },
        ])

        const user = context

        const indx = user.bookmarkedEpisodes.findIndex((episode_id) => episode_id == episodes[0]._id)

        user.bookmarkedEpisodes.splice(indx, 1)

        await user.save()
        return episodes[0]
    }
}
