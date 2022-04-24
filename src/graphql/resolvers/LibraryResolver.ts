import { Episode, EpisodeInput } from '../../models/Episode'
import { signInOrCreateUser } from '../../db/authentication'
import { UserModel, EpisodeModel, PlayModel } from '../../models'
import { Arg, Args, ArgsType, Ctx, Field, InputType, Mutation, Query, Resolver } from 'type-graphql'
import { User } from '../../models/User'
import { GraphQLError } from 'graphql'
import { Play } from '../../models/Play'
import { Podcast, PodcastModel } from '../../models/Podcast'
import { Library, LibraryModel } from '../../models/Library'
import { UserContext } from '../../models/Context'

@Resolver((of) => Library)
export default class LibraryResolver {
    @Mutation((returns) => Podcast)
    async subscribeToPodcast(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Podcast> {
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
                    from: 'entities',
                    foreignField: '_id',
                    localField: 'entities',
                    as: 'entities',
                },
            },
            // { $project: { _id: 1 } }
        ])
        library.subscribedPodcasts.push(podcasts[0]._id)
        await library.save()
        return podcasts[0]
    }

    @Mutation((returns) => Podcast)
    async likePodcast(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Podcast> {
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
                    from: 'entities',
                    foreignField: '_id',
                    localField: 'entities',
                    as: 'entities',
                },
            },
        ])
        library.likedPodcasts.push(podcast[0]._id)
        await library.save()
        return podcast[0]
    }

    @Mutation((returns) => Episode)
    async likeEpisode(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Episode> {
        const episode = await EpisodeModel.aggregate([
            { $match: { slug: slug } },
            {
                $lookup: {
                    from: 'entities',
                    foreignField: '_id',
                    localField: 'entities',
                    as: 'entities',
                },
            },
        ])

        library.likedEpisodes.push(episode[0]._id)
        await library.save()
        return episode[0]
    }

    @Mutation((returns) => Episode)
    async bookmarkEpisode(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Episode> {
        const episode = await EpisodeModel.aggregate([
            { $match: { slug: slug } },
            {
                $lookup: {
                    from: 'entities',
                    foreignField: '_id',
                    localField: 'entities',
                    as: 'entities',
                },
            },
        ])

        library.bookmarkedEpisodes.push(episode[0]._id)
        await library.save()
        return episode[0]
    }

    // UNDO AN ACTION

    @Mutation((returns) => Podcast)
    async unsubscribeToPodcast(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Podcast> {
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
                    from: 'entities',
                    foreignField: '_id',
                    localField: 'entities',
                    as: 'entities',
                },
            },
            // { $project: { _id: 1 } }
        ])

        const indx = library.subscribedPodcasts.findIndex((podcast_id) => podcast_id == podcasts[0]._id)

        library.subscribedPodcasts.splice(indx, 1)

        await library.save()
        return podcasts[0]
    }

    @Mutation((returns) => Podcast)
    async unlikePodcast(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Podcast> {
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
                    from: 'entities',
                    foreignField: '_id',
                    localField: 'entities',
                    as: 'entities',
                },
            },
        ])

        const indx = library.subscribedPodcasts.findIndex((podcast_id) => podcast_id == podcasts[0]._id)

        library.subscribedPodcasts.splice(indx, 1)

        await library.save()
        return podcasts[0]
    }

    @Mutation((returns) => Episode)
    async unlikeEpisode(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Episode> {
        const episodes = await EpisodeModel.aggregate([
            { $match: { slug: slug } },
            {
                $lookup: {
                    from: 'entities',
                    foreignField: '_id',
                    localField: 'entities',
                    as: 'entities',
                },
            },
        ])

        const indx = library.likedEpisodes.findIndex((episode_id) => episode_id == episodes[0]._id)

        library.likedEpisodes.splice(indx, 1)

        await library.save()
        return episodes[0]
    }

    @Mutation((returns) => Episode)
    async unbookmarkEpisode(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Episode> {
        const episodes = await EpisodeModel.aggregate([
            { $match: { slug: slug } },
            {
                $lookup: {
                    from: 'entities',
                    foreignField: '_id',
                    localField: 'entities',
                    as: 'entities',
                },
            },
        ])

        const indx = library.bookmarkedEpisodes.findIndex((episode_id) => episode_id == episodes[0]._id)

        library.bookmarkedEpisodes.splice(indx, 1)

        await library.save()
        return episodes[0]
    }
}

export async function getLibraryWithPlayingQueue(_id: string): Promise<Library> {
    return (
        await LibraryModel.aggregate([
            { $match: { _id } },
            {
                $lookup: {
                    from: 'plays',
                    foreignField: '_id',
                    localField: 'queue',
                    as: 'queue',
                },
            },
        ])
    )[0]
}
