import { prop, Ref } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'
import { Play } from './Play'

@ObjectType()
export class PlayingQueue {
    @Field((type) => ID)
    @prop()
    public _id: string

    @Field((type) => [Play])
    @prop({ ref: 'Play', default: [] })
    public plays: Ref<Play>[]
}
