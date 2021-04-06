import { Query, Resolver } from "type-graphql";
import { Comment, CommentModel } from "../../models/Comment";

@Resolver((of) => Comment)
export default class CommentResolver {
  @Query((returns) => Comment)
  async getComment(): Promise<Comment> {
    console.log("here");
    const comment = CommentModel.findOne();
    return comment;
  }
}
