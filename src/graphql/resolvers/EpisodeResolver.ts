import { Arg, Query, Resolver } from "type-graphql";
import { Episode, EpisodeModel } from "../../models/Episode";

@Resolver((of) => Episode)
export default class EpisodeResolver {
  
  @Query((returns) => [Episode], {description:"Find episodes based on a search string"})
  async findEpisodes(@Arg('searchString') searchString: String): Promise<Episode[]> {
    const regex = new RegExp(`^${searchString}`)
    const episodes: Episode[] = await EpisodeModel.find({title:{$regex: regex, $options: 'ix'}});

    return episodes;
  }
}
