import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { Locale } from "./Locale";
import { Comment } from "./Comment";
import { Person } from "./Person";
import { Theme } from "./Theme";
import { User } from "./User";

@ObjectType()
export class Episode {
  @Field()
  @prop()
  public title: string;

  @Field((type) => Date)
  @prop({ type: () => Date })
  public datePublished: Date;

  @Field()
  @prop()
  public description: string;

  @Field()
  @prop()
  public duration: string;

  @Field()
  @prop()
  public sourceUrl: string;

  @Field()
  @prop()
  public image: string;

  @Field((type) => [User])
  @prop({ ref: () => User })
  public likes: Ref<User>[];

  @Field((type) => [Theme])
  @prop({ ref: () => Theme })
  public themes: Ref<Theme>[];

  @Field((type) => [Comment])
  @prop({ ref: "Comment" })
  public comments: Comment[];

  @Field((type) => [Person])
  @prop({ ref: "Person" })
  public people: Ref<Person>[];

  @Field((type) => [Locale])
  @prop({ ref: "Locale" })
  public locations: Ref<Locale>[];

  @Field()
  @prop({
    type: String,
    required: true,
  })
  public slug: string;
}

export const EpisodeModel = getModelForClass(Episode);
