"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Task_1 = require("../models/Task");
const response_1 = require("../utils/response");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.requireAuth);
/**
 * Log activity helper
 */
function createActivity(action, userId, details) {
    return {
        action,
        user: new mongoose_1.default.Types.ObjectId(userId),
        timestamp: new Date(),
        details
    };
}
/**
 * GET /api/admin/tasks
 * Get all tasks for the tenant (with filters)
 */
router.get('/', async (req, res) => {
    try {
        const { tenantId, storeId } = req.auth;
        const { status, category, priority, assignedTo, search } = req.query;
        const query = { tenantId, storeId };
        if (status)
            query.status = status;
        if (category)
            query.category = category;
        if (priority)
            query.priority = priority;
        if (assignedTo) {
            if (assignedTo === 'unassigned')
                query.assignedTo = { $exists: false };
            else
                query.assignedTo = assignedTo;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const tasks = await Task_1.Task.find(query)
            .populate('assignedTo', 'name email avatarUrl')
            .populate('createdBy', 'name email avatarUrl')
            .sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, tasks);
    }
    catch (error) {
        (0, response_1.sendError)(res, error.message || 'Failed to fetch tasks', 500);
    }
});
/**
 * GET /api/admin/tasks/my
 * Get tasks assigned to the current user
 */
router.get('/my', async (req, res) => {
    try {
        const { tenantId, storeId, sub: userId } = req.auth;
        const { status, category, priority } = req.query;
        const query = { tenantId, storeId, assignedTo: userId };
        if (status)
            query.status = status;
        if (category)
            query.category = category;
        if (priority)
            query.priority = priority;
        const tasks = await Task_1.Task.find(query)
            .populate('createdBy', 'name email avatarUrl')
            .populate('assignedTo', 'name email avatarUrl')
            .sort({ dueDate: 1, createdAt: -1 });
        (0, response_1.sendSuccess)(res, tasks);
    }
    catch (error) {
        (0, response_1.sendError)(res, error.message || 'Failed to fetch tasks', 500);
    }
});
/**
 * GET /api/admin/tasks/dashboard
 * Get task dashboard statistics
 */
router.get('/dashboard', async (req, res) => {
    try {
        const { tenantId, storeId } = req.auth;
        const now = new Date();
        const [totalTasks, pending, inProgress, blocked, completed, overdue, salesTasks, operationsTasks, contentTasks, supportTasks, followUpTasks] = await Promise.all([
            Task_1.Task.countDocuments({ tenantId, storeId }),
            Task_1.Task.countDocuments({ tenantId, storeId, status: 'Pending' }),
            Task_1.Task.countDocuments({ tenantId, storeId, status: 'In Progress' }),
            Task_1.Task.countDocuments({ tenantId, storeId, status: 'Blocked' }),
            Task_1.Task.countDocuments({ tenantId, storeId, status: 'Completed' }),
            Task_1.Task.countDocuments({ tenantId, storeId, status: { $ne: 'Completed' }, dueDate: { $lt: now } }),
            Task_1.Task.countDocuments({ tenantId, storeId, category: 'Sales' }),
            Task_1.Task.countDocuments({ tenantId, storeId, category: 'Operations' }),
            Task_1.Task.countDocuments({ tenantId, storeId, category: 'Content' }),
            Task_1.Task.countDocuments({ tenantId, storeId, category: 'Support' }),
            Task_1.Task.countDocuments({ tenantId, storeId, category: 'Follow-up' })
        ]);
        (0, response_1.sendSuccess)(res, {
            totalTasks,
            pending,
            inProgress,
            blocked,
            completed,
            overdue,
            byCategory: {
                Sales: salesTasks,
                Operations: operationsTasks,
                Content: contentTasks,
                Support: supportTasks,
                'Follow-up': followUpTasks
            }
        });
    }
    catch (error) {
        (0, response_1.sendError)(res, error.message || 'Failed to fetch dashboard stats', 500);
    }
});
/**
 * GET /api/admin/tasks/:id
 * Get single task details
 */
