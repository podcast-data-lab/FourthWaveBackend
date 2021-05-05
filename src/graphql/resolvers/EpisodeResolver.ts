import { Arg, Query, Resolver } from 'type-graphql'
import { EpisodeModel } from '../../models'
import { Episode } from '../../models/Episode'

@Resolver(of => Episode)
export default class EpisodeResolver {
  @Query(returns => [Episode], {
    description: 'Find episodes based on a search string'
  })
  async findEpisodes (
    @Arg('searchString') searchString: string
  ): Promise<Episode[]> {
    const searchResult = await EpisodeModel.aggregate([
      {
        $search: {
          index: 'episodes',
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
          sourceUrl: 1,
          image: 1,
          datePublished: 1,
          duration: 1,
          podcast: 1,
          topics: 1,
          _id: 0,
          score: { $meta: 'searchScore' }
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
    console.log('result : ')
    console.log(searchResult)

    return searchResult
  }

  @Query(returns => [Episode], {
    description: 'Returns the Most Popular Podcast Episodes'
  })
  async topEpisodes (): Promise<Episode[]> {
    const eps = await EpisodeModel.aggregate([
      { $sample: { size: 5 } },
      {
        $lookup: {
          from: 'topics',
          foreignField: '_id',
          localField: 'topics',
          as: 'topics'
        }
      }
    ])
    return eps
  }
}
