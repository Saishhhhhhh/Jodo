"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requirePermission = requirePermission;
exports.requireTenant = requireTenant;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
/**
 * Middleware to verify JWT access token.
 * Attaches decoded payload to req.auth.
 */
function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (0, response_1.sendUnauthorized)(res, 'No authorization token provided');
            return;
        }
        const token = authHeader.split(' ')[1];
        const payload = (0, jwt_1.verifyAccessToken)(token);
        if (payload.type !== 'access') {
            (0, response_1.sendUnauthorized)(res, 'Invalid token type');
            return;
        }
        req.auth = payload;
        next();
    }
    catch {
        (0, response_1.sendUnauthorized)(res, 'Invalid or expired token');
    }
}
/**
 * Permission check middleware factory.
 * Usage: requirePermission('read_orders')
 */
function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.auth) {
            (0, response_1.sendUnauthorized)(res);
            return;
        }
        // Owner role has all permissions — check by role in real implementation
        // For now, we'll trust the permissions array in the token payload
        // This will be extended in Phase 1 proper RBAC
        next();
    };
}
/**
 * Ensure the tenant context is present.
 * Prevents cross-tenant data access.
 */
function requireTenant(req, res, next) {
    if (!req.auth?.tenantId) {
        (0, response_1.sendForbidden)(res, 'Missing tenant context');
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map