import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Order } from '../models/Order';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 });

    sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).populate('items.productId', 'imageUrl');

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { paymentStatus, fulfillmentStatus, notes } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (fulfillmentStatus) order.fulfillmentStatus = fulfillmentStatus;
    if (notes !== undefined) order.notes = notes;

    await order.save();
    sendSuccess(res, order, 'Order updated successfully');
  } catch (error) {
    next(error);
  }
});

router.post('/:id/fulfill', async (req, res, next) => {
  try {
    const { carrier, trackingNumber, trackingUrl, notifyCustomer } = req.body;

    if (!carrier || !trackingNumber) {
      return sendError(res, 'Carrier and tracking number are required', 400);
    }

    const order = await Order.findOne({
      _id: req.params.id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (!order.fulfillments) {
      order.fulfillments = [];
    }

    order.fulfillments.push({
      carrier,
      trackingNumber,
      trackingUrl,
      notifyCustomer,
      createdAt: new Date(),
    });

    order.fulfillmentStatus = 'fulfilled';

    await order.save();
    
    // In a real application, you would send an email here if notifyCustomer is true
    
    sendSuccess(res, order, 'Order fulfilled successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
