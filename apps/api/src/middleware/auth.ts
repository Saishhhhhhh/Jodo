import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt';
import { sendUnauthorized, sendForbidden } from '../utils/response';

// Augment Express Request with auth context
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
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'No authorization token provided');
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (payload.type !== 'access') {
      sendUnauthorized(res, 'Invalid token type');
      return;
    }

    req.auth = payload;
    next();
  } catch {
    sendUnauthorized(res, 'Invalid or expired token');
  }
}

/**
 * Permission check middleware factory.
 * Usage: requirePermission('read_orders')
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      sendUnauthorized(res);
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
export function requireTenant(req: Request, res: Response, next: NextFunction): void {
  if (!req.auth?.tenantId) {
    sendForbidden(res, 'Missing tenant context');
    return;
  }
  next();
}
