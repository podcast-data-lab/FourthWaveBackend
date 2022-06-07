import { PipelineStage } from 'mongoose'
import { map } from 'ramda'
import { Arg, Authorized, Field, InputType, Mutation, Query, Resolver } from 'type-graphql'
import { getSubscriptionStatus } from '../../lib/getSubscribtionDiagnostics'
import { subscribeToHub } from '../../lib/subscribeToHub'
import { UserPermission } from '../../models/enums/Permissions'
import { Episode } from '../../models/Episode'
import { IOptions } from '../../models/I-Options'

import { Podcast, PodcastModel } from '../../models/Podcast'
import { SubscriptionStatus } from '../../models/SubscriptionStatus'

const EPISODE_LIMIT = 15
@InputType()
export class SearchInput {
    @Field()
    searchString: string
    @Field()
    inTitle: boolean
    @Field()
    inDescription: boolean
    @Field((type) => [String])
    categorySlugs: string[]
    @Field()
    page: number
}

@InputType()
export class PodcastIdsInput {
    @Field((type) => [String])
    podcastIds: string[]
}
@Resolver((of) => Podcast)
export default class PodcastResolver {
    @Authorized()
    @Query((returns) => [Podcast], { description: 'Get podcasts ~ 50 podcasts at a time.' })
    async getPodcasts(@Arg('page') page: number): Promise<Podcast[]> {
        const podcasts: Podcast[] = await PodcastModel.aggregate([
            {
                $skip: 30 * page,
            },
            {
                $limit: 30,
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
        ])
        return podcasts
    }

    @Authorized()
    @Query((returs) => [Episode], { description: "Returns a podcasts'episodes. 20 podcast episodes at a time." })
    async getPodcastEpisodes(@Arg('slug') slug: string, @Arg('page') page: number): Promise<Episode[]> {
        const episodes: Episode[] = await PodcastModel.aggregate<Episode>([
            { $match: { slug } },
            {
                $lookup: {
                    from: 'episodes',
                    foreignField: '_id',
                    localField: 'episodes',
                    as: 'episodes',
                },
            },
            {
                $lookup: {
                    from: 'authors',
                    foreignField: '_id',
                    localField: 'author',
                    as: 'author',
                },
            },
            {
                $addFields: {
                    'episodes.podcast.title': '$title',
                    'episodes.podcast.palette': '$palette',
                    'episodes.podcast.slug': '$slug',
                },
            },
            { $unwind: '$episodes' },
            {
                $replaceWith: { $mergeObjects: [{ image: '$image', author: '$author' }, '$episodes'] },
            },
            { $sort: { published: -1 } },
            {
                $skip: EPISODE_LIMIT * page,
            },
            {
                $limit: EPISODE_LIMIT,
            },
        ])
        return episodes
    }

    @Authorized()
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

    @Authorized()
    @Query((returns) => [Podcast], {
        description: `Searches for podcasts based on a search string. Returns 10 podcasts at a time.
        Searches can be specified to be in the title or description or both.`,
    })
    async searchPodcasts(
        @Arg('searchInput') { searchString, inTitle, inDescription, categorySlugs, page }: SearchInput,
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
        let categoryStages: PipelineStage[] = [
            {
                $lookup: {
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'categories',
                    as: 'categories',
                },
            },
        ]
        if (categorySlugs.length > 0) {
            categoryStages.push({
                $match: {
                    categories: {
                        $elemMatch: {
                            slug: {
                                $in: categorySlugs,
                            },
                        },
                    },
                },
            })
        }
        const podcasts: Podcast[] = await PodcastModel.aggregate([
            {
                ...searchStage,
            },
            ...categoryStages,

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
            {
                $lookup: {
                    from: 'entities',
                    foreignField: '_id',
                    localField: 'entities',
                    as: 'entities',
                },
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
                    author: 1,
                    entities: 1,
                    _id: 1,
                    score: { $meta: 'searchScore' },
                },
            },
            {
                $skip: page * 15,
            },

            {
                $limit: 15,
            },
        ])
        return podcasts
    }

    @Authorized()
    @Query((returns) => [Podcast], { description: 'Returns the featured podcasts' })
    async getFeatured(): Promise<Podcast[]> {
        const pods = await PodcastModel.aggregate([
            { $sample: { size: 7 } },
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
                    from: 'categories',
                    foreignField: '_id',
                    localField: 'categories',
                    as: 'categories',
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
        ])
        return pods
    }

    @Authorized()
    @Query((returns) => [Podcast], { description: 'Returns the Trending Podcasts' })
    async getTrending(): Promise<Podcast[]> {
        const pods = await PodcastModel.aggregate([
            { $sample: { size: 8 } },
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
        ])
        return pods
    }

    @Authorized()
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
        ])
        return pods
    }

    @Authorized([UserPermission.Admin])
    @Query((returns) => [SubscriptionStatus], {
        description: 'Gets the subscription status of podcasts. Returns 30 at a time.',
    })
    async getHubSubscriptionStatus(): Promise<SubscriptionStatus[]> {
        let pods: Podcast[] = await PodcastModel.find()
        let subscriptions = await Promise.all(pods.map(getSubscriptionStatus))
        return subscriptions
    }

    @Authorized([UserPermission.Admin])
    @Mutation((returns) => [SubscriptionStatus], { description: 'Subscribe a podcast to a hub' })
    async subscribePodcastsToHub(@Arg('podcastIds') podcastId: PodcastIdsInput): Promise<SubscriptionStatus[]> {
        let podcasts = await PodcastModel.find({ _id: { $in: podcastId } })
        let podcastXMLUrls = podcasts.map((podcast) => podcast.rssFeed)
        const generateHub =
            (hubUrl: string) =>
            (xmlurl: string): IOptions => ({
                secret: process.env.HMAC_SECRET,
                leaseSeconds: 60 * 60 * 24 * 7,
                mode: 'subscribe',
                topic: xmlurl,
                hub: hubUrl,
                callbackUrl: process.env.CALL_BACK_URL,
            })
        const updatedPodcasts = await Promise.all(
            map(generateHub(process.env.HUB_URL), podcastXMLUrls).map((hubRequest, i) => {
                return new Promise<Podcast>((resolve, reject) => {
                    setTimeout(async () => {
                        const result = await subscribeToHub(hubRequest)
                        resolve(result)
                    }, i * 1000)
                })
            }),
        )
        let subscriptions = await Promise.all(updatedPodcasts.filter((pod) => !!pod).map(getSubscriptionStatus))
        return subscriptions
    }

    @Authorized([UserPermission.Editor])
    @Mutation((returns) => Podcast, { description: 'Makes a podcast featured or not.' })
    async editPodcastFeatureness(@Arg('slug') entityId: string, @Arg('featured') featured: boolean): Promise<Podcast> {
        const podcast = await PodcastModel.findById(entityId)
        if (!podcast) {
            throw new Error('Entity not found')
        }
        podcast.featured = featured
        await podcast.save()

        return podcast
    }
}
