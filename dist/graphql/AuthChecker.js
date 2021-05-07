"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthCheckerFn = void 0;
/**
 * Roots custom auth checker
 * @param { root, arguments, context, info }
 * @param roles
 */
const AuthCheckerFn = ({ root, args, context, info }, roles) => {
    // If no roles are required
    if (roles.length == 0) {
        return true;
    }
    //@ts-ignore
    if (!context.roles) {
        return false;
    }
    // For Super Users - they can access everything
    //@ts-ignore
    if (context.roles.includes("SUPER")) {
        return true;
    }
    // For Moderators \
    //@ts-ignore
    if (roles.includes("ADMIN") && context.roles.includes("ADMIN")) {
        return true;
    }
    // If none of the above checks pass
    return false; // or false if access id denied
};
exports.AuthCheckerFn = AuthCheckerFn;
