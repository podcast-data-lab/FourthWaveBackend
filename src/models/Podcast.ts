import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { Episode } from "./Episode";

@ObjectType()
export class Podcast {
  @Field()
  @prop()
  public title: string;

  @Field({ nullable: true })
  @prop()
  publisher: string;

  @Field()
  @prop()
  rssFeed: string;

  @Field({ nullable: true })
  @prop()
  link: string;

  @Field()
  @prop()
  image: string;

  @Field()
  @prop()
  description: string;

  @Field((type) => [String])
  @prop({ type: () => [String] })
  palette: [string];

  @Field((type) => Date)
  @prop({ type: () => Date })
  lastRssBuildDate: Date;

  @Field()
  @prop({
    type: String,
    required: true,
    unique: true,
  })
  slug: string;

  @Field((type) => [String])
  @prop({ type: () => [String] })
  categories: string[];

  @Field((type) => [Episode])
  @prop({ ref: () => "Episode" })
  episodes: Ref<Episode[]>;
}

export const PodcastModel = getModelForClass(Podcast);
