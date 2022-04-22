import { GraphQLError } from 'graphql'
import { Resolver, Mutation, Ctx } from 'type-graphql'
import { signInOrCreateUser } from '../../db/authentication'
import { Library } from '../../models/Library'
import { User } from '../../models/User'

@Resolver((of) => User)
export default class AuthResolver {
    @Mutation((returns) => User)
    async signUp(@Ctx() context: { user: User; library: Library }): Promise<User | GraphQLError> {
        return await signInOrCreateUser(context.user.uid, context.user.email)
    }
}
