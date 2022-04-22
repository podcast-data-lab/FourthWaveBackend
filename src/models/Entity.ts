import { prop, getModelForClass, Ref } from '@typegoose/typegoose'
import { ObjectType, Field } from 'type-graphql'
import { Episode } from './Episode'
import { Podcast } from './Podcast'

@ObjectType()
export class Entity {
    @Field()
    @prop()
    type!: string

    @Field()
    @prop()
    name!: string

    @Field((type) => [Episode])
    @prop({ ref: 'Episode', default: [] })
    episodes: Ref<Episode>[]

    @Field((type) => [Podcast])
    @prop({ ref: 'Podcast', default: [] })
    podcasts: Ref<Podcast>[]
}
export const EntityModel = getModelForClass(Entity)
