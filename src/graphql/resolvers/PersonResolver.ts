import { Query, Resolver } from 'type-graphql'

import { Person } from '../../models/Person'

@Resolver((of) => Person)
export default class PersonResolver {
    @Query()
    print(): String {
        return 'Hello'
    }
}
