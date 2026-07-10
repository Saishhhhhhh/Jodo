import { Router } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Store } from '../models/Store';
import { Review } from '../models/Review';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.get('/products', async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(100);
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

router.get('/products/:id/reviews', async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.id, status: 'approved' }).sort({ createdAt: -1 });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1) : 0;
    
    res.json({ success: true, data: reviews, meta: { totalReviews, averageRating } });
  } catch (error) {
    next(error);
  }
});

router.post('/products/:id/reviews', async (req, res, next) => {
  try {
    const store = await Store.findOne();
    if (!store) return sendError(res, 'Store not found', 404);

    const { rating, authorName, authorEmail, title, body } = req.body;
    if (!rating || !authorName || !authorEmail || !body) {
      return sendError(res, 'Missing required review fields', 400);
    }

    const review = await Review.create({
      tenantId: store.tenantId,
      storeId: store._id,
      productId: req.params.id,
      rating: parseInt(rating, 10),
      authorName,
      authorEmail,
      title,
      body,
      status: 'pending' // Admin must approve
    });

    sendSuccess(res, review, 'Review submitted successfully and is pending approval', 201);
  } catch (error) {
    next(error);
  }
});

router.post('/checkout', async (req, res, next) => {
  try {
    const store = await Store.findOne();
    if (!store) {
      return res.status(400).json({ success: false, message: 'No store found to accept order' });
    }

    const {
      customerName,
      customerEmail,
      shippingAddress,
      items,
      subtotal,
      taxTotal,
      shippingTotal,
      totalAmount,
    } = req.body;

    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const mongoose = require('mongoose');
    
    const order = new Order({
      tenantId: store.tenantId,
      storeId: store._id,
      orderNumber,
      customerName,
      customerEmail,
      shippingAddress,
      items: items.map((item: any) => ({
        ...item,
        productId: mongoose.Types.ObjectId.isValid(item.productId) ? item.productId : undefined
      })),
      subtotal,
      taxTotal,
      shippingTotal,
      totalAmount,
      currency: store.defaultCurrency || 'INR',
      paymentStatus: 'paid', // Simulating successful checkout
      fulfillmentStatus: 'unfulfilled',
      itemsCount: items.reduce((acc: number, item: any) => acc + item.quantity, 0),
    });

    await order.save();
    
    sendSuccess(res, order, 'Order placed successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
