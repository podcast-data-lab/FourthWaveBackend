import {
  prop,
  getModelForClass,
  Ref,
  pre,
  DocumentType
} from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { Episode } from './Episode'
import { Play } from './Play'
import { Podcast } from './Podcast'
const emailValidator = require('email-validator')
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 12

@pre<User>('save', async function preSave (next) {
  const user = this
  if (!user.isModified('password')) return next()
  try {
    const hash = await bcrypt.hash(user.password, SALT_ROUNDS)
    user.password = hash
    return next()
  } catch (err) {
    return next(err)
  }
})
@ObjectType()
export class User {
  @Field()
  @prop()
  public firstname: string

  @Field()
  @prop()
  public lastname: string

  @Field()
  @prop({ required: true, minlength: 4, unique: true, trim: true })
  public username: string

  @Field()
  @prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: emailValidator.validate,
      message: props => `${props.value} is not a valid email address`
    }
  })
  public email: string

  @Field()
  @prop({
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 8
  })
  public password: string

  @Field(type => Boolean)
  @prop({ default: false })
  public active: boolean

  @Field(type => [String])
  @prop({ type: () => [String], default: [] })
  public contributions: string[]

  @Field(type => [Podcast])
  @prop({ ref: 'Podcast', default: [] })
  public LikedPodcasts: Ref<Podcast>[]

  @Field(type => [Podcast])
  @prop({ ref: 'Podcast', default: [] })
  public subscribedPodcasts: Ref<Podcast>[]

  @Field(type => [Episode])
  @prop({ ref: 'Episode', default: [] })
  public likedEpisodes: Ref<Episode>[]

  @Field(type => [Episode])
  @prop({ ref: 'Episode', default: [] })
  public bookmarkedEpisodes: Ref<Episode>[]

  @Field(type => [Play])
  @prop({ ref: 'Play', default: [] })
  public plays: Ref<Play>[]

  @Field()
  @prop({ default: 1 })
  public playingSpeed: number

  @Field()
  @prop({ default: 0.5 })
  public volume: number

  @Field()
  @prop({ default: false })
  public admin: boolean

  @Field()
  @prop({ default: 'false' })
  public authtoken: string

  public async comparePassword (this: DocumentType<User>, candidate: string) {
    return bcrypt.compare(candidate, this.password)
  }
}

export const UserModel = getModelForClass(User)
