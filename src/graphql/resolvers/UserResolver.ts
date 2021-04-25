import { UserModel } from './../../models/User';
import { Arg, Args, ArgsType, Field, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../../models/User";
import { GraphQLError } from 'graphql';

@ArgsType()
class UserSignUpArgs {
  @Field((type) => String, { nullable: false })
  username: string;

  @Field((type) => String, { nullable: false })
  email: string;

  @Field((type) => String, { nullable: false })
  firstname: string;

  @Field((type) => String, { nullable: true })
  lastname: string;

  @Field((type) => String, { nullable: true })
  password: string;
}
@Resolver((of) => User)
export default class UserResolver {
  @Mutation((returns) => String)
  async signup(
    @Args() { username, email, firstname, lastname, password }: UserSignUpArgs
  ): Promise<string | GraphQLError> {
    const user = new UserModel({
      username: username,
      email: email,
      firstname: firstname,
      lastname: lastname,
      password: password,
    });
    try {
      await user.save();
    } catch (error) {
      console.log(error);
      return new GraphQLError(error.message);
    }
    return JSON.stringify(user);
  }

  @Mutation((returns) => String)
  async signin(@Arg('username') username: string, @Arg("password") password: string) {
    return "signedin"
  }
}
