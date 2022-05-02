import { PipelineStage } from 'mongoose'
import { Arg, Query, Resolver } from 'type-graphql'
import { EpisodeModel } from '../../models'
import { Episode } from '../../models/Episode'

@Resolver((of) => Episode)
export default class EpisodeResolver {
    @Query((returns) => [Episode], {
        description: `Find episodes based on a search string. Searches can be restricted to title, description, or both.`,
    })
    async searchEpisodes(
        @Arg('searchString') searchString: string,
        @Arg('inTitle', { nullable: true }) inTitle: boolean = false,
        @Arg('inDescription', { nullable: true }) inDescription: boolean = false,
    ): Promise<Episode[]> {
        let searchStage: PipelineStage = {
            $search: {
                index: 'EPISODE_TITLE_DESCRIPTION',
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
        const searchResult = await EpisodeModel.aggregate([
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
                    sourceUrl: 1,
                    image: 1,
                    datePublished: 1,
                    duration: 1,
                    podcast: 1,
                    entities: 1,
                    epNo: 1,
                    snNo: 1,
                    _id: 0,
                    score: { $meta: 'searchScore' },
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

        return searchResult
    }

    @Query((returns) => [Episode], {
        description: 'Returns the Most Popular Podcast Episodes',
    })
    async topEpisodes(): Promise<Episode[]> {
        const eps = await EpisodeModel.aggregate([
            { $sample: { size: 5 } },
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
                $lookup: {
                    from: 'podcasts',
                    localField: 'podcast',
                    foreignField: '_id',
                    as: 'podcast',
                },
            },
            {
                $addFields: {
                    author: { $first: '$author' },
                    podcast: { $first: '$podcast' },
                },
            },
        ])
        return eps
    }
}
