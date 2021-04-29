import { prop } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class Play {
  @Field()
  @prop()
  episode: string

  @Field()
  @prop()
  position: number
}
