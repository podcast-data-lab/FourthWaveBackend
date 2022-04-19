import { prop } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { UiMode } from './UiMode'

@ObjectType()
export class UserPreference {
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
