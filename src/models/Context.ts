import { Library } from './Library'
import { User } from './User'
import { DocumentType } from '@typegoose/typegoose'
import { UserPermission } from './enums/Permissions'
import { PlayingQueue } from './PlayingQueue'

export type UserContext = {
    user: DocumentType<User>
    library: DocumentType<Library>
    playingQueue: DocumentType<PlayingQueue>
    roles: UserPermission[]
}
