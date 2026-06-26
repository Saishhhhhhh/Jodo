import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { AppPlugin } from '../models/AppPlugin';
import { successResponse } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const apps = await AppPlugin.find({
      tenantId: req.user!.tenantId,
      storeId: req.user!.storeId,
    }).sort({ createdAt: -1 });

    res.json(successResponse(apps));
  } catch (error) {
    next(error);
  }
});

export default router;
