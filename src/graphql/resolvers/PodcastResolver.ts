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

  @Query(returs => [Episode], { description: "Returns a podcasts'episodes" })
  async getPodcastEpisodes (
    @Arg('slug') slug: string,
    @Arg('page') page: number
  ): Promise<Episode[]> {
    const episodes: Episode[] = await EpisodeModel.find({
      podcast: slug
    })
      .sort({ datePublished: -1 })
      .skip(15 * page)
      .limit(15)
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
    const podcasts: Podcast[] = await PodcastModel.aggregate([
      {
        $search: {
          index: 'default',
          compound: {
            should: [
              {
                autocomplete: {
                  query: searchString,
                  path: 'title',
                  fuzzy: {
                    maxEdits: 2,
                    prefixLength: 3
                  }
                }
              },
              {
                autocomplete: {
                  query: searchString,
                  path: 'description',
                  fuzzy: {
                    maxEdits: 2,
                    prefixLength: 3
                  }
                }
              }
            ]
          }
        }
      },
      {
        $limit: 10
      },
      {
        $project: {
          title: 1,
          description: 1,
          link: 1,
          image: 1,
          datePublished: 1,
          duration: 1,
          podcast: 1,
          palette: 1,
          slug: 1,
          categories: 1,
          topics: 1,
          _id: 0,
          score: { $meta: 'searchScore' }
        }
      }
    ])

    return podcasts
  }
  @Mutation(returns => String)
  async rerunPods (): Promise<string> {
    return 'working'
  }

  @Mutation(returns => String, {
    description:
      'Generates the palettes of a podcast based on the podcasts image'
  })
  async generatePalettes (@Arg('slug') slug: string): Promise<string> {
    const podcast = await PodcastModel.findOne({ slug: slug })
    getImagePalettes(podcast)
    return 'generating palettes'
  }

  @Query(returns => [Podcast], { description: 'Returns the featured podcasts' })
  async getFeatured (): Promise<Podcast[]> {
    const pods = await PodcastModel.find({})
      .limit(7)
      .skip(110)
    return pods
  }

  @Query(returns => [Podcast], { description: 'Returns the Trending Podcasts' })
  async getTrending (): Promise<Podcast[]> {
    const pods = await PodcastModel.find({})
      .limit(5)
      .skip(40)
    return pods
  }

  @Query(returns => [Podcast], {
    description: 'Returns the Most Played Podcasts'
  })
  async getTopPlayed (): Promise<Podcast[]> {
    const pods = await PodcastModel.find({})
      .limit(5)
      .skip(170)
    return pods
  }

  @Query(returns => [String], {
    description: 'Returns a list of all the genres'
  })
  async getGenres (): Promise<string[]> {
    return PodcastModel.find({}).then(podcasts => {
      const categories = []

      podcasts.forEach(pod => {
        return pod.categories.forEach(category => {
          const indx = categories.indexOf(category)
          if (indx == -1) categories.push(category)
        })
      })
      return categories
    })
  }
}
