import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { ObjectID } from 'bson'
import { Field, ID, ObjectType } from 'type-graphql'
import { Category } from './Category'
import { Collection } from './Collection'
import { Episode } from './Episode'
import { Playlist } from './Playlist'
import { Podcast } from './Podcast'

@ObjectType()
export class Library {
    @Field((type) => ID)
    _id: ObjectID

    @Field((type) => [Episode], { description: "A user's bookmarked episodes" })
    @prop({ ref: 'Episode', default: [] })
    public bookmarkedEpisodes: Ref<Episode>[]

    @Field((type) => [Collection], { description: "A user' collections" })
    @prop({ ref: 'Category', default: [] })
    public collections: Ref<Collection>[]

    @Field((type) => [Playlist], { description: "A user' playlists" })
    @prop({ ref: 'Playlist', default: [] })
    public playlists: Ref<Playlist>[]

    @Field((type) => [Category], { description: 'The categories that a user is following.' })
    @prop({ ref: 'Category', default: [] })
    public followedCategories: Ref<Category>[]

    @Field((type) => [Episode], { description: 'The episodes that a user has liked' })
    @prop({ ref: 'Episode', default: [] })
    public likedEpisodes: Ref<Episode>[]

    @Field((type) => [Episode], { description: 'The episodes that a user adds to listen later list' })
    @prop({ ref: 'Episode', default: [] })
    public listenLater: Ref<Episode>[]

    @Field((type) => [Episode], {
        description: 'The Podcast Episodes that a user has archived - listened to or manually archived',
    })
    @prop({ ref: 'Episode', default: [] })
    public archivedEpisodes: Ref<Episode>[]

    @Field((type) => [Podcast], { description: 'The podcasts that the user has subscribed to.' })
    @prop({ ref: 'Podcast', default: [] })
    public subscribedPodcasts: Ref<Podcast>[]

    @Field((type) => [Podcast], { description: 'User\'s podcasts "on Tap"' })
    @prop({ ref: 'Podcast', default: [] })
    public podsOnTap: Ref<Podcast>[]
}
export const LibraryModel = getModelForClass(Library)
