import { Query, Resolver } from 'type-graphql'
import { Comment, CommentModel } from '../../models/Comment'
import { PodcastModel } from '../../models/Podcast'

@Resolver(of => Comment)
export default class CommentResolver {
  @Query(returns => Comment, { nullable: true })
  async getComment (): Promise<Comment> {
    console.log('here')
    const comment = await CommentModel.findOne()
    let pod = await PodcastModel.find()
    console.log(pod[0].episodes[0])
    console.log(comment)
    return comment
  }
}
