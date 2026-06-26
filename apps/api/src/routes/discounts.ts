import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Discount } from '../models/Discount';
import { sendSuccess } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const discounts = await Discount.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 });

    sendSuccess(res, discounts);
  } catch (error) {
    next(error);
  }
});

export default router;
