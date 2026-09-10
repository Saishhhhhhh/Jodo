import { Router, Request, Response } from 'express';
import { requireAuth, requireTenant } from '../middleware/auth';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Task } from '../models/Task';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { AuditLog } from '../models/AuditLog';

const router = Router();

router.use(requireAuth, requireTenant);

/**
 * Helper to ensure TEAM_MEMBER role exists
 */
async function getTeamMemberRoleId(tenantId: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId> {
  let role = await Role.findOne({ tenantId, name: 'TEAM_MEMBER' });
  if (!role) {
    role = await Role.create({
      tenantId,
      name: 'TEAM_MEMBER',
      description: 'Task-only team member access',
      permissions: ['VIEW_OWN_TASKS', 'UPDATE_OWN_TASKS'],
      isSystemRole: true,
    });
  }
  return role._id as mongoose.Types.ObjectId;
}

/**
 * GET /api/admin/team-members
 * List all team members
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    const roleId = await getTeamMemberRoleId(tenantId);

    const users = await User.find({ tenantId, roleIds: roleId })
      .select('-passwordHash -inviteToken -inviteTokenExpiresAt')
      .sort({ createdAt: -1 })
      .lean();

    // Get task counts for each team member
    const userIds = users.map(u => u._id);
    const tasks = await Task.aggregate([
      { $match: { tenantId, assignedTo: { $in: userIds } } },
      { $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          blocked: { $sum: { $cond: [{ $eq: ['$status', 'Blocked'] }, 1, 0] } },
        }
      }
    ]);

    const taskMap = new Map(tasks.map(t => [String(t._id), t]));

    const result = users.map(u => {
      const stats = taskMap.get(String(u._id)) || { total: 0, completed: 0, pending: 0, inProgress: 0, blocked: 0 };
      return { ...u, stats };
    });

    sendSuccess(res, result);
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    sendError(res, 'Failed to fetch team members', 500);
  }
});

/**
 * POST /api/admin/team-members
 * Create team member
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    const storeId = new mongoose.Types.ObjectId(req.auth!.storeId);
    const { name, memberId, email, phone, team, password, status } = req.body;

    if (!name || !memberId || !password) {
      return sendError(res, 'Name, Member ID, and Password are required', 400);
    }

    // Check if memberId already exists for this tenant
    const existing = await User.findOne({ tenantId, memberId: memberId.toUpperCase() });
    if (existing) {
      return sendError(res, 'Member ID already exists', 400);
    }
    
    if (email) {
      const existingEmail = await User.findOne({ tenantId, email: email.toLowerCase() });
      if (existingEmail) {
        return sendError(res, 'Email already exists', 400);
      }
    }

    const roleId = await getTeamMemberRoleId(tenantId);

    const newUser = new User({
      tenantId,
      storeId,
      name,
      memberId: memberId.toUpperCase(),
      email: email ? email.toLowerCase() : undefined,
      phone,
      permissions: [team || ''], // Use permissions array to store the team name for simplicity (or add teamId if we want a separate model)
      passwordHash: password, // Pre-save hook hashes this
      status: status || 'active',
      roleIds: [roleId],
    });

    await newUser.save();

    await AuditLog.create({
      tenantId,
      storeId,
      actorUserId: new mongoose.Types.ObjectId(req.auth!.sub),
      actorType: 'user',
      action: 'TEAM_MEMBER_CREATED',
      resourceType: 'User',
      resourceId: String(newUser._id),
      after: { memberId: newUser.memberId }
    });

    sendSuccess(res, { id: newUser._id, name: newUser.name, memberId: newUser.memberId }, 'Team Member created successfully', 201);
  } catch (error: any) {
    console.error('Error creating team member:', error);
    sendError(res, 'Failed to create team member', 500);
  }
});

/**
 * GET /api/admin/team-members/:id
 * Get team member details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    const userId = new mongoose.Types.ObjectId(req.params.id as string);

    const user = await User.findOne({ _id: userId, tenantId })
      .select('-passwordHash -inviteToken -inviteTokenExpiresAt')
      .lean();

    if (!user) return sendError(res, 'Team member not found', 404);

    const tasks = await Task.find({ tenantId, assignedTo: userId }).sort({ createdAt: -1 }).lean();

    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      blocked: tasks.filter(t => t.status === 'Blocked').length,
      completed: tasks.filter(t => t.status === 'Completed' || t.status === 'Closed').length,
      overdue: tasks.filter(t => new Date(t.dueDate as Date) < new Date() && t.status !== 'Completed' && t.status !== 'Closed').length,
    };

    sendSuccess(res, { ...user, tasks, stats });
  } catch (error: any) {
    console.error('Error fetching team member details:', error);
    sendError(res, 'Failed to fetch team member details', 500);
  }
});

/**
 * PATCH /api/admin/team-members/:id
 * Update team member (status, edit, reset password)
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    const userId = new mongoose.Types.ObjectId(req.params.id as string);
    const { name, email, phone, team, status, password } = req.body;

    const user = await User.findOne({ _id: userId, tenantId });
    if (!user) return sendError(res, 'Team member not found', 404);

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone;
    if (team) user.permissions = [team];
    if (status) user.status = status;
    
    if (password) {
      user.passwordHash = password; // pre-save will hash
    }

    await user.save();

    await AuditLog.create({
      tenantId,
      storeId: user.storeId,
      actorUserId: new mongoose.Types.ObjectId(req.auth!.sub),
      actorType: 'user',
      action: 'TEAM_MEMBER_UPDATED',
      resourceType: 'User',
      resourceId: String(user._id),
    });

    sendSuccess(res, { id: user._id }, 'Team Member updated successfully');
  } catch (error: any) {
    console.error('Error updating team member:', error);
    sendError(res, 'Failed to update team member', 500);
  }
});

export default router;
