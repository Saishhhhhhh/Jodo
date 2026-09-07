"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const response_1 = require("../utils/response");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth, auth_1.requireTenant);
/**
 * GET /api/admin/staff
 * List all staff users for the tenant
 */
router.get('/', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User_1.User.find({ tenantId })
                .select('-passwordHash -inviteToken -inviteTokenExpiresAt')
                .populate('roleIds', 'name permissions')
                .skip(skip)
                .limit(limit)
                .lean(),
            User_1.User.countDocuments({ tenantId }),
        ]);
        (0, response_1.sendPaginated)(res, users, { page, limit, total });
    }
    catch {
        (0, response_1.sendError)(res, 'Failed to fetch staff');
    }
});
/**
 * GET /api/admin/roles
 * List all roles for the tenant
 */
router.get('/roles', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        const roles = await Role_1.Role.find({ tenantId }).lean();
        (0, response_1.sendSuccess)(res, roles);
    }
    catch {
        (0, response_1.sendError)(res, 'Failed to fetch roles');
    }
});
/**
 * POST /api/admin/staff
 * Add a new staff member
 */
router.post('/', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        const storeId = new mongoose_1.default.Types.ObjectId(req.auth.storeId);
        const { name, email, password, roleIds } = req.body;
        if (!name || !email || !password || !roleIds) {
            return (0, response_1.sendError)(res, 'Missing required fields', 400);
        }
        const existingUser = await User_1.User.findOne({ tenantId, email: email.toLowerCase() });
        if (existingUser) {
            return (0, response_1.sendError)(res, 'A user with this email already exists', 400);
        }
        const newUser = new User_1.User({
            tenantId,
            storeId,
            name,
            email,
            passwordHash: password, // The pre-save hook will hash it
            roleIds: roleIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
            status: 'active',
        });
        await newUser.save();
        const savedUser = await User_1.User.findById(newUser._id)
            .select('-passwordHash -inviteToken -inviteTokenExpiresAt')
            .populate('roleIds', 'name permissions')
            .lean();
        (0, response_1.sendSuccess)(res, savedUser, 'Staff member added successfully', 201);
    }
    catch (error) {
        console.error('Error adding staff:', error);
        (0, response_1.sendError)(res, 'Failed to add staff member');
    }
});
/**
 * PUT /api/admin/staff/:id
 * Update a staff member
 */
router.put('/:id', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        const userId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const { name, email, roleIds, status } = req.body;
        const user = await User_1.User.findOne({ _id: userId, tenantId });
        if (!user) {
            return (0, response_1.sendError)(res, 'Staff member not found', 404);
        }
        if (name)
            user.name = name;
        if (email)
            user.email = email.toLowerCase();
        if (status)
            user.status = status;
        if (roleIds) {
            user.roleIds = roleIds.map((id) => new mongoose_1.default.Types.ObjectId(id));
        }
        await user.save();
        const updatedUser = await User_1.User.findById(user._id)
            .select('-passwordHash -inviteToken -inviteTokenExpiresAt')
            .populate('roleIds', 'name permissions')
            .lean();
        (0, response_1.sendSuccess)(res, updatedUser, 'Staff member updated successfully');
    }
    catch (error) {
        console.error('Error updating staff:', error);
        (0, response_1.sendError)(res, 'Failed to update staff member');
    }
});
/**
 * DELETE /api/admin/staff/:id
 * Remove a staff member
 */
router.delete('/:id', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        const userId = new mongoose_1.default.Types.ObjectId(req.params.id);
        // Prevent deleting oneself
        if (userId.equals(req.auth.sub)) {
            return (0, response_1.sendError)(res, 'Cannot remove your own access', 400);
        }
        const user = await User_1.User.findOneAndDelete({ _id: userId, tenantId });
        if (!user) {
            return (0, response_1.sendError)(res, 'Staff member not found', 404);
        }
        (0, response_1.sendSuccess)(res, { deletedId: userId }, 'Staff member removed successfully');
    }
    catch (error) {
        console.error('Error deleting staff:', error);
        (0, response_1.sendError)(res, 'Failed to remove staff member');
    }
});
exports.default = router;
//# sourceMappingURL=staff.js.map