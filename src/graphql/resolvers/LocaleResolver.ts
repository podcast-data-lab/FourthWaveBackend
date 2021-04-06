import { Query, Resolver } from "type-graphql";

import { Locale } from "../../models/Locale";

@Resolver((of) => Locale)
export default class LocationResolver {
  @Query()
  print(): String {
    console.log("here");
    return "Hello";
  }
}
