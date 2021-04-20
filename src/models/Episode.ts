import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { Locale } from "./Locale";
import { Comment } from "./Comment";
import { Person } from "./Person";
import { Theme } from "./Theme";
import { User } from "./User";

@ObjectType()
export class Episode {
  @Field({nullable:true})
  @prop()
  public title: string;

  @Field((type) => Date, {nullable:true})
  @prop({ type: () => Date })
  public datePublished: Date;

  @Field({nullable:true})
  @prop()
  public description: string;

  @Field({nullable:true})
  @prop()
  public duration: string;

  @Field({nullable:true})
  @prop()
  public sourceUrl: string;

  @Field({nullable:true})
  @prop()
  public image: string;

  @Field((type) => [User], {nullable:true})
  @prop({ ref: () => User })
  public likes: Ref<User>[];

  @Field((type) => [Theme], {nullable:true})
  @prop({ ref: () => Theme })
  public themes: Ref<Theme>[];

  @Field((type) => [Comment], {nullable:true})
  @prop({ ref: "Comment" })
  public comments: Comment[];

  @Field((type) => [Person], {nullable:true})
  @prop({ ref: "Person" })
  public people: Ref<Person>[];

  @Field((type) => [Locale], {nullable:true})
  @prop({ ref: "Locale" })
  public locations: Ref<Locale>[];

  @Field({nullable:true})
  @prop({
    type: String,
    required: true,
  })
  public slug: string;
}

export const EpisodeModel = getModelForClass(Episode);
