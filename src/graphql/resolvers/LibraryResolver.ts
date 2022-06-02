import { Episode } from '../../models/Episode'
import { EpisodeModel } from '../../models'
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Podcast, PodcastModel } from '../../models/Podcast'
import { Library, LibraryModel } from '../../models/Library'
import { UserContext } from '../../models/Context'
import { DocumentType, Ref } from '@typegoose/typegoose'
import { Collection, CollectionModel } from '../../models/Collection'
import { Playlist, PlaylistInput, PlaylistModel } from '../../models/Playlist'
import { ObjectId } from 'mongodb'
import { getEpisodesInPodcastList } from './PlaylistResolver'
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
    @Query((returns) => Episode)
    async getEpisodesForSubscribedPodcasts(
        @Arg('lastDateFetched') lastDateFetched: Date,
        @Arg('page') page: number,
        @Ctx() { library }: UserContext,
    ): Promise<Episode[]> {
        return getEpisodesInPodcastList(library.subscribedPodcasts, lastDateFetched, page)
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
    async createCollection(@Arg('collectionName') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const collection = new CollectionModel({ name: slug })
        await collection.save()
        library.collections.push(collection._id)
        await library.save()

        return getFullLibrary(library._id)
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
    @Mutation((returns) => Library)
    async addPodcastToCollection(
        @Arg('slug') slug: string,
        @Arg('collectionId') collectionId: string,
        @Ctx() { library }: UserContext,
    ): Promise<Library> {
        const collection = await CollectionModel.findOne({ _id: collectionId })
        const podcast = await PodcastModel.findOne<DocumentType<Podcast>>({ slug })
        if (podcast && collection) {
            collection.podcasts.push(podcast._id)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async removePodcastFromCollection(
        @Arg('slug') slug: string,
        @Arg('collectionId') collectionId: string,
        @Ctx() { library }: UserContext,
    ): Promise<Library> {
        const podcast = await PodcastModel.findOne<DocumentType<Podcast>>({ slug })
        const collection = await CollectionModel.findOne({ _id: collectionId })
        if (podcast && collection) {
            const indx = collection.podcasts.findIndex((podcast_id) => new ObjectId(podcast._id).equals(podcast_id.toString()))
            if (indx > -1) {
                collection.podcasts.splice(indx, 1)
                await collection.save()
            }
        }
        return getFullLibrary(library._id)
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
        @Arg('playlist') { name, coverImageUrl, description, themeColor }: PlaylistInput,
        @Ctx() { library }: UserContext,
    ): Promise<Playlist> {
        const playlist = await PlaylistModel.findOne({ _id: playlistId })
        if (playlist) {
            playlist.name = name
            playlist.coverImageUrl = coverImageUrl
            playlist.description = description
            playlist.themeColor = themeColor
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
    @Mutation((returns) => Library)
    async addEpisodeToPlaylist(
        @Arg('episodeSlug') episodeSlug: string,
        @Arg('collectionId') playlistId: string,
        @Ctx() { library }: UserContext,
    ): Promise<Library> {
        const episode = await EpisodeModel.findOne<DocumentType<Episode>>({ slug: episodeSlug })
        const playlist = await PlaylistModel.findOne({ _id: playlistId })
        if (episode && playlist) {
            playlist.episodes.push(episode)
            await playlist.save()
        }

        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async removeEpisodeFromPlaylist(
        @Arg('episodeSlug') episodeSlug: string,
        @Arg('playlistId') collectionId: string,
        @Ctx() { library }: UserContext,
    ): Promise<Library> {
        const episode = await EpisodeModel.findOne<DocumentType<Episode>>({ slug: episodeSlug })
        const playlist = await PlaylistModel.findOne({ _id: collectionId })
        if (episode && playlist) {
            const indx = playlist.episodes.findIndex((episode_id) => episode._id.equals(episode_id.toString()))
            if (indx > -1) {
                playlist.episodes.splice(indx, 1)
                await playlist.save()
            }
        }
        return getFullLibrary(library._id)
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
                foreignField: '_id',
                localField: 'podcasts',
                as: 'podcasts',
                pipeline: [
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
                            foreignField: '_id',
                            localField: 'podcasts',
                            as: 'podcasts',
                            pipeline: [
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
                foreignField: '_id',
                localField: 'likedEpisodes',
                as: 'likedEpisodes',
            },
        },
        {
            $lookup: {
                from: 'episodes',
                foreignField: '_id',
                localField: 'archivedEpisodes',
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
                            localField: 'episodes',
                            foreignField: '_id',
                            as: 'episodes',
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'podcasts',
                foreignField: '_id',
                localField: 'subscribedPodcasts',
                as: 'subscribedPodcasts',
                pipeline: [
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
        {
            $lookup: {
                from: 'podcasts',
                foreignField: '_id',
                localField: 'podsOnTap',
                as: 'podsOnTap',
                pipeline: [
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
    return libs[0]
}
