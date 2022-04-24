import { prop } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'
import { UiMode } from './enums/UiMode'
import { ObjectId } from 'mongoose'
@ObjectType()
export class UserPreference {
    @Field((type) => ID)
    @prop({ type: () => String })
    public _id: ObjectId

    @Field((type) => UiMode)
    @prop({ default: UiMode.Light })
    uiMode: UiMode

    @Field()
    @prop({ default: 1 })
    playbackSpeed: number

    @Field()
    @prop({ default: false })
    skipAds?: boolean

    @Field()
    @prop({ default: 0.5 })
    volume: number
}
