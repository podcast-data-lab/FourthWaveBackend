import { prop, Ref } from '@typegoose/typegoose'
import { ObjectID } from 'bson'
import { ObjectId } from 'mongodb'
import { ObjectType, Field, ID } from 'type-graphql'
import { Episode } from './Episode'

@ObjectType()
export class Play {
    @Field((type) => ID)
    _id: string

    @Field((type) => Episode)
    @prop({ ref: 'Episode' })
    episode: Ref<Episode>

    @Field((type) => Number)
    @prop({ type: () => Number })
    position: number

    @Field((type) => Boolean)
    @prop({ type: () => Boolean, default: false })
    started: boolean

    @Field((type) => Boolean, { nullable: true })
    @prop({ type: () => Boolean, default: false })
    completed: boolean
}
