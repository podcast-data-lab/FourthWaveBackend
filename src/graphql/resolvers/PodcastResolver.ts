import { Query, Resolver } from "type-graphql";

import { Podcast } from "../../models/Podcast";

@Resolver((of) => Podcast)
export default class PodcastResolver {
  @Query()
  print(): String {
    console.log("here");
    return "Hello";
  }
}
