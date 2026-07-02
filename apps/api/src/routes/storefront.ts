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

router.get('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });
    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
});

export default router;
