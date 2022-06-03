import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql'
import { UserContext } from '../../models/Context'
import { DocumentType, Ref } from '@typegoose/typegoose'
import { Collection, CollectionModel } from '../../models/Collection'
import { Podcast, PodcastModel } from '../../models/Podcast'
import { Episode } from '../../models/Episode'
import { EpisodeModel } from '../../models'

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
    page: number,
    lastUpdated?: Date,
): Promise<Episode[]> {
    // lastupdated - (14 days * page)
    let cutoff = new Date(lastUpdated.getTime() - 14 * 24 * 60 * 60 * 1000 * page)
    let episodes = await EpisodeModel.aggregate<Episode>([
        {
            $match: {
                podcast: { $in: idList },
                // For Simplicity, just get the most recent 50 episodes
                // published: { $gte: cutoff },
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
            $sort: { published: -1 },
        },
        {
            $skip: 50 * page,
        },
        {
            $limit: 50,
        },
    ])
    return episodes
}
