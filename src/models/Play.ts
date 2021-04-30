import { prop } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class Play {
  @Field({ description: 'The slug of the epiosde' })
  @prop()
  episode: string

  @Field()
  @prop()
  position: number
}
