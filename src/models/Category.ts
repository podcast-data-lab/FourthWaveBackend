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
        type: Boolean,
        default: false,
    })
    featured: boolean

    @Field({ nullable: true })
    @prop({
        type: Boolean,
        default: false,
    })
    visible: boolean

    @Field({ nullable: true })
    @prop({
        type: String,
    })
    coverImageUrl: string

    @Field((type) => User, { nullable: true })
    @prop({ ref: () => User })
    contributor?: Ref<User>

    @Field((type) => [Episode], { nullable: true })
    @prop({ ref: 'Episode' })
    episodes?: Ref<Episode>[]

    @Field((type) => [Podcast], { nullable: true })
    @prop({ ref: 'Podcast' })
    podcasts?: Ref<Podcast>[]

    @Field((type) => [Comment], { nullable: true })
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
