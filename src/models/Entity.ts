import { prop, getModelForClass, Ref } from '@typegoose/typegoose'
import { ObjectType, Field, ID } from 'type-graphql'
import { Episode } from './Episode'
import { Podcast } from './Podcast'

@ObjectType()
export class Entity {
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

    @Field((type) => [Episode])
    @prop({ ref: 'Episode', default: [] })
    episodes: Ref<Episode>[]

    @Field((type) => [Podcast])
    @prop({ ref: 'Podcast', default: [] })
    podcasts: Ref<Podcast>[]
}
export const EntityModel = getModelForClass(Entity)
