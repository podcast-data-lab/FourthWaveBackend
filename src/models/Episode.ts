import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, InputType, ObjectType } from 'type-graphql'
import { Locale } from './Locale'
import { Comment } from './Comment'
import { Person } from './Person'
import { Category } from './Category'
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
  @prop({ ref: 'Topic' })
  public topics?: Ref<Topic>[]

  @Field(type => [Category], { nullable: true })
  @prop({ ref: () => 'Category', default: [] })
  public categories?: Ref<Category>[]

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

@InputType()
export class EpisodeInput {
  @Field()
  public title: string

  @Field(type => Date)
  public datePublished: Date

  @Field({ nullable: true })
  public description: string

  @Field({ nullable: true })
  public duration: string

  @Field()
  public sourceUrl: string

  @Field({ nullable: true })
  public image: string

  @Field({ nullable: true })
  public podcast: string

  @Field({ nullable: true })
  public epNo: number

  @Field({ nullable: true })
  public snNo: number

  @Field({ nullable: true })
  public slug: string

  // @Field({ nullable: true })
  // "__typename": string
}
