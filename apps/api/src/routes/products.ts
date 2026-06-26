import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Product } from '../models/Product';
import { successResponse } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({
      tenantId: req.user!.tenantId,
      storeId: req.user!.storeId,
    }).sort({ createdAt: -1 });

    res.json(successResponse(products));
  } catch (error) {
    next(error);
  }
});

export default router;
