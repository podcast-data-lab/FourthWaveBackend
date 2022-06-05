import { Ref } from '@typegoose/typegoose'
import { EpisodeModel } from '../../models'
import { Episode } from '../../models/Episode'
import { Podcast } from '../../models/Podcast'

export async function getEpisodesInPodcastList(
    idList: string[] | Ref<Podcast, string>[],
    page: number,
    lastUpdated?: Date,
): Promise<Episode[]> {
    // lastupdated - (14 days * page)
    // let cutoff = new Date(lastUpdated.getTime() - 14 * 24 * 60 * 60 * 1000 * page)
    let episodes = await EpisodeModel.aggregate<Episode>([
        {
            $match: {
                podcast: { $in: idList },
                // For Simplicity, just get the most recent 50 episodes
                // published: { $gte: cutoff },
            },
        },
        {
            $lookup: {
                from: 'podcasts',
                foreignField: '_id',
                localField: 'podcast',
                as: 'podcast',
            },
        },
        {
            $lookup: {
                from: 'authors',
                localField: 'author',
                foreignField: '_id',
                as: 'author',
            },
        },
        {
            $lookup: {
                from: 'entities',
                foreignField: '_id',
                localField: 'entities',
                as: 'entities',
            },
        },
        {
            $addFields: {
                author: { $first: '$author' },
                podcast: { $first: '$podcast' },
            },
        },
        {
            $sort: { published: -1 },
        },
        {
            $skip: 50 * page,
        },
        {
            $limit: 50,
        },
    ]).allowDiskUse(true)
    return episodes
}
