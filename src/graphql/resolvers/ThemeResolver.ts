import { Query, Resolver } from "type-graphql";

import { Theme } from "../../models/Theme";

@Resolver((of) => Theme)
export default class ThemeResolver {
  @Query()
  print(): String {
    console.log("here");
    return "Hello";
  }
}
