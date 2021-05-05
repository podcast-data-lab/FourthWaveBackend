import { Query, Resolver } from 'type-graphql'
import { Topic, TopicModel } from '../../models/Topic'

@Resolver(of => Topic)
export class TopicResolver {
  @Query(returns => [Topic], {
    description: 'Returns a list of recommended topics'
  })
  @Query(returns => [Topic])
  async getTopicSearchRecommendations (): Promise<Topic[]> {
    const topics = await TopicModel.aggregate([{ $sample: { size: 7 } }])

    return topics
  }
}
