import { Arg, Mutation, Query, Resolver } from 'type-graphql'
import { EpisodeModel } from '../../models'
import { Episode } from '../../models/Episode'

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
    const episodes: Episode[] = await EpisodeModel.aggregate([
      { $match: { podcast: slug } },
      { $sort: { datePublished: -1 } },
      {
        $lookup: {
          from: 'topics',
          foreignField: '_id',
          localField: 'topics',
          as: 'topics'
        }
      },
      {
        $skip: 15 * page
      },
      {
        $limit: 15
      }
    ])
    return episodes
  }

  @Query(returns => Podcast, {
    description: "Find a podcast based on it's slug"
  })
  async getPodcast (@Arg('slug') slug: string): Promise<Podcast> {
    const podcast: Podcast[] = await PodcastModel.aggregate([
      { $match: { slug: slug } },
      {
        $lookup: {
          from: 'categories',
          foreignField: '_id',
          localField: 'categories',
          as: 'categories'
        }
      },
      {
        $lookup: {
          from: 'topics',
          foreignField: '_id',
          localField: 'topics',
          as: 'topics'
        }
      },
      {
        $lookup: {
          from: 'episodes',
          foreignField: '_id',
          localField: 'episodes',
          as: 'episodes'
        }
      },
      {
        $limit: 10
      }
    ])

    return podcast[0]
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
          index: 'podcasts',
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
      },
      {
        $lookup: {
          from: 'categories',
          foreignField: '_id',
          localField: 'categories',
          as: 'categories'
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
  // FIXME: Update function since generating palettes is already done
  async generatePalettes (@Arg('slug') slug: string): Promise<string> {
    const podcast = await PodcastModel.findOne({ slug: slug })
    return 'generating palettes'
  }

  @Query(returns => [Podcast], { description: 'Returns the featured podcasts' })
  async getFeatured (): Promise<Podcast[]> {
    const pods = await PodcastModel.aggregate([
      { $sample: { size: 7 } },
      {
        $lookup: {
          from: 'categories',
          foreignField: '_id',
          localField: 'categories',
          as: 'categories'
        }
      },
      {
        $lookup: {
          from: 'topics',
          foreignField: '_id',
          localField: 'topics',
          as: 'topics'
        }
      }
    ])
    return pods
  }

  @Query(returns => [Podcast], { description: 'Returns the Trending Podcasts' })
  async getTrending (): Promise<Podcast[]> {
    const pods = await PodcastModel.aggregate([
      { $sample: { size: 5 } },
      {
        $lookup: {
          from: 'categories',
          foreignField: '_id',
          localField: 'categories',
          as: 'categories'
        }
      },
      {
        $lookup: {
          from: 'topics',
          foreignField: '_id',
          localField: 'topics',
          as: 'topics'
        }
      }
    ])
    return pods
  }

  @Query(returns => [Podcast], {
    description: 'Returns the Most Played Podcasts'
  })
  async getTopPlayed (): Promise<Podcast[]> {
    const pods = await PodcastModel.aggregate([
      { $sample: { size: 5 } },
      {
        $lookup: {
          from: 'categories',
          foreignField: '_id',
          localField: 'categories',
          as: 'categories'
        }
      },
      {
        $lookup: {
          from: 'topics',
          foreignField: '_id',
          localField: 'topics',
          as: 'topics'
        }
      }
    ])
    return pods
  }
}
