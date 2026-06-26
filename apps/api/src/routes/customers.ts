import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Customer } from '../models/Customer';
import { sendSuccess } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const customers = await Customer.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 });

    sendSuccess(res, customers);
  } catch (error) {
    next(error);
  }
});

export default router;
