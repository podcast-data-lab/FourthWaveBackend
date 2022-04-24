import { Library } from './Library'
import { User } from './User'
import { DocumentType } from '@typegoose/typegoose'
import { UserPermission } from './enums/Permissions'

export type UserContext = { user: DocumentType<User>; library: DocumentType<Library>; roles: UserPermission[] }
