import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'
import { Podcast } from './Podcast'

@ObjectType({
    description: 'A collection contains a list of podcasts grouped by a user',
})
export class Collection {
    @Field((type) => ID)
    _id: string

    @Field()
    @prop({
        type: String,
        required: true,
    })
    public name: string

    @Field((type) => [Podcast])
    @prop({ ref: 'Podcast', default: [] })
    public podcasts: Ref<Podcast>[]
}
export const CollectionModel = getModelForClass(Collection)