router.get('/:id', async (req, res) => {
    try {
        const { tenantId, storeId } = req.auth;
        const task = await Task_1.Task.findOne({ _id: req.params.id, tenantId, storeId })
            .populate('assignedTo', 'name email avatarUrl')
            .populate('createdBy', 'name email avatarUrl')
            .populate('activities.user', 'name avatarUrl')
            .populate('comments.user', 'name avatarUrl');
        if (!task) {
            return (0, response_1.sendError)(res, 'Task not found', 404);
        }
        (0, response_1.sendSuccess)(res, task);
    }
    catch (error) {
        (0, response_1.sendError)(res, error.message || 'Failed to fetch task', 500);
    }
});
/**
 * POST /api/admin/tasks
 * Create a new task
 */
router.post('/', async (req, res) => {
    try {
        const { tenantId, storeId, sub: userId } = req.auth;
        const taskData = req.body;
        const newTask = new Task_1.Task({
            ...taskData,
            tenantId,
            storeId,
            createdBy: userId,
            activities: [
                createActivity('Task created', userId)
            ]
        });
        if (taskData.assignedTo) {
            newTask.activities.push(createActivity('Task assigned', userId, { assignedTo: taskData.assignedTo }));
        }
        await newTask.save();
        const populatedTask = await Task_1.Task.findById(newTask._id)
            .populate('assignedTo', 'name email avatarUrl')
            .populate('createdBy', 'name email avatarUrl');
        (0, response_1.sendSuccess)(res, populatedTask, 'Task created successfully');
    }
    catch (error) {
        (0, response_1.sendError)(res, error.message || 'Failed to create task', 500);
    }
});
/**
 * PATCH /api/admin/tasks/:id
 * Update general task details
 */
router.patch('/:id', async (req, res) => {
    try {
        const { tenantId, storeId, sub: userId } = req.auth;
        const updates = req.body;
        const task = await Task_1.Task.findOne({ _id: req.params.id, tenantId, storeId });
        if (!task)
            return (0, response_1.sendError)(res, 'Task not found', 404);
        let shouldSave = false;
        // Check status change
        if (updates.status && updates.status !== task.status) {
            if (updates.status === 'Completed') {
                task.progress = 100;
                task.completedAt = new Date();
                task.completedBy = new mongoose_1.default.Types.ObjectId(userId);
                task.activities.push(createActivity('Task completed', userId));
            }
            else {
                task.activities.push(createActivity(`Changed status from ${task.status} to ${updates.status}`, userId));
                if (task.status === 'Completed') {
                    // Reopening task
                    task.completedAt = undefined;
                    task.completedBy = undefined;
                    if (task.progress === 100)
                        task.progress = 0;
                }
            }
            task.status = updates.status;
            if (updates.status === 'Blocked' && updates.blockedReason) {
                task.blockedReason = updates.blockedReason;
            }
            shouldSave = true;
        }
        // Check assignment change
        if (updates.assignedTo && String(updates.assignedTo) !== String(task.assignedTo)) {
            task.assignedTo = updates.assignedTo;
            task.activities.push(createActivity('Task reassigned', userId, { assignedTo: updates.assignedTo }));
            shouldSave = true;
        }
        // Check progress
        if (updates.progress !== undefined && updates.progress !== task.progress) {
            task.progress = updates.progress;
            if (updates.progress === 100 && task.status !== 'Completed') {
                task.status = 'Completed';
                task.completedAt = new Date();
                task.completedBy = new mongoose_1.default.Types.ObjectId(userId);
                task.activities.push(createActivity('Task completed', userId));
            }
            task.activities.push(createActivity(`Updated progress to ${updates.progress}%`, userId));
            shouldSave = true;
        }
        // Direct updates for other simple fields
        ['title', 'description', 'priority', 'dueDate', 'category', 'taskType', 'team'].forEach(field => {
            if (updates[field] !== undefined && updates[field] !== task[field]) {
                task[field] = updates[field];
                shouldSave = true;
            }
        });
        if (shouldSave) {
            await task.save();
        }
        const populatedTask = await Task_1.Task.findById(task._id)
            .populate('assignedTo', 'name email avatarUrl')
            .populate('createdBy', 'name email avatarUrl')
            .populate('activities.user', 'name avatarUrl')
            .populate('comments.user', 'name avatarUrl');
        (0, response_1.sendSuccess)(res, populatedTask, 'Task updated successfully');
    }
    catch (error) {
        (0, response_1.sendError)(res, error.message || 'Failed to update task', 500);
    }
});
/**
 * DELETE /api/admin/tasks/:id
 * Delete task
 */
