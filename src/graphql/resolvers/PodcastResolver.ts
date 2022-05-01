import { PipelineStage } from 'mongoose'
import { Arg, Query, Resolver } from 'type-graphql'
import { getSubscriptionStatus } from '../../lib/getSubscribtionDiagnostics'
import { EpisodeModel } from '../../models'
import { Episode } from '../../models/Episode'

import { Podcast, PodcastModel } from '../../models/Podcast'
import { SubscriptionStatus } from '../../models/SubscriptionStatus'

const EPISODE_LIMIT = 15

@Resolver((of) => Podcast)
export default class PodcastResolver {
    @Query((returns) => [Podcast], { description: 'Get podcasts ~ 50 podcasts at a time.' })
    async getPodcasts(@Arg('page') page: number): Promise<Podcast[]> {
        const podcasts: Podcast[] = await PodcastModel.find()
            .skip(50 * page)
            .limit(50)
        return podcasts
    }

    @Query((returs) => [Episode], { description: "Returns a podcasts'episodes. 20 podcast episodes at a time." })
    async getPodcastEpisodes(@Arg('slug') slug: string, @Arg('page') page: number): Promise<Episode[]> {
        const episodes: Episode[] = await EpisodeModel.aggregate([
            { $match: { podcast: slug } },
            { $sort: { datePublished: -1 } },
            {
                $lookup: {
                    from: 'entities',
                    foreignField: '_id',
                    localField: 'entities',
                    as: 'entities',
                },
            },
            {
                $skip: EPISODE_LIMIT * page,
            },
            {
                $limit: EPISODE_LIMIT,
            },
        ])
        return episodes
    }

    @Query((returns) => Podcast, {
        description: "Find a podcast based on it's slug",
    })
    async getPodcast(@Arg('slug') slug: string): Promise<Podcast> {
        const podcast: Podcast[] = await PodcastModel.aggregate([
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
            {
                $lookup: {
                    from: 'episodes',
                    as: 'episodes',
                    pipeline: [{ $limit: EPISODE_LIMIT }],
                },
            },
        ])

        return podcast[0]
    }

    @Query((returns) => [Podcast], {
        description: `Searches for podcasts based on a search string. Returns 10 podcasts at a time.
        Searches can be specified to be in the title or description or both.`,
    })
    async searchPodcasts(
        @Arg('searchString') searchString: String,
        @Arg('inTitle', { nullable: true }) inTitle: boolean,
        @Arg('inDescription', { nullable: true }) inDescription: boolean,
    ): Promise<Podcast[]> {
        let searchStage: PipelineStage = {
            $search: {
                index: 'PODCAST_TITLE_DESCRIPTION',
                text: {
                    query: searchString,
                },
            },
        }
        if (!inTitle && !inDescription) {
            searchStage.$search.text.path = {
                wildcard: '*',
            }
        } else {
            searchStage.$search.text.path = []
            if (inTitle) searchStage.$search.text.path.push('title')
            if (inDescription) searchStage.$search.text.path.push('description')
        }
        const podcasts: Podcast[] = await PodcastModel.aggregate([
            {
                ...searchStage,
            },
            {
                $limit: 10,
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    link: 1,
                    image: 1,
                    datePublished: 1,
                    duration: 1,
                    podcast: 1,
                    palette: 1,
                    slug: 1,
                    categories: 1,
                    entities: 1,
                    _id: 0,
                    score: { $meta: 'searchScore' },
                },
            },
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
        return podcasts
    }

    @Query((returns) => [Podcast], { description: 'Returns the featured podcasts' })
    async getFeatured(): Promise<Podcast[]> {
        const pods = await PodcastModel.aggregate([
            { $sample: { size: 7 } },
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
        return pods
    }

    @Query((returns) => [Podcast], { description: 'Returns the Trending Podcasts' })
    async getTrending(): Promise<Podcast[]> {
        const pods = await PodcastModel.aggregate([
            { $sample: { size: 5 } },
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
        return pods
    }

    @Query((returns) => [Podcast], {
        description: 'Returns the Most Played Podcasts',
    })
    async getTopPlayed(): Promise<Podcast[]> {
        const pods = await PodcastModel.aggregate([
            { $sample: { size: 5 } },
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
        return pods
    }

    @Query((returns) => [SubscriptionStatus], {
        description: 'Gets the subscription status of podcasts. Returns 30 at a time.',
    })
    async getHubSubscriptionStatus(@Arg('page') page: number): Promise<SubscriptionStatus[]> {
        const PODCAST_LIMIT = 20
        const pods = await PodcastModel.aggregate<Podcast>([
            {
                $skip: PODCAST_LIMIT * page,
            },
            {
                $limit: PODCAST_LIMIT,
            },
        ])
        let subscriptions = []
        for (let { hmac, rssFeed } of pods) {
            if (!hmac) continue
            let status = getSubscriptionStatus(rssFeed, hmac)
            subscriptions.push(status)
        }
        return Promise.all(subscriptions)
    }
}
