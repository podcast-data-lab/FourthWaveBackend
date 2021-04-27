import { prop, getModelForClass } from '@typegoose/typegoose'
import { ObjectType, Field } from 'type-graphql'

@ObjectType()
export class Topic {
  @Field()
  @prop()
  type!: string

  @Field()
  @prop()
  name!: string
}
export const TopicModel = getModelForClass(Topic)
