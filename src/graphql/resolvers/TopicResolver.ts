import { Query, Resolver } from 'type-graphql'
import { Topic, TopicModel } from '../../models/Topic'

@Resolver(of => Topic)
export class TopicResolver {
  @Query(returns => [Topic], {
    description: 'Returns a list of recommended topics'
  })
  async getRecommendedTopics (): Promise<Topic[]> {
    const topics = TopicModel.aggregate()

    return topics
  }
}
