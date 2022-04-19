import { prop, getModelForClass, Ref, pre, DocumentType } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { Episode } from './Episode'
import { Play } from './Play'
import { Podcast } from './Podcast'
const emailValidator = require('email-validator')

@ObjectType()
export class User {
    @Field()
    @prop()
    public name: string

    @Field()
    @prop({
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: emailValidator.validate,
            message: (props) => `${props.value} is not a valid email address`,
        },
    })
    public email: string

    @Field({ nullable: true })
    @prop({
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 8,
    })
    public uid: string

    @Field((type) => Boolean)
    @prop({ default: false })
    public active: boolean

    @Field((type) => [String])
    @prop({ type: () => [String], default: [] })
    public contributions: string[]

    @Field((type) => [Podcast])
    @prop({ ref: 'Podcast', default: [] })
    public likedPodcasts: Ref<Podcast>[]

    @Field((type) => [Podcast])
    @prop({ ref: 'Podcast', default: [] })
    public subscribedPodcasts: Ref<Podcast>[]

    @Field((type) => [Episode])
    @prop({ ref: 'Episode', default: [] })
    public likedEpisodes: Ref<Episode>[]

    @Field((type) => [Episode])
    @prop({ ref: 'Episode', default: [] })
    public bookmarkedEpisodes: Ref<Episode>[]

    @Field((type) => [Play])
    @prop({ ref: 'Play', default: [] })
    public plays: Ref<Play>[]

    @Field((type) => [Play])
    @prop({ ref: 'Play', default: [] })
    public queue: Ref<Play>[]

    @Field()
    @prop({ default: 1 })
    public playingSpeed: number

    @Field()
    @prop({ default: 0.5 })
    public volume: number

    @Field()
    @prop({ default: false })
    public admin: boolean
}
