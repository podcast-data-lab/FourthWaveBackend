import { prop } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'

@ObjectType()
export class Author {
    @Field((type) => ID)
    _id: string

    @Field({ nullable: true })
    @prop()
    public name?: string

    @Field({ nullable: true })
    @prop({
        type: String,
    })
    public email?: string

    @Field({ nullable: true })
    @prop({
        type: String,
    })
    public slug?: string
}
