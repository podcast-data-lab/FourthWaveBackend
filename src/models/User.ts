import { prop, Ref } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'
import { UserPermission } from './enums/Permissions'
import { Library } from './Library'
import { Play } from './Play'
import { PlayingQueue } from './PlayingQueue'
import { UserPreference } from './Preference'

@ObjectType()
export class User {
    @Field((type) => ID)
    _id: string

    @Field({ nullable: true })
    @prop()
    public name: string

    @Field({ nullable: true })
    @prop()
    public deviceId: string

    @Field()
    @prop({
        type: String,
        lowercase: true,
        unique: true,
    })
    public email: string

    @Field()
    @prop({
        type: String,
        unique: true,
        minlength: 8,
    })
    public uid: string

    @Field((type) => Boolean)
    @prop({ default: true })
    public active: boolean

    @Field((type) => [UserPermission])
    @prop({ default: [] })
    permissions: UserPermission[]

    @Field((type) => [String])
    @prop({ type: () => [String], default: [] })
    public contributions: string[]

    @Field()
    @prop({ default: false })
    public admin: boolean

    @Field((type) => [Play])
    @prop({ ref: 'Play', default: [] })
    public plays: Ref<Play>[]

    @Field((type) => PlayingQueue)
    @prop({ ref: 'PlayingQueue' })
    public playingQueue: Ref<PlayingQueue>

    @Field((type) => Library)
    @prop({ ref: 'Library' })
    public library: Ref<Library>

    @Field((type) => UserPreference)
    @prop({ ref: 'Preference' })
    public preferences: Ref<UserPreference>
}
