import { registerEnumType } from 'type-graphql'

export enum UserPermission {
    Admin = 'ADMIN',
    Editor = 'EDITOR',
    User = 'USER',
}

registerEnumType(UserPermission, {
    name: 'UserPermission',
    description: 'User Permissions',
})
