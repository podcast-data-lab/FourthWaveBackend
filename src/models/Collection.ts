import { prop, Ref } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { Podcast } from './Podcast'

@ObjectType()
export class Collection {
    @Field((type) => [Podcast])
    @prop({ ref: 'Podcast', default: [] })
    public podcasts: Ref<Podcast>[]
}
