import {
  prop,
  getModelForClass,
  Ref,
  DocumentType,
  mongoose
} from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { Episode } from './Episode'
import { Topic } from './Topic'

@ObjectType()
export class Podcast {
  @Field()
  @prop()
  public title: string

  @Field({ nullable: true })
  @prop()
  publisher: string

  @Field({ nullable: true })
  @prop()
  rssFeed: string

  @Field({ nullable: true })
  @prop()
  base64image: string

  @Field({ nullable: true })
  @prop()
  link: string

  @Field()
  @prop()
  image: string

  @Field()
  @prop()
  description: string

  @Field(type => [String])
  @prop({ type: () => [String] })
  palette: [string]

  public async setPalette (this: DocumentType<Podcast>, palette: [string]) {
    this.palette = palette
    await this.save()
  }
  @Field(type => Date, { nullable: true })
  @prop({ type: () => Date })
  lastRssBuildDate: Date

  @Field()
  @prop({
    type: String,
    required: true,
    unique: true
  })
  slug: string

  @Field(type => [String], { nullable: true })
  @prop({ type: () => [String] })
  categories: string[]

  @Field(type => [Topic], {
    nullable: true
  })
  @prop({ type: () => [Topic], nullable: true })
  public topics?: Topic[]

  @Field(type => [String], { nullable: true })
  @prop({ type: () => [mongoose.Types.ObjectId], default: [] })
  episodes: mongoose.Types.ObjectId[]
}

export const PodcastModel = getModelForClass(Podcast)
