import { Router, Request, Response } from 'express';
import { requireAuth, requireTenant } from '../middleware/auth';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import mongoose from 'mongoose';

const router = Router();

router.use(requireAuth, requireTenant);

/**
 * GET /api/admin/staff
 * List all staff users for the tenant
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ tenantId })
        .select('-passwordHash -inviteToken -inviteTokenExpiresAt')
        .populate('roleIds', 'name permissions')
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ tenantId }),
    ]);

    sendPaginated(res, users, { page, limit, total });
  } catch {
    sendError(res, 'Failed to fetch staff');
  }
});

/**
 * GET /api/admin/roles
 * List all roles for the tenant
 */
router.get('/roles', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    const roles = await Role.find({ tenantId }).lean();
    sendSuccess(res, roles);
  } catch {
    sendError(res, 'Failed to fetch roles');
  }
});

export default router;
