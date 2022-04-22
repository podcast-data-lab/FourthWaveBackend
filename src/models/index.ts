import { getModelForClass } from '@typegoose/typegoose'
import { Episode } from './Episode'
import { Library } from './Library'
import { Play } from './Play'
import { User } from './User'

export const EpisodeModel = getModelForClass(Episode)
export const PlayModel = getModelForClass(Play)
export const UserModel = getModelForClass(User)
