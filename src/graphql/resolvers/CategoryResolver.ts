import { Query, Resolver } from 'type-graphql'

import { Category } from '../../models/Category'

@Resolver(of => Category)
export default class CategoryResolver {
  @Query()
  print (): String {
    console.log('here')
    return 'Hello'
  }
}
