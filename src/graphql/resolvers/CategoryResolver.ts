import { Query, Resolver } from 'type-graphql'

import { Category, CategoryModel } from '../../models/Category'

@Resolver(of => Category)
export default class CategoryResolver {
  @Query()
  print (): String {
    console.log('here')
    return 'Hello'
  }

  @Query(returns => [Category], {
    description: 'Returns a list of all the genres'
  })
  async getCategories (): Promise<Category[]> {
    const categories = await CategoryModel.aggregate([{ $sample: { size: 9 } }])

    return categories
  }
  @Query(returns => [Category])
  async getCategorySearchRecommendations (): Promise<Category[]> {
    const categories = await CategoryModel.aggregate([{ $sample: { size: 7 } }])

    return categories
  }
}
