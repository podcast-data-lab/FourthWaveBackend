import { GraphQLError } from 'graphql'
import { Resolver, Mutation, Ctx } from 'type-graphql'
import { signInOrCreateUser } from '../../db/authentication'
import { UserContext } from '../../models/Context'
import { User } from '../../models/User'

@Resolver((of) => User)
export default class AuthResolver {
    @Mutation((returns) => User)
    async signUp(@Ctx() context: UserContext): Promise<User | GraphQLError> {
        return await signInOrCreateUser(context.user.uid, context.user.email)
    }
}
