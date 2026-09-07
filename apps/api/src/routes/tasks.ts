import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { sendSuccess, sendError } from '../utils/response';
import mongoose from 'mongoose';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

/**
 * Log activity helper
 */
function createActivity(action: string, userId: string, details?: any) {
  return {
    action,
    user: new mongoose.Types.ObjectId(userId),
    timestamp: new Date(),
    details
  };
}

/**
 * GET /api/admin/tasks
 * Get all tasks for the tenant (with filters)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tenantId, storeId } = req.auth!;
    const { status, category, priority, assignedTo, search } = req.query;

    const query: any = {
      tenantId: new mongoose.Types.ObjectId(tenantId),
      storeId: new mongoose.Types.ObjectId(storeId),
    };
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    // Check if user is a TEAM_MEMBER
    const user = await User.findById(req.auth!.sub).populate('roleIds', 'name');
    const isTeamMember = user?.roleIds.some((r: any) => r.name === 'TEAM_MEMBER');

    if (isTeamMember) {
      query.assignedTo = new mongoose.Types.ObjectId(req.auth!.sub);
    } else if (assignedTo) {
      if (assignedTo === 'unassigned') query.assignedTo = { $exists: false };
      else query.assignedTo = assignedTo;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatarUrl')
      .populate('createdBy', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    sendSuccess(res, tasks);
  } catch (error: any) {
    console.error('Tasks GET error:', error);
    sendError(res, error.message || 'Failed to fetch tasks', 500);
  }
});

/**
 * GET /api/admin/tasks/my
 * Get tasks assigned to the current user
 */
router.get('/my', async (req: Request, res: Response) => {
  try {
    const { tenantId, storeId, sub: userId } = req.auth!;
    const { status, category, priority } = req.query;

    const query: any = { tenantId, storeId, assignedTo: userId };
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email avatarUrl')
      .populate('assignedTo', 'name email avatarUrl')
      .sort({ dueDate: 1, createdAt: -1 });

    sendSuccess(res, tasks);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch tasks', 500);
  }
});

/**
 * GET /api/admin/tasks/dashboard
 * Get task dashboard statistics
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { tenantId, storeId } = req.auth!;
    const now = new Date();

    const [
      totalTasks,
      pending,
      inProgress,
      blocked,
      completed,
      overdue,
      salesTasks,
      operationsTasks,
      contentTasks,
      supportTasks,
      followUpTasks
    ] = await Promise.all([
      Task.countDocuments({ tenantId, storeId }),
      Task.countDocuments({ tenantId, storeId, status: 'Pending' }),
      Task.countDocuments({ tenantId, storeId, status: 'In Progress' }),
      Task.countDocuments({ tenantId, storeId, status: 'Blocked' }),
      Task.countDocuments({ tenantId, storeId, status: 'Completed' }),
      Task.countDocuments({ tenantId, storeId, status: { $ne: 'Completed' }, dueDate: { $lt: now } }),
      Task.countDocuments({ tenantId, storeId, category: 'Sales' }),
      Task.countDocuments({ tenantId, storeId, category: 'Operations' }),
      Task.countDocuments({ tenantId, storeId, category: 'Content' }),
      Task.countDocuments({ tenantId, storeId, category: 'Support' }),
      Task.countDocuments({ tenantId, storeId, category: 'Follow-up' })
    ]);

    sendSuccess(res, {
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
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch dashboard stats', 500);
  }
});

/**
 * GET /api/admin/tasks/:id
 * Get single task details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { tenantId, storeId } = req.auth!;
    
    const task = await Task.findOne({ _id: req.params.id, tenantId, storeId })
      .populate('assignedTo', 'name email avatarUrl')
      .populate('createdBy', 'name email avatarUrl')
      .populate('activities.user', 'name avatarUrl')
      .populate('comments.user', 'name avatarUrl');

    if (!task) {
      return sendError(res, 'Task not found', 404);
    }

    sendSuccess(res, task);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch task', 500);
  }
});

/**
 * POST /api/admin/tasks
 * Create a new task
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { tenantId, storeId, sub: userId } = req.auth!;
    
    const taskData = req.body;
    
    const newTask = new Task({
      ...taskData,
      tenantId: new mongoose.Types.ObjectId(tenantId),
      storeId: new mongoose.Types.ObjectId(storeId),
      createdBy: new mongoose.Types.ObjectId(userId),
      assignedTo: taskData.assignedTo && taskData.assignedTo !== 'unassigned'
        ? new mongoose.Types.ObjectId(taskData.assignedTo)
        : undefined,
      activities: [
        createActivity('Task created', userId)
      ]
    });

    if (taskData.assignedTo && taskData.assignedTo !== 'unassigned') {
      newTask.activities.push(createActivity('Task assigned', userId, { assignedTo: taskData.assignedTo }));
    }

    await newTask.save();
    
    const populatedTask = await Task.findById(newTask._id)
      .populate('assignedTo', 'name email avatarUrl')
      .populate('createdBy', 'name email avatarUrl');

    sendSuccess(res, populatedTask, 'Task created successfully');
  } catch (error: any) {
    console.error('Task CREATE error:', error);
    sendError(res, error.message || 'Failed to create task', 500);
  }
});

/**
 * PATCH /api/admin/tasks/:id
 * Update general task details
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { tenantId, storeId, sub: userId } = req.auth!;
    const updates = req.body;
    
    const task = await Task.findOne({ _id: req.params.id, tenantId, storeId });
    if (!task) return sendError(res, 'Task not found', 404);

    let shouldSave = false;

    // Check status change
    if (updates.status && updates.status !== task.status) {
      if (updates.status === 'Completed') {
        task.progress = 100;
        task.completedAt = new Date();
        task.completedBy = new mongoose.Types.ObjectId(userId);
        task.activities.push(createActivity('Task completed', userId));
      } else {
        task.activities.push(createActivity(`Changed status from ${task.status} to ${updates.status}`, userId));
        if (task.status === 'Completed') {
          // Reopening task
          task.completedAt = undefined;
          task.completedBy = undefined;
          if (task.progress === 100) task.progress = 0;
        }
      }
      task.status = updates.status;
      if (updates.status === 'Blocked' && updates.blockedReason) {
        task.blockedReason = updates.blockedReason;
      }
      shouldSave = true;

      // Create Notification
      try {
        const user = await User.findById(userId).select('name');
        const userName = user ? user.name : 'A team member';
        await Notification.create({
          tenantId,
          storeId,
          type: 'system_alert',
          title: 'Task Status Updated',
          message: `${userName} updated task "${task.title}" to ${updates.status}.`,
          severity: updates.status === 'Blocked' ? 'warning' : 'info',
          targetRoles: ['admin', 'manager'],
          metadata: {
            taskId: task._id,
            newStatus: updates.status,
          },
        });
      } catch (notifErr) {
        console.error('Failed to create notification:', notifErr);
      }
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
        task.completedBy = new mongoose.Types.ObjectId(userId);
        task.activities.push(createActivity('Task completed', userId));
      }
      task.activities.push(createActivity(`Updated progress to ${updates.progress}%`, userId));
      shouldSave = true;
    }

    // Direct updates for other simple fields
    ['title', 'description', 'priority', 'dueDate', 'category', 'taskType', 'team'].forEach(field => {
      if (updates[field] !== undefined && updates[field] !== task[field as keyof typeof task]) {
        (task as any)[field] = updates[field];
        shouldSave = true;
      }
    });

    if (shouldSave) {
      await task.save();
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatarUrl')
      .populate('createdBy', 'name email avatarUrl')
      .populate('activities.user', 'name avatarUrl')
      .populate('comments.user', 'name avatarUrl');

    sendSuccess(res, populatedTask, 'Task updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update task', 500);
  }
});

/**
 * DELETE /api/admin/tasks/:id
 * Delete task
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { tenantId, storeId } = req.auth!;
    
    const task = await Task.findOneAndDelete({ _id: req.params.id, tenantId, storeId });
    if (!task) return sendError(res, 'Task not found', 404);

    sendSuccess(res, null, 'Task deleted successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete task', 500);
  }
});

/**
 * POST /api/admin/tasks/:id/comments
 * Add comment
 */
