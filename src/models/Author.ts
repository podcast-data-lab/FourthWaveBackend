import { prop } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class Author {
    @Field({ nullable: true })
    @prop()
    public name?: string

    @Field({ nullable: true })
    @prop({
        type: String,
    })
    public email?: string

    @Field()
    @prop({
        type: String,
    })
    public slug?: string
}
