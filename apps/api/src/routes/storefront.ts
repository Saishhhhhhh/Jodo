import { Router } from 'express';
import { Product } from '../models/Product';
import { sendSuccess } from '../utils/response';

const router = Router();

router.get('/products', async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(10);
    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
});

export default router;
