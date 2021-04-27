import { Query, Resolver } from 'type-graphql'
import { User } from '../../models/User'

@Resolver(of => User)
export default class UserResolver {}
