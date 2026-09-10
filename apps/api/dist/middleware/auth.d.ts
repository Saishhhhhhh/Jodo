import { Request, Response, NextFunction } from 'express';
import { AccessTokenPayload } from '../utils/jwt';
declare global {
    namespace Express {
        interface Request {
            auth?: AccessTokenPayload;
        }
    }
}
/**
 * Middleware to verify JWT access token.
 * Attaches decoded payload to req.auth.
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
/**
 * Permission check middleware factory.
 * Usage: requirePermission('read_orders')
 */
export declare function requirePermission(permission: string): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Ensure the tenant context is present.
 * Prevents cross-tenant data access.
 */
export declare function requireTenant(req: Request, res: Response, next: NextFunction): void;
