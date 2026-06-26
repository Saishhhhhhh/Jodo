import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Order } from '../models/Order';
import { sendSuccess } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 });

    sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
});

export default router;
