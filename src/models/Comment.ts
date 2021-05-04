import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { Podcast } from './Podcast'
import { Category } from './Category'
import { User } from './User'

@ObjectType()
export class Comment {
  @Field()
  @prop({ type: String, required: true })
  content: string

  @Field(type => Category)
  @prop({ ref: () => Category })
  categories: Ref<Category>[]

  @Field(type => Podcast)
  @prop({ ref: () => Podcast })
  podcast: Ref<Podcast>

  @Field(type => User)
  @prop({ type: () => User })
  userId: Ref<User>

  @Field(type => [User])
  @prop({ ref: () => User })
  likes: Ref<User>[]
}

export const CommentModel = getModelForClass(Comment)
