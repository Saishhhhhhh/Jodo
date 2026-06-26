import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Product } from '../models/Product';
import { sendSuccess } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 });

    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
});

export default router;
