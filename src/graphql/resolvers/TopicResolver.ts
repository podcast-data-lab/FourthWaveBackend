import { Arg, Query, Resolver } from 'type-graphql'
import { shuffle } from '../../lib/functions'
import { getCoverPhoto } from '../../lib/unsplash.functions'
import { Topic, TopicModel } from '../../models/Topic'

@Resolver(of => Topic)
export class TopicResolver {
  @Query(returns => [Topic], {
    description: 'Returns a list of recommended topics'
  })
  @Query(returns => [Topic])
  async getTopicSearchRecommendations (): Promise<Topic[]> {
    const tpcs = await TopicModel.aggregate([
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

  @Query(returns => String)
  async getTopicCoverPhoto (@Arg('title') title: string) {
    const photos = await getCoverPhoto(title)
    const pic = photos.response.results[1].urls.small
    return pic
  }
}
