import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Order } from '../models/Order';
import { Store } from '../models/Store';
import { ShiprocketService } from '../services/shiprocket';
import { InteraktService } from '../services/interakt';
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

    if (carrier === 'shiprocket') {
      const store = await Store.findOne({ _id: req.auth!.storeId });
      const srSettings = (store?.settings as any)?.shipping?.shiprocket;
      
      if (!srSettings || !srSettings.email || !srSettings.password) {
        return sendError(res, 'Shiprocket credentials are not configured in shipping settings', 400);
      }

      // Authenticate
      const token = await ShiprocketService.authenticate(srSettings.email, srSettings.password);
      
      // Create Order in Shiprocket
      const srOrderRes = await ShiprocketService.createOrder(token, order);
      const srOrderId = srOrderRes.order_id;
      const srShipmentId = srOrderRes.shipment_id;
      
      // Generate AWB
      const awbRes = await ShiprocketService.generateAWB(token, srShipmentId);
      const assignedAwb = awbRes?.response?.data?.awb_code || '';
      
      if (awbRes.error) {
        console.warn('Shiprocket AWB generation failed:', awbRes.message);
      }

      order.fulfillments.push({
        carrier: 'ShipRocket',
        trackingNumber: assignedAwb || `SR-PENDING-${srOrderId}`,
        trackingUrl: assignedAwb ? `https://shiprocket.co/tracking/${assignedAwb}` : '',
        notifyCustomer,
        createdAt: new Date(),
      } as any);

    } else {
      if (!carrier || !trackingNumber) {
        return sendError(res, 'Carrier and tracking number are required', 400);
      }
      
      order.fulfillments.push({
        carrier,
        trackingNumber,
        trackingUrl,
        notifyCustomer,
        createdAt: new Date(),
      } as any);
    }

    order.fulfillmentStatus = 'fulfilled';

    await order.save();
    
    // Interakt WhatsApp Notification for Order Shipped
    if (notifyCustomer) {
      // Store was already fetched if shiprocket was used, but to be safe let's ensure we have it
      const store = await Store.findOne({ _id: req.auth!.storeId });
      const interaktSettings = (store?.settings as any)?.notifications?.interakt;
      
      if (interaktSettings?.enabled && interaktSettings?.apiKey && interaktSettings?.orderShippedTemplate) {
        if (order.shippingAddress?.phone) {
          const recentFulfillment = order.fulfillments[order.fulfillments.length - 1];
          const trackLink = recentFulfillment.trackingUrl || recentFulfillment.trackingNumber;
          InteraktService.sendTemplateMessage(
            interaktSettings.apiKey,
            order.shippingAddress.phone,
            interaktSettings.orderShippedTemplate,
            'en',
            [order.customerName, order.orderNumber, recentFulfillment.carrier, trackLink]
          ).catch((err: any) => console.error("Interakt Trigger Error", err));
        }
      }
    }
    
    sendSuccess(res, order, 'Order fulfilled successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
