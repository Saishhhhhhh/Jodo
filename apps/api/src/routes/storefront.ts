import { Router } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Store } from '../models/Store';
import { Review } from '../models/Review';
import { Collection } from '../models/Collection';
import { InteraktService } from '../services/interakt';
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

router.get('/collections', async (req, res, next) => {
  try {
    const collections = await Collection.find({ status: 'active' }).sort({ createdAt: -1 });
    sendSuccess(res, collections);
  } catch (error) {
    next(error);
  }
});

router.get('/collections/:slug', async (req, res, next) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug, status: 'active' })
      .populate({
        path: 'products',
        match: { status: 'active' }
      });
      
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    
    sendSuccess(res, collection);
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    let q = (req.query.q as string) || '';
    if (!q) return sendSuccess(res, []);

    let maxPrice;
    let minPrice;
    
    // 1. Extract MAX price ("under 5000", "below 5000", "max 5000")
    const underMatch = q.match(/(?:under|below|less than|max)\s*(\d+)/i);
    if (underMatch) {
      maxPrice = parseInt(underMatch[1]);
      q = q.replace(underMatch[0], '').trim();
    }

    // 2. Extract MIN price ("over 5000", "above 5000", "min 5000")
    const overMatch = q.match(/(?:over|above|more than|min)\s*(\d+)/i);
    if (overMatch) {
      minPrice = parseInt(overMatch[1]);
      q = q.replace(overMatch[0], '').trim();
    }

    // 3. Remove fluff words like 'rs', 'rupees', 'products'
    q = q.replace(/\b(rs|rupees|products?)\b/gi, '').trim();

    // 4. Build MongoDB Query
    const dbQuery: any = { status: 'active' };
    
    if (maxPrice !== undefined || minPrice !== undefined) {
      dbQuery.price = {};
      if (maxPrice !== undefined) dbQuery.price.$lte = maxPrice;
      if (minPrice !== undefined) dbQuery.price.$gte = minPrice;
    }

    if (q) {
      const keywords = q.split(/\s+/).filter(k => k.length > 1).join('|');
      if (keywords) {
        dbQuery.$or = [
          { title: { $regex: keywords, $options: 'i' } },
          { category: { $regex: keywords, $options: 'i' } },
          { shortDescription: { $regex: keywords, $options: 'i' } },
          { tags: { $regex: keywords, $options: 'i' } }
        ];
      }
    }

    const products = await Product.find(dbQuery).limit(12).sort({ createdAt: -1 });
    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
});

router.get('/banners', async (req, res, next) => {
  try {
    const { Banner } = require('../models/Banner');
    const banners = await Banner.find({ status: 'active' }).sort({ order: 1, createdAt: -1 });
    sendSuccess(res, banners);
  } catch (error) {
    next(error);
  }
});

router.get('/navigation/:handle', async (req, res, next) => {
  try {
    const { Navigation } = require('../models/Navigation');
    const menu = await Navigation.findOne({ handle: req.params.handle });
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    sendSuccess(res, menu);
  } catch (error) {
    next(error);
  }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('addons');
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
    
    // Trigger Interakt WhatsApp Notification
    const interaktSettings = (store.settings as any)?.notifications?.interakt;
    if (interaktSettings?.enabled && interaktSettings?.apiKey && interaktSettings?.orderPlacedTemplate) {
      if (shippingAddress?.phone) {
        InteraktService.sendTemplateMessage(
          interaktSettings.apiKey,
          shippingAddress.phone,
          interaktSettings.orderPlacedTemplate,
          'en',
          [customerName, orderNumber, totalAmount.toString()]
        ).catch((err: any) => console.error("Interakt Trigger Error", err));
      }
    }
    
    sendSuccess(res, order, 'Order placed successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
