import { Router, Request, Response } from 'express';
import { requireAuth, requireTenant } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { Tenant } from '../models/Tenant';
import { Store } from '../models/Store';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

// Apply auth to all notification routes with dev fallback
router.use(async (req: Request, res: Response, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] !== 'undefined' && authHeader.split(' ')[1] !== 'null') {
    return requireAuth(req, res, () => requireTenant(req, res, next));
  }

  // Graceful fallback on local dev: use seeded tenant and store
  try {
    const tenant = await Tenant.findOne();
    const store = await Store.findOne({ tenantId: tenant?._id });
    if (tenant && store) {
      req.auth = {
        sub: 'dev-admin',
        tenantId: String(tenant._id),
        storeId: String(store._id),
        email: 'admin@jodo.dev',
        name: 'Admin',
        type: 'access',
      };
      return next();
    }
  } catch {
    // continue to requireAuth
  }
  return requireAuth(req, res, next);
});

router.get('/', async (req, res, next) => {
  try {
    const { state, type } = req.query;
    
    const query: any = {
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    };
    
    const userRole = (req.auth as any)?.role;
    // Admin, owner and dev-admin see all notifications
    if (userRole && userRole !== 'admin' && userRole !== 'owner' && userRole !== 'dev-admin') {
      query.targetRoles = userRole;
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

router.get('/unread-count', async (req, res, next) => {
  try {
    const query: any = {
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      state: 'unread',
    };
    const userRole = (req.auth as any)?.role;
    if (userRole && userRole !== 'admin' && userRole !== 'owner' && userRole !== 'dev-admin') {
      query.targetRoles = userRole;
    }

    const count = await Notification.countDocuments(query);
    sendSuccess(res, { count });
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
    const userRole = (req.auth as any)?.role;
    if (userRole && userRole !== 'admin' && userRole !== 'owner' && userRole !== 'dev-admin') {
      query.targetRoles = userRole;
    }
    
    await Notification.updateMany(query, { state: 'read' });
    sendSuccess(res, { message: 'All marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router;
