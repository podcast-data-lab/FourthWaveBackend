import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { Locale } from './Locale'
import { Comment } from './Comment'
import { Person } from './Person'
import { Theme } from './Theme'
import { User } from './User'
import { Topic } from './Topic'
import { Play } from './Play'

@ObjectType()
export class Episode {
  @Field()
  @prop()
  public title: string

  @Field(type => Date)
  @prop({ type: () => Date })
  public datePublished: Date

  @Field({ nullable: true })
  @prop()
  public description: string

  @Field({ nullable: true })
  @prop()
  public duration: string

  @Field()
  @prop()
  public sourceUrl: string

  @Field({ nullable: true })
  @prop()
  public image: string

  @Field({ nullable: true })
  @prop()
  public podcast: string

  @Field({ nullable: true })
  @prop({ default: 0 })
  public epNo: number

  @Field({ nullable: true })
  @prop({ default: 0 })
  public snNo: number

  @Field(type => [User], { nullable: true })
  @prop({ ref: () => User })
  public likes: Ref<User>[]

  @Field(type => [Topic])
  @prop({ type: () => [Topic] })
  public topics?: Topic[]

  @Field(type => [Theme], { nullable: true })
  @prop({ ref: () => 'Theme', default: [] })
  public themes?: Ref<Theme>[]

  @Field(type => [Comment], { nullable: true })
  @prop({ ref: 'Comment', default: [] })
  public comments: Comment[]

  @Field(type => [Person], { nullable: true })
  @prop({ ref: 'Person', default: [] })
  public people: Ref<Person>[]

  @Field(type => [Locale], { nullable: true })
  @prop({ ref: 'Locale', default: [] })
  public locations: Ref<Locale>[]

  @Field(type => Play, { nullable: true })
  @prop({ ref: () => 'Play', default: 0 })
  public plays: Ref<Play>[]

  @Field({ nullable: true })
  @prop({
    type: String,
    required: true
  })
  public slug: string
}
