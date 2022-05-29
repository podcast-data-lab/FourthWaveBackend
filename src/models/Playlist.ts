import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'
import { Episode } from './Episode'

@ObjectType({
    description: 'A playlist contains a list of episodes added by a user.',
})
export class Playlist {
    @Field((type) => ID)
    _id: string

    @Field()
    @prop({
        type: String,
        required: true,
    })
    public name: string

    @Field()
    @prop({
        type: String,
    })
    public description: string

    @Field()
    @prop({
        type: String,
    })
    public coverImageUrl: string

    @Field()
    @prop({
        type: String,
    })
    public themeColor: string

    @Field((type) => [Episode])
    @prop({ ref: 'Episode', default: [] })
    public episodes: Ref<Episode>[]
}
export const PlaylistModel = getModelForClass(Playlist)
