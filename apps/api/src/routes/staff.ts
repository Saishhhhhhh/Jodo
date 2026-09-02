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

/**
 * POST /api/admin/staff
 * Add a new staff member
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    const storeId = new mongoose.Types.ObjectId(req.auth!.storeId);
    const { name, email, password, roleIds } = req.body;

    if (!name || !email || !password || !roleIds) {
      return sendError(res, 'Missing required fields', 400);
    }

    const existingUser = await User.findOne({ tenantId, email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'A user with this email already exists', 400);
    }

    const newUser = new User({
      tenantId,
      storeId,
      name,
      email,
      passwordHash: password, // The pre-save hook will hash it
      roleIds: roleIds.map((id: string) => new mongoose.Types.ObjectId(id)),
      status: 'active',
    });

    await newUser.save();

    const savedUser = await User.findById(newUser._id)
      .select('-passwordHash -inviteToken -inviteTokenExpiresAt')
      .populate('roleIds', 'name permissions')
      .lean();

    sendSuccess(res, savedUser, 'Staff member added successfully', 201);
  } catch (error) {
    console.error('Error adding staff:', error);
    sendError(res, 'Failed to add staff member');
  }
});

/**
 * PUT /api/admin/staff/:id
 * Update a staff member
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    const userId = new mongoose.Types.ObjectId(req.params.id as string);
    const { name, email, roleIds, status } = req.body;

    const user = await User.findOne({ _id: userId, tenantId });
    if (!user) {
      return sendError(res, 'Staff member not found', 404);
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (status) user.status = status;
    if (roleIds) {
      user.roleIds = roleIds.map((id: string) => new mongoose.Types.ObjectId(id));
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-passwordHash -inviteToken -inviteTokenExpiresAt')
      .populate('roleIds', 'name permissions')
      .lean();

    sendSuccess(res, updatedUser, 'Staff member updated successfully');
  } catch (error) {
    console.error('Error updating staff:', error);
    sendError(res, 'Failed to update staff member');
  }
});

/**
 * DELETE /api/admin/staff/:id
 * Remove a staff member
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    const userId = new mongoose.Types.ObjectId(req.params.id as string);

    // Prevent deleting oneself
    if (userId.equals(req.auth!.sub)) {
      return sendError(res, 'Cannot remove your own access', 400);
    }

    const user = await User.findOneAndDelete({ _id: userId, tenantId });
    if (!user) {
      return sendError(res, 'Staff member not found', 404);
    }

    sendSuccess(res, { deletedId: userId }, 'Staff member removed successfully');
  } catch (error) {
    console.error('Error deleting staff:', error);
    sendError(res, 'Failed to remove staff member');
  }
});

export default router;
