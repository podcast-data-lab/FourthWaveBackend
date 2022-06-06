import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'
import { Comment } from './Comment'
import { Episode } from './Episode'
import { Podcast } from './Podcast'
import { User } from './User'

@ObjectType()
export class Category {
    @Field((type) => ID)
    _id: string

    @Field()
    @prop({
        type: String,
        required: true,
        unique: true,
    })
    title: string

    @Field({ nullable: true })
    @prop({
        type: String,
    })
    coverImageUrl: string

    @Field((type) => User)
    @prop({ ref: () => User })
    contributor?: Ref<User>

    @Field((type) => [Episode])
    @prop({ ref: 'Episode' })
    episodes?: Ref<Episode>[]

    @Field((type) => [Podcast])
    @prop({ ref: 'Podcast' })
    podcasts?: Ref<Podcast>[]

    @Field((type) => [Comment])
    @prop({ ref: 'Comment' })
    comments?: Ref<Comment>[]

    @Field()
    @prop({
        type: String,
        required: true,
        unique: true,
    })
    slug: string
}

export const CategoryModel = getModelForClass(Category)
