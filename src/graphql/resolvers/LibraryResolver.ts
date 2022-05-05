import { Episode } from '../../models/Episode'
import { EpisodeModel } from '../../models'
import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql'
import { Podcast, PodcastModel } from '../../models/Podcast'
import { Library, LibraryModel } from '../../models/Library'
import { UserContext } from '../../models/Context'
import { DocumentType } from '@typegoose/typegoose'
import { CollectionModel } from '../../models/Collection'
import { PlaylistModel } from '../../models/Playlist'

@Resolver((of) => Library)
export default class LibraryResolver {
    @Authorized()
    @Mutation((returns) => Library)
    async subscribeToPodcast(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const podcast = await PodcastModel.findOne<DocumentType<Podcast>>({ slug })
        if (podcast) {
            library.subscribedPodcasts.push(podcast._id)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async unsubscribeToPodcast(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const podcasts = await PodcastModel.findOne({ slug })

        const indx = library.subscribedPodcasts.findIndex((podcast_id) => podcast_id == podcasts._id)
        if (indx > -1) {
            library.subscribedPodcasts.splice(indx, 1)
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
            const indx = library.collections.findIndex((collection_id) => collection_id == collection._id)
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
            const indx = collection.podcasts.findIndex((podcast_id) => podcast_id == podcast._id)
            if (indx > -1) {
                collection.podcasts.splice(indx, 1)
                await collection.save()
            }
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async createPlaylist(@Arg('playlistName') playlistName: string, @Ctx() { library }: UserContext): Promise<Library> {
        const playlist = new PlaylistModel({ name: playlistName })
        await playlist.save()
        library.playlists.push(playlist._id)

        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async deletePlaylist(@Arg('playlistId') playlistId: string, @Ctx() { library }: UserContext): Promise<Library> {
        const playlist = await PlaylistModel.findOne({ _id: playlistId })
        if (playlist) {
            const indx = library.playlists.findIndex((playlist_id) => playlist_id == playlist._id)
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
            playlist.episodes.push(episode._id)
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
            const indx = playlist.episodes.findIndex((episode_id) => episode_id == episode._id)
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
            library.likedEpisodes.push(episode._id)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async unlikeEpisode(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const episode = await EpisodeModel.findOne<DocumentType<Episode>>({ slug })

        const indx = library.likedEpisodes.findIndex((episode_id) => episode_id == episode._id)
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
            library.archivedEpisodes.push(episode._id)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async unArchiveEpisode(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const episode = await EpisodeModel.findOne<DocumentType<Episode>>({ slug })
        const indx = library.archivedEpisodes.findIndex((episode_id) => episode_id == episode._id)
        if (indx > -1) {
            library.archivedEpisodes.splice(indx, 1)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    /* Bookmark & unbookmark a Podcast */
    @Authorized()
    @Mutation((returns) => Library)
    async bookmarkEpisode(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const episode = await EpisodeModel.findOne<DocumentType<Episode>>({ slug })
        if (episode) {
            library.bookmarkedEpisodes.push(episode._id)
            await library.save()
        }
        return getFullLibrary(library._id)
    }

    @Authorized()
    @Mutation((returns) => Library)
    async unbookmarkEpisode(@Arg('slug') slug: string, @Ctx() { library }: UserContext): Promise<Library> {
        const episode = await EpisodeModel.findOne({ slug })
        const indx = library.bookmarkedEpisodes.findIndex((episode_id) => episode_id == episode._id)
        if (indx > -1) {
            library.bookmarkedEpisodes.splice(indx, 1)
            await library.save()
        }
        return getFullLibrary(library._id)
    }
}

export async function getFullLibrary(_id: string): Promise<DocumentType<Library>> {
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
                from: 'podcasts',
                foreignField: '_id',
                localField: 'subscribedPodcasts',
                as: 'subscribedPodcasts',
            },
        },
    ])
    return libs[0]
}
