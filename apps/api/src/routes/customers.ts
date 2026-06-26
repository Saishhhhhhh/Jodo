import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Customer } from '../models/Customer';
import { successResponse } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const customers = await Customer.find({
      tenantId: req.user!.tenantId,
      storeId: req.user!.storeId,
    }).sort({ createdAt: -1 });

    res.json(successResponse(customers));
  } catch (error) {
    next(error);
  }
});

export default router;
