import {
  prop,
  getModelForClass,
  Ref,
  DocumentType,
  mongoose
} from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { Episode } from './Episode'

@ObjectType()
export class Podcast {
  @Field()
  @prop()
  public title: string

  @Field({ nullable: true })
  @prop()
  publisher: string

  @Field()
  @prop()
  rssFeed: string

  @Field()
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
  @Field(type => Date)
  @prop({ type: () => Date })
  lastRssBuildDate: Date

  @Field()
  @prop({
    type: String,
    required: true,
    unique: true
  })
  slug: string

  @Field(type => [String])
  @prop({ type: () => [String] })
  categories: string[]

  @Field(type => [String])
  @prop({ type: () => [mongoose.Types.ObjectId], default: [] })
  episodes: mongoose.Types.ObjectId[]
}

export const PodcastModel = getModelForClass(Podcast)
