import { Query, Resolver } from "type-graphql";
import { User } from "../../models/User";

@Resolver((of) => User)
export default class UserResolver {
  @Query()
  print(): String {
    console.log("here");
    return "Hello";
  }
}
