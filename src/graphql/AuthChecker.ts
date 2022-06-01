import { AuthChecker, ResolverData } from 'type-graphql'
import { UserContext } from '../models/Context'
import { UserPermission } from '../models/enums/Permissions'
/**
 * Roots custom auth checker
 * @param { root, arguments, context, info }
 * @param roles
 */
export const AuthCheckerFn: AuthChecker<UserContext, UserPermission> = ({ root, args, context, info }, roles: string[]) => {
    // If no roles are required
    if (!context?.user) return false
    if (roles.length === 0) {
        // if `@Authorized()`, check only if user exists
        return context?.user !== undefined
    }
    // For Admins - they can access everything
    if (context?.user.permissions.includes(UserPermission.Admin)) return true

    // For Editors - they can access some things
    if (roles.includes(UserPermission.Editor) && context?.user.permissions.includes(UserPermission.Editor)) {
        return true
    }

    if (roles.includes(UserPermission.User) && context?.user.permissions.includes(UserPermission.User)) {
        return true
    }

    if (roles.includes(UserPermission.Registered_User) && context?.user.permissions.includes(UserPermission.Registered_User)) {
        return true
    }

    return false // or false if access id denied
}
