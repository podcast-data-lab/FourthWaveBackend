import { Query, Resolver } from "type-graphql";

import { Podcast, PodcastModel } from "../../models/Podcast";

@Resolver((of) => Podcast)
export default class PodcastResolver {
  @Query()
  print(): String {
    console.log("here");
    return "Hello";
  }

  @Query((returns) => [Podcast])
  async getPodcasts(): Promise<Podcast[]> {
    const podcasts: Podcast[] = await PodcastModel.find();

    return podcasts;
  }
}
