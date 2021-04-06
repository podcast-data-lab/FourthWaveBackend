import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { Podcast } from "./Podcast";
import { Theme } from "./Theme";
import { User } from "./User";

@ObjectType()
export class Comment {
  @Field()
  @prop({ type: String, required: true })
  content: string;

  @Field((type) => Theme)
  @prop({ ref: () => Theme })
  theme: Ref<Theme>[];

  @Field((type) => Podcast)
  @prop({ ref: () => Podcast })
  podcast: Ref<Podcast>;

  @Field((type) => User)
  @prop({ type: () => User })
  userId: Ref<User>;

  @Field((type) => [User])
  @prop({ ref: () => User })
  likes: Ref<User>[];
}

export const CommentModel = getModelForClass(Comment);
