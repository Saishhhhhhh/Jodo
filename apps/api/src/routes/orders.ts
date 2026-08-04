import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Order } from '../models/Order';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const filter: any = {
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });

    sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { customerName, customerEmail, items, shippingAddress } = req.body;

    if (!items || !items.length) {
      return sendError(res, 'Order must contain at least one item', 400);
    }

    // Calculate totals
    let subtotal = 0;
    let itemsCount = 0;
    const orderItems = items.map((item: any) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      itemsCount += item.quantity;
      return {
        productId: item.productId,
        sku: item.sku || 'N/A',
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal,
      };
    });

    const taxTotal = 0; // Simple for now
    const shippingTotal = 0; // Simple for now
    const totalAmount = subtotal + taxTotal + shippingTotal;
    
    // Generate order number
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `DRAFT-${randomSuffix}`;

    const order = new Order({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      orderNumber,
      customerName: customerName || 'Unknown Customer',
      customerEmail: customerEmail || 'unknown@example.com',
      items: orderItems,
      shippingAddress,
      subtotal,
      taxTotal,
      shippingTotal,
      totalAmount,
      itemsCount,
      status: 'draft',
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
    });

    await order.save();
    sendSuccess(res, order, 'Draft order created successfully', 201);
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
    const { paymentStatus, fulfillmentStatus, notes, fraudStatus, status } = req.body;

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
    if (fraudStatus) order.fraudStatus = fraudStatus;
    if (status) order.status = status;

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
