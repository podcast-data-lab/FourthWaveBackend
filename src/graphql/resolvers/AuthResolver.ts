import { GraphQLError } from 'graphql'
import { Resolver, Mutation, Ctx } from 'type-graphql'
import { signInOrCreateUser } from '../../db/authentication'
import { User } from '../../models/User'

@Resolver((of) => User)
export default class AuthResolver {
    @Mutation((returns) => User)
    async signUp(@Ctx() context): Promise<User | GraphQLError> {
        return await signInOrCreateUser(context.uid, context.email)
    }
}
