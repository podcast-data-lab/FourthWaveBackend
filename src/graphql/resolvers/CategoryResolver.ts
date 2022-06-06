import { Arg, Query, Resolver } from 'type-graphql'

import { Category, CategoryModel } from '../../models/Category'

const CATEGORY_LIMIT = 25
@Resolver((of) => Category)
export default class CategoryResolver {
    @Query()
    print(): String {
        return 'Hello'
    }

    @Query((returns) => [Category], {
        description: 'Returns a list of all the genres',
    })
    async getCategories(@Arg('page') page: number): Promise<Category[]> {
        const categories = await CategoryModel.aggregate([
            {
                $project: {
                    epCount: { $size: '$episodes' },
                    podCount: { $size: '$podcasts' },
                    _id: 1,
                    slug: 1,
                    title: 1,
                },
            },
            { $sort: { podCount: -1, epCount: -1 } },
        ])
        return categories.slice(page * CATEGORY_LIMIT, page * CATEGORY_LIMIT + CATEGORY_LIMIT)
    }

    @Query((returns) => [Category])
    async getCategorySearchRecommendations(): Promise<Category[]> {
        const categories = await CategoryModel.aggregate([{ $sample: { size: 10 } }])
        return categories
    }

    @Query((returns) => [Category])
    async getFeaturedCategories(): Promise<Category[]> {
        const categories = await CategoryModel.aggregate([
            {
                $match: { featured: true },
            },
        ])
        return categories
    }

    @Query((returns) => [Category])
    async getFullCategory(): Promise<Category[]> {
        const categories = await CategoryModel.aggregate([
            {
                $match: { featured: true },
            },
            {
                $lookup: {
                    from: 'podcasts',
                    foreignField: '_id',
                    localField: 'podcast',
                    as: 'podcast',
                },
            },
        ])
        return categories
    }
}
