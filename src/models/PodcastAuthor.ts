import { prop } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class PodcastAuthor {
    @Field()
    @prop()
    public name?: string

    @Field()
    @prop({
        type: String,
    })
    public email?: string
}
