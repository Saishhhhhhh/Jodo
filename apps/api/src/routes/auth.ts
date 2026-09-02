import { Router, Request, Response } from 'express';
import { authService } from '../services/authService';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { LoginSchema, RefreshTokenSchema } from '@jodo/shared';
import { sendSuccess, sendError, sendUnauthorized } from '../utils/response';

const router = Router();

/**
 * POST /api/admin/auth/login
 * Authenticate staff user and return tokens
 */
router.post('/login', validate(LoginSchema), async (req: Request, res: Response) => {
  try {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await authService.login(req.body, ip, userAgent);
    sendSuccess(res, result, 'Login successful');
  } catch (err: unknown) {
    const error = err as { message?: string; statusCode?: number };
    sendError(res, error.message || 'Login failed', error.statusCode || 400);
  }
});

/**
 * POST /api/admin/auth/refresh
 * Rotate refresh token and issue new access token
 */
router.post('/refresh', validate(RefreshTokenSchema), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshTokens(refreshToken);
    sendSuccess(res, result, 'Token refreshed');
  } catch (err: unknown) {
    const error = err as { message?: string; statusCode?: number };
    sendUnauthorized(res, error.message || 'Token refresh failed');
  }
});

/**
 * POST /api/admin/auth/logout
 * Revoke refresh token
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    sendSuccess(res, null, 'Logged out successfully');
  } catch {
    sendSuccess(res, null, 'Logged out');
  }
});

/**
 * GET /api/admin/auth/me
 * Get current authenticated user
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await authService.getMe(req.auth!.sub);
    if (!user) {
      sendUnauthorized(res, 'User not found');
      return;
    }
    sendSuccess(res, user);
  } catch {
    sendError(res, 'Failed to fetch user');
  }
});

export default router;