router.delete('/:id', async (req, res) => {
    try {
        const { tenantId, storeId } = req.auth;
        const task = await Task_1.Task.findOneAndDelete({ _id: req.params.id, tenantId, storeId });
        if (!task)
            return (0, response_1.sendError)(res, 'Task not found', 404);
        (0, response_1.sendSuccess)(res, null, 'Task deleted successfully');
    }
    catch (error) {
        (0, response_1.sendError)(res, error.message || 'Failed to delete task', 500);
    }
});
/**
 * POST /api/admin/tasks/:id/comments
 * Add comment
 */
router.post('/:id/comments', async (req, res) => {
    try {
        const { tenantId, storeId, sub: userId } = req.auth;
        const { message } = req.body;
        if (!message)
            return (0, response_1.sendError)(res, 'Comment message is required', 400);
        const task = await Task_1.Task.findOne({ _id: req.params.id, tenantId, storeId });
        if (!task)
            return (0, response_1.sendError)(res, 'Task not found', 404);
        const newComment = {
            id: new mongoose_1.default.Types.ObjectId().toString(),
            user: new mongoose_1.default.Types.ObjectId(userId),
            message,
            createdAt: new Date()
        };
        task.comments.push(newComment);
        task.activities.push(createActivity('Added a comment', userId));
        await task.save();
        const populatedTask = await Task_1.Task.findById(task._id).populate('comments.user', 'name avatarUrl');
        (0, response_1.sendSuccess)(res, populatedTask?.comments, 'Comment added');
    }
    catch (error) {
        (0, response_1.sendError)(res, error.message || 'Failed to add comment', 500);
    }
});
/**
 * POST /api/admin/tasks/:id/checklist
 * Add or update checklist item
 */
router.post('/:id/checklist', async (req, res) => {
    try {
        const { tenantId, storeId, sub: userId } = req.auth;
        const { id: itemId, title, isCompleted } = req.body;
        const task = await Task_1.Task.findOne({ _id: req.params.id, tenantId, storeId });
        if (!task)
            return (0, response_1.sendError)(res, 'Task not found', 404);
        if (itemId) {
            // Update existing
            const item = task.checklist.find((i) => i.id === itemId);
            if (item) {
                if (title !== undefined)
                    item.title = title;
                if (isCompleted !== undefined) {
                    item.isCompleted = isCompleted;
                    task.activities.push(createActivity(isCompleted ? `Completed checklist item: ${item.title}` : `Unchecked checklist item: ${item.title}`, userId));
                }
            }
        }
        else {
            // Add new
            if (!title)
                return (0, response_1.sendError)(res, 'Title required for new checklist item', 400);
            task.checklist.push({
                id: new mongoose_1.default.Types.ObjectId().toString(),
                title,
                isCompleted: false
            });
            task.activities.push(createActivity(`Added checklist item: ${title}`, userId));
        }
        await task.save();
        (0, response_1.sendSuccess)(res, task.checklist, 'Checklist updated');
    }
    catch (error) {
        (0, response_1.sendError)(res, error.message || 'Failed to update checklist', 500);
    }
});
exports.default = router;
//# sourceMappingURL=tasks.js.map