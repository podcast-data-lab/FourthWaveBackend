import { AuthChecker } from 'type-graphql'
import { UserPermission } from '../models/enums/Permissions'
/**
 * Roots custom auth checker
 * @param { root, arguments, context, info }
 * @param roles
 */
export const AuthCheckerFn: AuthChecker = ({ root, args, context, info }, roles) => {
    // If no roles are required
    if (roles.length == 0) {
        return true
    }
    //@ts-ignore
    if (!context.roles) {
        return false
    }
    // For Editors - they can access some things
    //@ts-ignore
    if (context.roles.includes(UserPermission.Editor)) {
        return true
    }
    // For Admins - they can access everything
    //@ts-ignore
    if (roles.includes(UserPermission.Admin) && context.roles.includes(UserPermission.Admin)) {
        return true
    }

    // If none of the above checks pass
    return false // or false if access id denied
}
