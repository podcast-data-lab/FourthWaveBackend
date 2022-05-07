import { AuthChecker, ResolverData } from 'type-graphql'
import { UserContext } from '../models/Context'
import { UserPermission } from '../models/enums/Permissions'
/**
 * Roots custom auth checker
 * @param { root, arguments, context, info }
 * @param roles
 */
export const AuthCheckerFn: AuthChecker<UserContext> = ({ root, args, context, info }, roles: string[]) => {
    // If no roles are required
    if (!context.user) return false
    if (!roles || roles?.length == 0) {
        return true
    }

    // For Admins - they can access everything
    if (roles.includes(UserPermission.Admin)) {
        return true
    }

    // For Editors - they can access some things
    if (context.roles.includes(UserPermission.Editor) && context.user.permissions.includes(UserPermission.Editor)) {
        return true
    }

    if (roles.includes(UserPermission.User) && context.user.permissions.includes(UserPermission.User)) {
        return true
    }

    return false // or false if access id denied
}
