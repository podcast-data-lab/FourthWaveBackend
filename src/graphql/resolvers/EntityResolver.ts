import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql'
import { Entity, EntityModel } from '../../models/Entity'
import { Podcast } from '../../models/Podcast'
import { uniqBy } from 'ramda'
import { Episode } from '../../models/Episode'
import { DocumentType } from '@typegoose/typegoose'
import { UserPermission } from '../../models/enums/Permissions'

const ENTITY_LIMIT = 35

@Resolver((of) => Entity)
export class EntityResolver {
    @Authorized([UserPermission.Editor])
    @Query((returns) => [Entity], {
        description: 'Returns a list of all the entities',
    })
    async getEntities(@Arg('page') page: number): Promise<Entity[]> {
        const entities = await EntityModel.aggregate([
            {
                $project: {
                    epCount: { $size: '$episodes' },
                    podCount: { $size: '$podcasts' },
                    _id: 1,
                    slug: 1,
                    title: 1,
                    podcasts: 1,
                    episodes: 1,
                    featured: 1,
                    visible: 1,
                    coverImageUrl: 1,
                    contributor: 1,
                    comments: 1,
                },
            },
            { $sort: { podCount: -1, epCount: -1 } },
            { $skip: ENTITY_LIMIT * page },
            { $limit: ENTITY_LIMIT },
            {
                $lookup: {
                    from: 'podcasts',
                    foreignField: '_id',
                    localField: 'podcasts',
                    as: 'podcasts',
                },
            },
            {
                $lookup: {
                    from: 'episodes',
                    foreignField: '_id',
                    localField: 'episodes',
                    as: 'episodes',
                },
            },
        ]).allowDiskUse(true)
        return entities
    }

    @Authorized()
    @Query((returns) => [Entity], {
        description: 'Returns a list of recommended topics',
    })
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
                                'CARDINAL',
                                'DATE',
                                'EVENT',
                                'FAC',
                                'GPE',
                                'LANGUAGE',
                                'LAW',
                                'LOC',
                                'MONEY',
                                'NORP',
                                'ORDINAL',
                                'ORG',
                                'PERCENT',
                                'PERSON',
                                'PRODUCT',
                                'QUANTITY',
                                'TIME',
                                'WORK_OF_ART',
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

    @Authorized()
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
                    _id: 1,
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
    @Authorized()
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
        const podcasts: DocumentType<Podcast>[] = await EntityModel.aggregate([
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
    @Authorized()
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
        const episodes: DocumentType<Episode>[] = await EntityModel.aggregate([
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

    @Authorized()
    @Query((returns) => [Entity])
    async getFeaturedEntities(): Promise<Entity[]> {
        const entities = await EntityModel.aggregate([
            {
                $match: { featured: true },
            },
        ])
        return entities
    }

    @Authorized()
    @Query((returns) => Entity)
    async getFullCategory(@Arg('entityId') entityId: string): Promise<Entity> {
        return getFullEntity(entityId)
    }

    @Authorized()
    @Mutation((returns) => Entity)
    async editCategoryFeatureness(@Arg('entityId') entityId: string, @Arg('featured') featured: boolean): Promise<Entity> {
        const entity = await EntityModel.findById(entityId)
        if (!entity) {
            throw new Error('Category not found')
        }
        entity.featured = featured
        await entity.save()

        return getFullEntity(entityId)
    }
}

async function getFullEntity(entityId: string) {
    let entities = await EntityModel.aggregate([
        {
            $match: { _id: entityId },
        },
        {
            $lookup: {
                from: 'podcasts',
                foreignField: '_id',
                localField: 'podcasts',
                as: 'podcasts',
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
    ])
    if (entities.length > 0) {
        return entities[0]
    }
    return null
}
