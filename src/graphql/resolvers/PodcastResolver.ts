import { Arg, Mutation, Query, Resolver } from 'type-graphql'
import { registerPodcasts, work } from '../../lib/buildPodcasts'
import { getImagePalettes } from '../../lib/functions'
import { Episode, EpisodeModel } from '../../models/Episode'

import { Podcast, PodcastModel } from '../../models/Podcast'

@Resolver(of => Podcast)
export default class PodcastResolver {
  @Query(returns => [Podcast], { description: 'Get all podcasts' })
  async getPodcasts (@Arg('page') page: number): Promise<Podcast[]> {
    const podcasts: Podcast[] = await PodcastModel.find()
      .skip(50 * page)
      .limit(50)
    return podcasts
  }

  @Query(returs => [Episode], { description: "Returns a podcasts'episode" })
  async getPodcastEpisodes (@Arg('slug') slug: string): Promise<Episode[]> {
    const episodes: Episode[] = await EpisodeModel.find({ podcast: slug })
    return episodes
  }

  @Query(returns => Podcast, {
    description: "Find a podcast based on it's slug"
  })
  async getPodcast (@Arg('slug') slug: string): Promise<Podcast> {
    const podcast: Podcast = await PodcastModel.findOne({ slug: `${slug}` })

    return podcast
  }

  @Query(returns => [Podcast], {
    description: 'Searches for a podcast based on a search string'
  })
  async findPodcasts (
    @Arg('searchString') searchString: String
  ): Promise<Podcast[]> {
    const regex = new RegExp(`^${searchString}`)
    const podcasts: Podcast[] = await PodcastModel.find({
      title: { $regex: regex, $options: 'ix' }
    })

    return podcasts
  }
  @Mutation(returns => String)
  async rerunPods (): Promise<string> {
    registerPodcasts()
    return 'working'
  }

  @Mutation(returns => String)
  async generatePalettes (@Arg('slug') slug: string): Promise<string> {
    const podcast = await PodcastModel.findOne({ slug: slug })
    getImagePalettes(podcast)
    return 'generating palettes'
  }
}
