import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Order } from '../models/Order';
import { successResponse } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find({
      tenantId: req.user!.tenantId,
      storeId: req.user!.storeId,
    }).sort({ createdAt: -1 });

    res.json(successResponse(orders));
  } catch (error) {
    next(error);
  }
});

export default router;