router.post('/:id/comments', async (req: Request, res: Response) => {
  try {
    const { tenantId, storeId, sub: userId } = req.auth!;
    const { message } = req.body;
    
    if (!message) return sendError(res, 'Comment message is required', 400);

    const task = await Task.findOne({ _id: req.params.id, tenantId, storeId });
    if (!task) return sendError(res, 'Task not found', 404);

    const newComment = {
      id: new mongoose.Types.ObjectId().toString(),
      user: new mongoose.Types.ObjectId(userId),
      message,
      createdAt: new Date()
    };

    task.comments.push(newComment);
    task.activities.push(createActivity('Added a comment', userId));
    await task.save();

    const populatedTask = await Task.findById(task._id).populate('comments.user', 'name avatarUrl');
    sendSuccess(res, populatedTask?.comments, 'Comment added');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to add comment', 500);
  }
});

/**
 * POST /api/admin/tasks/:id/checklist
 * Add or update checklist item
 */
router.post('/:id/checklist', async (req: Request, res: Response) => {
  try {
    const { tenantId, storeId, sub: userId } = req.auth!;
    const { id: itemId, title, isCompleted } = req.body;
    
    const task = await Task.findOne({ _id: req.params.id, tenantId, storeId });
    if (!task) return sendError(res, 'Task not found', 404);

    if (itemId) {
      // Update existing
      const item = task.checklist.find((i: any) => i.id === itemId);
      if (item) {
        if (title !== undefined) item.title = title;
        if (isCompleted !== undefined) {
          item.isCompleted = isCompleted;
          task.activities.push(createActivity(isCompleted ? `Completed checklist item: ${item.title}` : `Unchecked checklist item: ${item.title}`, userId));
        }
      }
    } else {
      // Add new
      if (!title) return sendError(res, 'Title required for new checklist item', 400);
      task.checklist.push({
        id: new mongoose.Types.ObjectId().toString(),
        title,
        isCompleted: false
      });
      task.activities.push(createActivity(`Added checklist item: ${title}`, userId));
    }

    await task.save();
    sendSuccess(res, task.checklist, 'Checklist updated');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update checklist', 500);
  }
});

export default router;
