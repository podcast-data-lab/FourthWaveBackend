import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { ObjectID } from 'bson'
import { ObjectId } from 'mongodb'
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

    @Field((type) => [Episode])
    @prop({ ref: 'Episode', default: [] })
    public bookmarkedEpisodes: Ref<Episode>[]

    @Field((type) => [Collection])
    @prop({ ref: 'Category', default: [] })
    public collections: Ref<Collection>[]

    @Field((type) => [Playlist])
    @prop({ ref: 'Playlist', default: [] })
    public playlists: Ref<Playlist>[]

    @Field((type) => [Category])
    @prop({ ref: 'Category', default: [] })
    public followedCategories: Ref<Category>[]

    @Field((type) => [Episode])
    @prop({ ref: 'Episode', default: [] })
    public likedEpisodes: Ref<Episode>[]

    @Field((type) => [Episode])
    @prop({ ref: 'Episode', default: [] })
    public archivedEpisodes: Ref<Episode>[]

    @Field((type) => [Podcast])
    @prop({ ref: 'Podcast', default: [] })
    public subscribedPodcasts: Ref<Podcast>[]
}
export const LibraryModel = getModelForClass(Library)
