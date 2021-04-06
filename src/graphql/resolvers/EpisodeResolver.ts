import { Query, Resolver } from "type-graphql";
import { Episode } from "../../models/Episode";

@Resolver((of) => Episode)
export default class EpisodeResolver {
  @Query()
  print(): String {
    console.log("here");
    return "Hello";
  }
}
