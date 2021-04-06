import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { Comment } from "./Comment";
import { Episode } from "./Episode";
import { User } from "./User";

@ObjectType()
export class Theme {
  @Field()
  @prop({
    type: String,
    required: true,
    unique: true,
  })
  title: string;

  @Field((type) => User)
  @prop({ ref: () => User })
  contributor: Ref<User>;

  @Field((type) => [Episode])
  @prop({ ref: "Episode" })
  podcastEpisodes: Ref<Episode>[];

  @Field((type) => [Comment])
  @prop({ ref: "Comment" })
  comments: Ref<Comment>[];

  @prop({
    type: String,
    required: true,
    unique: true,
  })
  slug: string;
}

export const ThemeModel = getModelForClass(Theme);
