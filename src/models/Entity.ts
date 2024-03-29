import { prop, getModelForClass, Ref } from '@typegoose/typegoose'
import { ObjectType, Field, ID } from 'type-graphql'
import { Episode } from './Episode'
import { Podcast } from './Podcast'

@ObjectType()
export class Entity {
    @Field((type) => ID)
    _id: string

    @Field()
    @prop()
    type!: string

    /**
     * Case insentitive field:
     * https://www.mongodb.com/docs/manual/core/index-case-insensitive/#case-insensitive-indexes
     * https://stackoverflow.com/questions/13991604/mongoose-schema-validating-unique-field-case-insensitive
     */
    @Field()
    @prop({
        index: {
            collation: { locale: 'en', strength: 2 },
        },
    })
    name!: string

    @Field((type) => Boolean, { nullable: true })
    @prop({ default: false })
    featured?: boolean

    @Field((type) => [Episode])
    @prop({ ref: 'Episode', default: [] })
    episodes: Ref<Episode>[]

    @Field((type) => [Podcast])
    @prop({ ref: 'Podcast', default: [] })
    podcasts: Ref<Podcast>[]

    @Field({ nullable: true })
    @prop({
        type: String,
    })
    coverImageUrl: string
}
export const EntityModel = getModelForClass(Entity)
