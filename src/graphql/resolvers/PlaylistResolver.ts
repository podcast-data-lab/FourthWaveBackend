import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql'
import { UserContext } from '../../models/Context'
import { DocumentType, Ref } from '@typegoose/typegoose'
import { Collection, CollectionModel } from '../../models/Collection'
import { Podcast, PodcastModel } from '../../models/Podcast'
import { Episode } from '../../models/Episode'

@InputType()
class CollectionInput {
    @Field()
    name: string
    @Field()
    coverImageUrl: string
    @Field()
    themeColor: string
}
@Resolver((of) => Collection)
export class CollectionResolver {
    @Mutation((returns) => Collection, { description: 'Add a podcast to a collection' })
    async createCollection(
        @Arg('collection') collectionInput: CollectionInput,
        @Ctx() { library, user }: UserContext,
    ): Promise<Collection> {
        let newCollection = new CollectionModel({
            name: collectionInput.name,
            coverImageUrl: collectionInput.coverImageUrl,
            themeColor: collectionInput.themeColor,
            podcasts: [],
        })
        await newCollection.save()
        library.collections.push(newCollection._id)
        await library.save()
        return newCollection
    }

    @Mutation((returns) => Collection, { description: 'Add a podcast to a collection' })
    async addPodcastToCollection(
        @Arg('slug') slug: string,
        @Arg('collectionId') collectionId: string,
        @Ctx() { user }: UserContext,
    ): Promise<Collection> {
        let collection = await CollectionModel.findById<DocumentType<Collection>>({ _id: user.preferences })
        if (collection.podcasts.includes(slug)) {
            collection.podcasts.push(slug)
            await collection.save()
        }
        return collection
    }

    @Mutation((returns) => Collection, {
        description: 'Remove a podcast from a collection',
    })
    async removePodcastFromCollection(
        @Arg('slug') slug: string,
        @Arg('collectionId') collectionId: string,
        @Ctx() { user }: UserContext,
    ): Promise<Collection> {
        let collection = await CollectionModel.findById<DocumentType<Collection>>({ _id: user.preferences })
        if (collection.podcasts.includes(slug)) {
            let index = collection.podcasts.indexOf(slug)
            collection.podcasts.splice(index, 1)
            await collection.save()
        }
        return collection
    }
}

export async function getEpisodesInPodcastList(
    idList: string[] | Ref<Podcast, string>[],
    lastUpdated: Date,
    page: number,
): Promise<Episode[]> {
    // lastupdated - (14 days * page)
    let cutoff = new Date(lastUpdated.getTime() - 14 * 24 * 60 * 60 * 1000 * page)
    let episodes = await PodcastModel.aggregate<Episode>([
        {
            $match: {
                $expr: {
                    $and: [
                        {
                            // _id: {
                            $in: ['$_id', idList],
                            // },
                        },
                        {
                            // lastUpdated: {
                            $gte: ['$lastUpdated', cutoff],
                            // },
                        },
                    ],
                },
            },
        },
        {
            $match: {
                _id: {
                    $in: idList,
                },
            },
        },
        {
            $lookup: {
                from: 'episodes',
                localField: '_id',
                foreignField: 'podcast',
                as: 'episodes',
                let: {
                    podcast: '$$ROOT',
                },
                pipeline: [
                    {
                        $match: {
                            published: {
                                $gte: cutoff,
                            },
                        },
                        $addFields: {
                            podcast: '$podcast',
                        },
                    },
                ],
            },
        },
        {
            $unwind: '$episodes',
        },
        // {
        //     $sort: {
        //         'episodes.published': -1,
        //     },
        // }
    ])
    return episodes
}
