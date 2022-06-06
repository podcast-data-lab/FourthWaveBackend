import { Arg, Mutation, Query, Resolver } from 'type-graphql'

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

    @Query((returns) => Category)
    async getFullCategory(@Arg('categoryId') categoryId: string): Promise<Category> {
        return getFullCategory(categoryId)
    }

    @Mutation((returns) => Category)
    async editCategoryFeatureness(@Arg('categoryId') categoryId: string, @Arg('featured') featured: boolean): Promise<Category> {
        const category = await CategoryModel.findById(categoryId)
        if (!category) {
            throw new Error('Category not found')
        }
        category.featured = featured
        await category.save()

        return getFullCategory(categoryId)
    }
}

async function getFullCategory(categoryId: string) {
    let categories = await CategoryModel.aggregate([
        {
            $match: { _id: categoryId },
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
    if (categories.length > 0) {
        return categories[0]
    }
    return null
}
