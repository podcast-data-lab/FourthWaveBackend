import { prop, Ref } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'
import { Podcast } from './Podcast'

@ObjectType()
export class Collection {
    @Field((type) => ID)
    @prop()
    public _id: string

    @Field((type) => [Podcast])
    @prop({ ref: 'Podcast', default: [] })
    public podcasts: Ref<Podcast>[]
}
