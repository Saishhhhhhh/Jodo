import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const { state, type } = req.query;
    
    const query: any = {
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    };
    
    // We should filter by user role, but for now we assume they can see targets if they have access
    // Assuming req.auth.role exists. We can do: query.targetRoles = req.auth.role;
    if (req.auth!.role) {
      query.targetRoles = req.auth!.role;
    }
    
    if (state && state !== 'all') {
      query.state = state;
    } else {
      query.state = { $ne: 'resolved' }; // by default don't show resolved
    }
    
    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50).lean();
    sendSuccess(res, notifications);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, storeId: req.auth!.storeId },
      { state: 'read' },
      { new: true }
    );
    sendSuccess(res, notif);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/dismiss', async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, storeId: req.auth!.storeId },
      { state: 'dismissed' },
      { new: true }
    );
    sendSuccess(res, notif);
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    const query: any = {
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      state: 'unread'
    };
    if (req.auth!.role) query.targetRoles = req.auth!.role;
    
    await Notification.updateMany(query, { state: 'read' });
    sendSuccess(res, { message: 'All marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router;
