import { DocumentType } from '@typegoose/typegoose'
import { UserModel } from '../../models'
import { Play } from '../../models/Play'
import { User } from '../../models/User'

export async function getUserWithPlayingQueue(_id: string): Promise<DocumentType<User> & { queue: Play[] }> {
    return (
        await UserModel.aggregate([
            { $match: { _id } },
            {
                $lookup: {
                    from: 'plays',
                    foreignField: '_id',
                    localField: 'queue',
                    as: 'queue',
                },
            },
        ])
    )[0]
}
