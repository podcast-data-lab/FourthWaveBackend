import { Arg, Query, Resolver } from 'type-graphql'
import { Entity, EntityModel } from '../../models/Entity'
import { Podcast } from '../../models/Podcast'
import { uniqBy } from 'ramda'
import { Episode } from '../../models/Episode'
@Resolver((of) => Entity)
export class EntityResolver {
    @Query((returns) => [Entity], {
        description: 'Returns a list of recommended topics',
    })
    @Query((returns) => [Entity])
    async getEntitySearchRecommendations(): Promise<Entity[]> {
        const tpcs = await EntityModel.aggregate([
            {
                $project: {
                    type: 1,
                    name: 1,
                    valid: {
                        $in: [
                            '$type',
                            [
                                'PERSON',
                                'LOCATION',
                                'ORGANIZATION',
                                'CITY',
                                'STATE_OR_PROVINCE',
                                'COUNTRY',
                                'NATIONALITY',
                                'RELIGION',
                                'TITLE',
                                'IDEOLOGY',
                                'CRIMINAL_CHARGE',
                                'CAUSE_OF_DEATH',
                                'HANDLE',
                                'EMAIL',
                            ],
                        ],
                    },
                },
            },
            { $match: { valid: true } },
            { $sample: { size: 10 } },
        ])

        return tpcs
    }

    /**
     * Search for podcasts based on entites - Podcasts that contain the entities
     * Search for episodes based on entities - Episodes that contain the entities
     */

    @Query((returns) => [Entity], {
        description: `Searches for entities based on a search string. Returns 10 entities at a time
        As well as the first 5 podcasts and episodes that contain the entities.`,
    })
    async searchEntities(
        @Arg('searchString') searchString: String,
        @Arg('entityType', { nullable: true }) type: String = '',
    ): Promise<Entity[]> {
        const entities: Entity[] = await EntityModel.aggregate([
            {
                $search: {
                    index: 'ENTITY_NAME_TYPE',
                    compound: {
                        should: [
                            {
                                text: {
                                    path: 'name',
                                    query: searchString,
                                },
                            },
                            {
                                text: {
                                    query: type,
                                    path: 'type',
                                    score: { boost: { value: 2 } },
                                },
                            },
                        ],
                    },
                },
            },
            {
                $limit: 10,
            },
            {
                $project: {
                    type: 1,
                    name: 1,
                    podcasts: 1,
                    episodes: 1,
                    _id: 0,
                    score: { $meta: 'searchScore' },
                },
            },
            {
                $lookup: {
                    from: 'episodes',
                    foreignField: '_id',
                    localField: 'episodes',
                    as: 'episodes',
                    pipeline: [{ $limit: 5 }],
                },
            },
            {
                $lookup: {
                    from: 'podcasts',
                    foreignField: '_id',
                    localField: 'podcasts',
                    as: 'podcasts',
                    pipeline: [{ $limit: 5 }],
                },
            },
        ])
        return entities
    }
    /**
     * Search for podcasts that mention a certain entity
     */

    @Query((returns) => [Podcast], {
        description: `Searches for podcasts based on a search string and entity. 
            For instance, Searching for podcasts that mention "Obama" will return podcasts that mention that entityName
            Returns 10 podcasts at a time.`,
    })
    async searchPodcastByEntity(
        @Arg('entityName') entityName: String,
        @Arg('entityType', { nullable: true }) entityType: String = '',
    ): Promise<Podcast[]> {
        let should: any = [
            {
                text: {
                    path: 'name',
                    query: entityName,
                },
            },
        ]
        if (entityType)
            should.push({
                text: {
                    query: entityType,
                    path: 'type',
                    score: { boost: { value: 2 } },
                },
            })
        const podcasts: Podcast[] = await EntityModel.aggregate([
            {
                $search: {
                    index: 'ENTITY_NAME_TYPE',
                    compound: {
                        should,
                    },
                },
            },
            {
                $limit: 10,
            },
            {
                $lookup: {
                    from: 'podcasts',
                    foreignField: '_id',
                    localField: 'podcasts',
                    as: 'podcasts',
                    pipeline: [{ $limit: 5 }],
                },
            },
            { $unwind: '$podcasts' },
            {
                $replaceWith: '$podcasts',
            },
        ])
        return uniqBy((p) => p._id, podcasts)
    }

    @Query((returns) => [Episode], {
        description: `Searches for podcasts episodes based on a search string and entity. 
            For instance, Searching for podcasts that mention "Jollof" will return podcast episodes that mention that entityName
            Returns 10 podcast episodes at a time.`,
    })
    async searchEpisodeByEntity(
        @Arg('entityName') entityName: String,
        @Arg('entityType', { nullable: true }) entityType: String = '',
    ): Promise<Episode[]> {
        let should: any = [
            {
                text: {
                    path: 'name',
                    query: entityName,
                },
            },
        ]
        if (entityType)
            should.push({
                text: {
                    query: entityType,
                    path: 'type',
                    score: { boost: { value: 2 } },
                },
            })
        const episodes: Episode[] = await EntityModel.aggregate([
            {
                $search: {
                    index: 'ENTITY_NAME_TYPE',
                    compound: {
                        should,
                    },
                },
            },
            {
                $limit: 10,
            },
            {
                $lookup: {
                    from: 'episodes',
                    foreignField: '_id',
                    localField: 'episodes',
                    as: 'episodes',
                    pipeline: [{ $limit: 5 }],
                },
            },
            { $unwind: '$episodes' },
            {
                $replaceWith: '$episodes',
            },
        ])
        return uniqBy((p) => p._id, episodes)
    }
}
