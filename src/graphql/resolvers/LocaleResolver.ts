import { Query, Resolver } from 'type-graphql'

import { Locale } from '../../models/Locale'

@Resolver(of => Locale)
export default class LocationResolver {
  @Query()
  print (): String {
    return 'Hello'
  }
}
