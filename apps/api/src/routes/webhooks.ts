import { Router } from 'express';
import { Order } from '../models/Order';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

/**
 * POST /api/webhooks/shiprocket
 * Receive tracking updates from Shiprocket
 */
router.post('/shiprocket', async (req, res, next) => {
  try {
    // Shiprocket sends a JSON payload with tracking status
    const { current_status, current_status_id, awb, order_id } = req.body;
    
    // Validate payload
    if (!awb) {
      return sendError(res, 'AWB is required', 400);
    }

    // Find the order that has this AWB
    // Since we appended the Shiprocket Order ID or AWB to trackingNumber, we can query it.
    const order = await Order.findOne({
      'fulfillments.trackingNumber': { $regex: new RegExp(awb, 'i') }
    });

    if (!order) {
      // It might be using SR-PENDING-{order_id} if AWB wasn't generated immediately
      const pendingOrder = await Order.findOne({
        'fulfillments.trackingNumber': `SR-PENDING-${order_id}`
      });

      if (!pendingOrder) {
        return sendError(res, 'Order with this AWB/OrderID not found', 404);
      }

      // Update the pending tracking number to the real AWB
      const fulfillment = pendingOrder.fulfillments?.find(f => f.trackingNumber.includes(`SR-PENDING-${order_id}`));
      if (fulfillment) {
        fulfillment.trackingNumber = awb;
        fulfillment.trackingUrl = `https://shiprocket.co/tracking/${awb}`;
      }
      
      await pendingOrder.save();
      return sendSuccess(res, null, 'Webhook processed and AWB updated');
    }

    // Update status based on current_status_id
    // Shiprocket Status IDs (partial list):
    // 6: Shipped, 7: Delivered, 8: Cancelled, 9: RTO Initiated, 10: RTO Delivered, 18: In Transit
    
    if (current_status_id === 7) {
      // Delivered
      // In Jodo, fulfillmentStatus 'fulfilled' means shipped. We might not have 'delivered' explicitly in fulfillmentStatus,
      // but we could append a note or update a timeline array if we had one.
      order.notes = (order.notes ? order.notes + '\n' : '') + `[Shiprocket Webhook] Order delivered on ${new Date().toLocaleString()}`;
    } else if (current_status_id === 18) {
      // In Transit
      order.notes = (order.notes ? order.notes + '\n' : '') + `[Shiprocket Webhook] Order in transit on ${new Date().toLocaleString()}`;
    }

    await order.save();
    
    sendSuccess(res, null, 'Webhook processed successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
