import { getModelForClass } from '@typegoose/typegoose'
import { Episode } from './Episode'
import { Play } from './Play'
import { Author } from './Author'
import { User } from './User'

export const EpisodeModel = getModelForClass(Episode)
export const PlayModel = getModelForClass(Play)
export const UserModel = getModelForClass(User)
export const AuthorModel = getModelForClass(Author)