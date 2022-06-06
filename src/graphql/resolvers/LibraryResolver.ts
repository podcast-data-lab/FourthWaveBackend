import { Episode } from '../../models/Episode'
import { EpisodeModel } from '../../models'
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Podcast, PodcastModel } from '../../models/Podcast'
import { Library, LibraryModel } from '../../models/Library'
import { UserContext } from '../../models/Context'
import { DocumentType } from '@typegoose/typegoose'
import { Collection, CollectionInput, CollectionModel } from '../../models/Collection'
import { Playlist, PlaylistInput, PlaylistModel } from '../../models/Playlist'
import { ObjectId } from 'mongodb'
import { getEpisodesInPodcastList } from './helpers'
import { GraphQLError } from 'graphql'

@Resolver((of) => Library)
export default class LibraryResolver {
    @Authorized()
    @Mutation((returns) => Library, {
        description: "Retreives a user's library",
    })
    async getLibrary(@Ctx() { library }: UserContext): Promise<Library> {
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Query((returns) => Playlist, {
        description: 'Retreives a playlist by id',
    })
    async getPlaylist(@Arg('playlistId') playlistId: string): Promise<Playlist> {
        return retreivePlaylist(new ObjectId(playlistId))
    }

    @Authorized()
    @Query((returns) => Collection, {
        description: 'Retreives a collection by id',
    })
    async getCollection(@Arg('collectionId') collectionId: string): Promise<Collection> {
        return retreiveCollection(new ObjectId(collectionId))
    }

    @Authorized()
    @Mutation((returns) => Library)
    async subscribeToPodcast(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const podcast = await PodcastModel.findOne<DocumentType<Podcast>>({ slug })
        if (podcast && !library.subscribedPodcasts.includes(podcast._id)) {
            library.subscribedPodcasts.push(podcast._id)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Query((returns) => [Episode])
    async getEpisodesForSubscribedPodcasts(@Arg('page') page: number, @Ctx() { library }: UserContext): Promise<Episode[]> {
        return getEpisodesInPodcastList(library.subscribedPodcasts, page)
    }

    @Authorized()
    @Query((returns) => [Episode])
    async getEpisodesForPodcastsInCollection(
        @Arg('collectionId') collectionId: string,
        @Arg('page') page: number,
        @Ctx() { library }: UserContext,
    ): Promise<Episode[]> {
        let collection = await CollectionModel.findOne({ _id: collectionId })
        return getEpisodesInPodcastList(collection.podcasts, page)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async unSubscribeToPodcast(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const podcast = await PodcastModel.findOne({ slug })
        const indx = library.subscribedPodcasts.findIndex((podcast_id) => new ObjectId(podcast._id).equals(podcast_id.toString()))
        if (indx > -1) {
            library.subscribedPodcasts.splice(indx, 1)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async addToOnTap(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library | GraphQLError> {
        const podcast = await PodcastModel.findOne<DocumentType<Podcast>>({ slug })

        if (library.podsOnTap.length >= 5) {
            return new GraphQLError('You can only have 5 podcasts on tap')
        }
        if (podcast && !library.podsOnTap.includes(podcast._id)) {
            library.podsOnTap.push(podcast._id)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async removeFromOnTap(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const podcast = await PodcastModel.findOne({ slug })
        const indx = library.podsOnTap.findIndex((podcast_id) => new ObjectId(podcast._id).equals(podcast_id.toString()))
        if (indx > -1) {
            library.podsOnTap.splice(indx, 1)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async createCollection(@Arg('collection') collection: CollectionInput, @Ctx() { library }: UserContext): Promise<Library> {
        const newCollection = new CollectionModel({ ...collection })
        await newCollection.save()
        library.collections.push(newCollection._id)
        await library.save()

        return getFullLibrary(library._id)
    }
    @Authorized()
    @Mutation((returns) => Collection)
    async editCollection(
        @Arg('collectionId') collectionId: string,
        @Arg('collection') collectionInput: CollectionInput,
        @Ctx() { library }: UserContext,
    ): Promise<Collection> {
        const collection = await CollectionModel.findOne({ _id: collectionId })
        if (collection) {
            collection.name = collectionInput.name
            collection.coverImageUrl = collectionInput.coverImageUrl
            collection.description = collectionInput.description
            collection.themeColor = collectionInput.themeColor
            await collection.save()
        }
        return retreiveCollection(new ObjectId(collectionId))
    }

    @Authorized()
    @Mutation((returns) => Library)
    async deleteCollection(@Arg('collectionId') collectionId: string, @Ctx() { library }: UserContext): Promise<Library> {
        const collection = await CollectionModel.findOne({ _id: collectionId })
        if (collection) {
            const indx = library.collections.findIndex((collection_id) =>
                new ObjectId(collection._id).equals(collection_id.toString()),
            )
            if (indx > -1) {
                library.collections.splice(indx, 1)
                await collection.remove()
                await library.save()
            }
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Collection)
    async addPodcastToCollection(
        @Arg('podcastSlug') podcastSlug: string,
        @Arg('collectionId') collectionId: string,
        @Ctx() { library }: UserContext,
    ): Promise<Collection> {
        const collection = await CollectionModel.findOne({ _id: collectionId })
        const podcast = await PodcastModel.findOne<DocumentType<Podcast>>({ slug: podcastSlug })
        if (podcast && collection) {
            collection.podcasts.push(podcast._id)
            await collection.save()
        }
        return retreiveCollection(new ObjectId(collection._id))
    }

    @Authorized()
    @Mutation((returns) => Collection)
    async removePodcastFromCollection(
        @Arg('podcastSlug') podcastSlug: string,
        @Arg('collectionId') collectionId: string,
        @Ctx() { library }: UserContext,
    ): Promise<Collection> {
        const podcast = await PodcastModel.findOne<DocumentType<Podcast>>({ slug: podcastSlug })
        const collection = await CollectionModel.findOne({ _id: collectionId })
        if (podcast && collection) {
            const indx = collection.podcasts.findIndex((podcast_id) => new ObjectId(podcast._id).equals(podcast_id.toString()))
            if (indx > -1) {
                collection.podcasts.splice(indx, 1)
                await collection.save()
            }
        }
        return retreiveCollection(new ObjectId(collection._id))
    }

    @Authorized()
    @Mutation((returns) => Library)
    async createPlaylist(
        @Arg('playlist') { name, coverImageUrl, description, themeColor }: PlaylistInput,
        @Ctx() { library }: UserContext,
    ): Promise<Library> {
        const playlist = new PlaylistModel({ name, coverImageUrl, description, themeColor })
        await playlist.save()
        library.playlists.push(playlist._id)
        await library.save()
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Playlist)
    async editPlaylist(
        @Arg('playlistId') playlistId: string,
        @Arg('playlist') playlistInput: PlaylistInput,
        @Ctx() { library }: UserContext,
    ): Promise<Playlist> {
        const playlist = await PlaylistModel.findOne({ _id: playlistId })
        if (playlist) {
            playlist.name = playlistInput.name
            playlist.coverImageUrl = playlistInput.coverImageUrl
            playlist.description = playlistInput.description
            playlist.themeColor = playlistInput.themeColor
            await playlist.save()
        }
        return retreivePlaylist(new ObjectId(playlistId))
    }

    @Authorized()
    @Mutation((returns) => Library)
    async deletePlaylist(@Arg('playlistId') playlistId: string, @Ctx() { library }: UserContext): Promise<Library> {
        const playlist = await PlaylistModel.findOne({ _id: playlistId })
        if (playlist) {
            const indx = library.playlists.findIndex((playlist_id) => new ObjectId(playlist._id).equals(playlist_id.toString()))
            if (indx > -1) {
                library.playlists.splice(indx, 1)
                await playlist.remove()
                await library.save()
            }
        }

        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Playlist)
    async addEpisodeToPlaylist(
        @Arg('episodeSlug') episodeSlug: string,
        @Arg('playlistId') playlistId: string,
        @Ctx() { library }: UserContext,
    ): Promise<Playlist> {
        const episode = await EpisodeModel.findOne<DocumentType<Episode>>({ slug: episodeSlug })
        const playlist = await PlaylistModel.findOne({ _id: playlistId })
        if (episode && playlist) {
            playlist.episodes.push(episode)
            await playlist.save()
        }
        return retreivePlaylist(new ObjectId(playlistId))
    }

    @Authorized()
    @Mutation((returns) => Playlist)
    async removeEpisodeFromPlaylist(
        @Arg('episodeSlug') episodeSlug: string,
        @Arg('playlistId') playlistId: string,
        @Ctx() { library }: UserContext,
    ): Promise<Playlist> {
        const episode = await EpisodeModel.findOne<DocumentType<Episode>>({ slug: episodeSlug })
        const playlist = await PlaylistModel.findOne({ _id: playlistId })
        if (episode && playlist) {
            const indx = playlist.episodes.findIndex((episode_id) => episode._id.equals(episode_id.toString()))
            if (indx > -1) {
                playlist.episodes.splice(indx, 1)
                await playlist.save()
            }
        }
        return retreivePlaylist(new ObjectId(playlistId))
    }

    /* Like & Unlike Podcast */
    @Authorized()
    @Mutation((returns) => Library)
    async likeEpisode(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const episode = await EpisodeModel.findOne<DocumentType<Episode>>({ slug })
        if (episode) {
            library.likedEpisodes.push(episode)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async unlikeEpisode(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const episode = await EpisodeModel.findOne<DocumentType<Episode>>({ slug })

        const indx = library.likedEpisodes.findIndex((episode_id) => episode._id.equals(episode_id.toString()))
        if (indx > -1) {
            library.likedEpisodes.splice(indx, 1)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    /* Like & Unlike Podcast */
    @Authorized()
    @Mutation((returns) => Library)
    async addToListenLater(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const episode = await EpisodeModel.findOne<DocumentType<Episode>>({ slug })
        if (episode) {
            library.listenLater.push(episode)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async removeFromListenLater(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const episode = await EpisodeModel.findOne<DocumentType<Episode>>({ slug })
        console.log(episode.id)
        console.log(library.listenLater.map((e) => e.toString()))
        const indx = library.listenLater.findIndex((epId) => episode._id.equals(epId.toString()))
        console.log(indx)
        if (indx > -1) {
            library.listenLater.splice(indx, 1)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async archiveEpisode(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const episode = await EpisodeModel.findOne<DocumentType<Episode>>({ slug })
        if (episode) {
            library.archivedEpisodes.push(episode)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async unArchiveEpisode(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const episode = await EpisodeModel.findOne<DocumentType<Episode>>({ slug })
        const indx = library.archivedEpisodes.findIndex((episode_id) => episode._id.equals(episode_id.toString()))
        if (indx > -1) {
            library.archivedEpisodes.splice(indx, 1)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    /* Bookmark & unbookmark a Podcast Episode */
    @Authorized()
    @Mutation((returns) => Library)
    async bookmarkEpisode(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const episode = await EpisodeModel.findOne<DocumentType<Episode>>({ slug })
        if (episode) {
            library.bookmarkedEpisodes.push(episode)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async unbookmarkEpisode(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const episode = await EpisodeModel.findOne({ slug })
        const indx = library.bookmarkedEpisodes.findIndex((episode_id) => episode._id.equals(episode_id.toString()))
        if (indx > -1) {
            library.bookmarkedEpisodes.splice(indx, 1)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async getSubscribedPodcastEpisodeQueue(@Ctx() { library }: UserContext): Promise<Episode[]> {
        return []
    }
}

export async function retreivePlaylist(_id: ObjectId) {
    const playlists = await PlaylistModel.aggregate<DocumentType<Playlist>>([
        { $match: { _id } },
        {
            $lookup: {
                from: 'episodes',
                foreignField: '_id',
                localField: 'episodes',
                as: 'episodes',
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
    if (playlists.length > 0) {
        return playlists[0]
    }
    return null
}

export async function retreiveCollection(_id: ObjectId) {
    const collection = await CollectionModel.aggregate<DocumentType<Collection>>([
        { $match: { _id } },
        {
            $lookup: {
                from: 'podcasts',
                let: { podcastsIds: '$podcasts' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ['$_id', '$$podcastsIds'] },
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
                            sort: {
                                $indexOfArray: ['$$podcastsIds', '$_id'],
                            },
                        },
                    },
                    { $sort: { sort: 1 } },
                    { $addFields: { sort: '$$REMOVE' } },
                ],
                as: 'podcasts',
            },
        },
    ])
    if (collection.length > 0) {
        return collection[0]
    }
    return null
}

export async function getFullLibrary(_id: ObjectId): Promise<DocumentType<Library>> {
    let libs = await LibraryModel.aggregate<DocumentType<Library>>([
        { $match: { _id } },
        {
            $lookup: {
                from: 'episodes',
                foreignField: '_id',
                localField: 'bookmarkedEpisodes',
                as: 'bookmarkedEpisodes',
            },
        },
        {
            $lookup: {
                from: 'collections',
                foreignField: '_id',
                localField: 'collections',
                as: 'collections',
                pipeline: [
                    {
                        $lookup: {
                            from: 'podcasts',
                            let: { podcastsIds: '$podcasts' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $in: ['$_id', '$$podcastsIds'] },
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
                                        sort: {
                                            $indexOfArray: ['$$podcastsIds', '$_id'],
                                        },
                                    },
                                },
                                { $sort: { sort: 1 } },
                                { $addFields: { sort: '$$REMOVE' } },
                            ],
                            as: 'podcasts',
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'categories',
                foreignField: '_id',
                localField: 'followedCategories',
                as: 'followedCategories',
            },
        },
        {
            $lookup: {
                from: 'episodes',
                let: { likedEpisodesIds: '$likedEpisodes' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ['$_id', '$$likedEpisodesIds'] },
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
                            sort: {
                                $indexOfArray: ['$$likedEpisodesIds', '$_id'],
                            },
                        },
                    },
                    { $sort: { sort: 1 } },
                    { $addFields: { sort: '$$REMOVE' } },
                ],
                as: 'likedEpisodes',
            },
        },
        {
            $lookup: {
                from: 'episodes',
                let: { listenLaterIds: '$listenLater' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ['$_id', '$$listenLaterIds'] },
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
                            sort: {
                                $indexOfArray: ['$$listenLaterIds', '$_id'],
                            },
                        },
                    },
                    { $sort: { sort: 1 } },
                    { $addFields: { sort: '$$REMOVE' } },
                ],
                as: 'listenLater',
            },
        },
        {
            $lookup: {
                from: 'episodes',
                let: { archivedEpisodesIds: '$archivedEpisodes' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ['$_id', '$$archivedEpisodesIds'] },
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
                            sort: {
                                $indexOfArray: ['$$archivedEpisodesIds', '$_id'],
                            },
                        },
                    },
                    { $sort: { sort: 1 } },
                    { $addFields: { sort: '$$REMOVE' } },
                ],
                as: 'archivedEpisodes',
            },
        },
        {
            $lookup: {
                from: 'playlists',
                foreignField: '_id',
                localField: 'playlists',
                as: 'playlists',
                pipeline: [
                    {
                        $lookup: {
                            from: 'episodes',
                            let: { episodesInPlaylistIds: '$episodes' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $in: ['$_id', '$$episodesInPlaylistIds'] },
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
                                    $addFields: {
                                        episode: { $first: '$episode' },
                                    },
                                },
                                {
                                    $addFields: {
                                        sort: {
                                            $indexOfArray: ['$$episodesInPlaylistIds', '$_id'],
                                        },
                                    },
                                },
                                { $sort: { sort: 1 } },
                                { $addFields: { sort: '$$REMOVE' } },
                            ],
                            as: 'episodes',
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'podcasts',
                let: { subscribedPodcastsIds: '$subscribedPodcasts' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ['$_id', '$$subscribedPodcastsIds'] },
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
                            sort: {
                                $indexOfArray: ['$$subscribedPodcastsIds', '$_id'],
                            },
                        },
                    },
                    { $sort: { sort: 1 } },
                    { $addFields: { sort: '$$REMOVE' } },
                ],
                as: 'subscribedPodcasts',
            },
        },
        {
            $lookup: {
                from: 'podcasts',
                let: { podsOnTapIds: '$podsOnTap' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ['$_id', '$$podsOnTapIds'] },
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
                            sort: {
                                $indexOfArray: ['$$podsOnTapIds', '$_id'],
                            },
                        },
                    },
                    { $sort: { sort: 1 } },
                    { $addFields: { sort: '$$REMOVE' } },
                ],
                as: 'podsOnTap',
            },
        },
    ])
    return libs[0]
}
