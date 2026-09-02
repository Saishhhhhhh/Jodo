import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { AppPlugin } from '../models/AppPlugin';
import { sendSuccess } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const apps = await AppPlugin.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 });

    sendSuccess(res, apps);
  } catch (error) {
    next(error);
  }
});

export default router;
