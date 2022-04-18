import { Arg, Query, Resolver } from 'type-graphql'
import { shuffle } from '../../lib/functions'
import { Entity, EntityModel } from '../../models/Entity'

@Resolver(of => Entity)
export class EntityResolver {
  @Query(returns => [Entity], {
    description: 'Returns a list of recommended topics'
  })
  @Query(returns => [Entity])
  async getEntitySearchRecommendations (): Promise<Entity[]> {
    const tpcs = await EntityModel.aggregate([
      {
        $project: {
          type: 1,
          name: 1,
          valid: {
            $in: [
              '$type',
              [
                'PERSON',
                'LOCATION',
                'ORGANIZATION',
                'CITY',
                'STATE_OR_PROVINCE',
                'COUNTRY',
                'NATIONALITY',
                'RELIGION',
                'TITLE',
                'IDEOLOGY',
                'CRIMINAL_CHARGE',
                'CAUSE_OF_DEATH',
                'HANDLE',
                'EMAIL'
              ]
            ]
          }
        }
      },
      { $match: { valid: true } },
      { $sample: { size: 10 } }
    ])

    return tpcs
  }

  // TODO: Implement this
  @Query(returns => String)
  async getEntityCoverPhoto (@Arg('title') title: string) {
    return 'pic'
  }
}
