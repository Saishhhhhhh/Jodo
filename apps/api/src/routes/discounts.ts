import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Discount } from '../models/Discount';
import { successResponse } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const discounts = await Discount.find({
      tenantId: req.user!.tenantId,
      storeId: req.user!.storeId,
    }).sort({ createdAt: -1 });

    res.json(successResponse(discounts));
  } catch (error) {
    next(error);
  }
});

export default router;
