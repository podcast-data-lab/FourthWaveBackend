import { PipelineStage } from 'mongoose'
import { Arg, Query, Resolver } from 'type-graphql'
import { EpisodeModel } from '../../models'
import { Episode } from '../../models/Episode'
import { SearchInput } from './PodcastResolver'

@Resolver((of) => Episode)
export default class EpisodeResolver {
    @Query((returns) => [Episode], {
        description: `Find episodes based on a search string. Searches can be restricted to title, description, or both.`,
    })
    async searchEpisodes(
        @Arg('searchInput') { inDescription, inTitle, searchString, categorySlugs, page }: SearchInput,
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
                $project: {
                    title: 1,
                    description: 1,
                    htmlDescription: 1,
                    explicit: 1,
                    subtitle: 1,
                    published: 1,
                    sourceUrl: 1,
                    image: 1,
                    duration: 1,
                    podcast: 1,
                    entities: 1,
                    slug: 1,
                    epNo: 1,
                    snNo: 1,
                    _id: 1,
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
                    foreignField: '_id',
                    localField: 'podcast',
                    as: 'podcast',
                },
            },
            {
                $addFields: {
                    podcast: { $first: '$podcast' },
                    author: { $first: '$author' },
                },
            },
            {
                $skip: page * 15,
            },

            {
                $limit: 15,
            },
        ])

        return searchResult
    }

    @Query((returns) => [Episode], {
        description: 'Returns the Most Popular Podcast Episodes',
    })
    async topEpisodes(): Promise<Episode[]> {
        const eps = await EpisodeModel.aggregate([
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
