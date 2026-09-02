import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { AuditLog } from '../models/AuditLog';
import { sendSuccess } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const auditLogs = await AuditLog.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    })
      .populate('actorUserId', 'name email')
      .sort({ createdAt: -1 });

    sendSuccess(res, auditLogs);
  } catch (error) {
    next(error);
  }
});

export default router;
