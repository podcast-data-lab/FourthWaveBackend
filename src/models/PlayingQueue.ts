import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'
import { Play } from './Play'
import { ObjectId } from 'mongoose'
@ObjectType()
export class PlayingQueue {
    @Field((type) => [Play])
    @prop({ ref: 'Play', default: [] })
    public plays: Ref<Play>[]
}

export const PlayingQueueModel = getModelForClass(PlayingQueue)
