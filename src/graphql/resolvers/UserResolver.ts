import { authenticateUser } from './../../db/authentication'
import { UserModel } from './../../models/User'
import {
  Arg,
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Query,
  Resolver
} from 'type-graphql'
import { User } from '../../models/User'
import { GraphQLError } from 'graphql'

@ArgsType()
class UserSignUpArgs {
  @Field(type => String, { nullable: false })
  username: string

  @Field(type => String, { nullable: false })
  email: string

  @Field(type => String, { nullable: false })
  firstname: string

  @Field(type => String, { nullable: true })
  lastname: string

  @Field(type => String, { nullable: true })
  password: string
}
@Resolver(of => User)
export default class UserResolver {
  @Mutation(returns => String)
  async signup (
    @Args() { username, email, firstname, lastname, password }: UserSignUpArgs
  ): Promise<string | GraphQLError> {
    const user = new UserModel({
      username: username,
      email: email,
      firstname: firstname,
      lastname: lastname,
      password: password
    })
    try {
      await user.save()
    } catch (error) {
      console.log(error)
      return new GraphQLError(error.message)
    }
    return JSON.stringify(user)
  }

  @Mutation(returns => User)
  async signin (
    @Arg('username') username: string,
    @Arg('password') password: string
  ) {
    const user = await authenticateUser(username, password)
    return user
  }

  @Mutation(returns => Boolean)
  async signout () {
    return true
  }

  @Mutation(returns => User)
  async signInWithToken (@Ctx() context): Promise<User> {
    const userContext = context
    const user = await UserModel.findOne({ username: userContext.username })
    return user
  }
}
