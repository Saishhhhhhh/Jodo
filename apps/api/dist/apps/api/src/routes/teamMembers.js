"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const Task_1 = require("../models/Task");
const response_1 = require("../utils/response");
const mongoose_1 = __importDefault(require("mongoose"));
const AuditLog_1 = require("../models/AuditLog");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth, auth_1.requireTenant);
/**
 * Helper to ensure TEAM_MEMBER role exists
 */
async function getTeamMemberRoleId(tenantId) {
    let role = await Role_1.Role.findOne({ tenantId, name: 'TEAM_MEMBER' });
    if (!role) {
        role = await Role_1.Role.create({
            tenantId,
            name: 'TEAM_MEMBER',
            description: 'Task-only team member access',
            permissions: ['VIEW_OWN_TASKS', 'UPDATE_OWN_TASKS'],
            isSystemRole: true,
        });
    }
    return role._id;
}
/**
 * GET /api/admin/team-members
 * List all team members
 */
router.get('/', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        const roleId = await getTeamMemberRoleId(tenantId);
        const users = await User_1.User.find({ tenantId, roleIds: roleId })
            .select('-passwordHash -inviteToken -inviteTokenExpiresAt')
            .sort({ createdAt: -1 })
            .lean();
        // Get task counts for each team member
        const userIds = users.map(u => u._id);
        const tasks = await Task_1.Task.aggregate([
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
        (0, response_1.sendSuccess)(res, result);
    }
    catch (error) {
        console.error('Error fetching team members:', error);
        (0, response_1.sendError)(res, 'Failed to fetch team members', 500);
    }
});
/**
 * POST /api/admin/team-members
 * Create team member
 */
router.post('/', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        const storeId = new mongoose_1.default.Types.ObjectId(req.auth.storeId);
        const { name, memberId, email, phone, team, password, status } = req.body;
        if (!name || !memberId || !password) {
            return (0, response_1.sendError)(res, 'Name, Member ID, and Password are required', 400);
        }
        // Check if memberId already exists for this tenant
        const existing = await User_1.User.findOne({ tenantId, memberId: memberId.toUpperCase() });
        if (existing) {
            return (0, response_1.sendError)(res, 'Member ID already exists', 400);
        }
        if (email) {
            const existingEmail = await User_1.User.findOne({ tenantId, email: email.toLowerCase() });
            if (existingEmail) {
                return (0, response_1.sendError)(res, 'Email already exists', 400);
            }
        }
        const roleId = await getTeamMemberRoleId(tenantId);
        const newUser = new User_1.User({
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
        await AuditLog_1.AuditLog.create({
            tenantId,
            storeId,
            actorUserId: new mongoose_1.default.Types.ObjectId(req.auth.sub),
            actorType: 'user',
            action: 'TEAM_MEMBER_CREATED',
            resourceType: 'User',
            resourceId: String(newUser._id),
            after: { memberId: newUser.memberId }
        });
        (0, response_1.sendSuccess)(res, { id: newUser._id, name: newUser.name, memberId: newUser.memberId }, 'Team Member created successfully', 201);
    }
    catch (error) {
        console.error('Error creating team member:', error);
        (0, response_1.sendError)(res, 'Failed to create team member', 500);
    }
});
/**
 * GET /api/admin/team-members/:id
 * Get team member details
 */
router.get('/:id', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        const userId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const user = await User_1.User.findOne({ _id: userId, tenantId })
            .select('-passwordHash -inviteToken -inviteTokenExpiresAt')
            .lean();
        if (!user)
            return (0, response_1.sendError)(res, 'Team member not found', 404);
        const tasks = await Task_1.Task.find({ tenantId, assignedTo: userId }).sort({ createdAt: -1 }).lean();
        const stats = {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'Pending').length,
            inProgress: tasks.filter(t => t.status === 'In Progress').length,
            blocked: tasks.filter(t => t.status === 'Blocked').length,
            completed: tasks.filter(t => t.status === 'Completed' || t.status === 'Closed').length,
            overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== 'Closed').length,
        };
        (0, response_1.sendSuccess)(res, { ...user, tasks, stats });
    }
    catch (error) {
        console.error('Error fetching team member details:', error);
        (0, response_1.sendError)(res, 'Failed to fetch team member details', 500);
    }
});
/**
 * PATCH /api/admin/team-members/:id
 * Update team member (status, edit, reset password)
 */
router.patch('/:id', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        const userId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const { name, email, phone, team, status, password } = req.body;
        const user = await User_1.User.findOne({ _id: userId, tenantId });
        if (!user)
            return (0, response_1.sendError)(res, 'Team member not found', 404);
        if (name)
            user.name = name;
        if (email)
            user.email = email.toLowerCase();
        if (phone !== undefined)
            user.phone = phone;
        if (team)
            user.permissions = [team];
        if (status)
            user.status = status;
        if (password) {
            user.passwordHash = password; // pre-save will hash
        }
        await user.save();
        await AuditLog_1.AuditLog.create({
            tenantId,
            storeId: user.storeId,
            actorUserId: new mongoose_1.default.Types.ObjectId(req.auth.sub),
            actorType: 'user',
            action: 'TEAM_MEMBER_UPDATED',
            resourceType: 'User',
            resourceId: String(user._id),
        });
        (0, response_1.sendSuccess)(res, { id: user._id }, 'Team Member updated successfully');
    }
    catch (error) {
        console.error('Error updating team member:', error);
        (0, response_1.sendError)(res, 'Failed to update team member', 500);
    }
});
exports.default = router;
//# sourceMappingURL=teamMembers.js.map