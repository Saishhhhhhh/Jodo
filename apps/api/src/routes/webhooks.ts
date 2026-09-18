import { Router } from 'express';
import { Order } from '../models/Order';
import { Lead } from '../models/Lead';
import { Tenant } from '../models/Tenant';
import { Store } from '../models/Store';
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
      const fulfillment = pendingOrder.fulfillments?.find((f: any) => f.trackingNumber.includes(`SR-PENDING-${order_id}`));
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

/**
 * POST /api/webhooks/leads
 * Universal webhook for incoming leads from Website, Interakt (WhatsApp), etc.
 */
router.post('/leads', async (req, res, next) => {
  try {
    // For single-tenant MVP, grab the default tenant/store if not provided in query
    let tenantId = req.query.tenantId as string;
    let storeId = req.query.storeId as string;

    if (!tenantId || !storeId) {
      const tenant = await Tenant.findOne();
      const store = await Store.findOne();
      if (!tenant || !store) return sendError(res, 'System not initialized', 500);
      tenantId = tenant._id.toString();
      storeId = store._id.toString();
    }

    const payload = req.body;
    let leadData: any = {
      tenantId,
      storeId,
      status: 'New',
      followUpPriority: 'Medium',
      interestLevel: 'Medium',
    };

    // 1. Check if it's an Interakt WhatsApp Webhook
    // Interakt sends a specific payload for incoming messages
    if (payload.type === 'message' && payload.data && payload.data.message) {
      const waData = payload.data.message;
      const customer = waData.customer;
      
      leadData.source = 'WhatsApp';
      leadData.name = customer?.traits?.name || customer?.phone_number || 'Unknown WhatsApp User';
      leadData.phone = customer?.phone_number;
      leadData.notes = `[Auto-captured from WhatsApp]\nInitial Message: ${waData.message?.text || 'Media Message'}`;
      
    } 
    // 2. Generic Website Form Webhook
    else {
      leadData.source = payload.source || 'Website';
      leadData.name = payload.name;
      leadData.email = payload.email;
      leadData.phone = payload.phone;
      leadData.productRequirement = payload.productRequirement;
      leadData.budget = payload.budget;
      leadData.location = payload.location;
      leadData.notes = payload.message ? `[Auto-captured from Website]\nMessage: ${payload.message}` : '';

      if (!leadData.name) {
        return sendError(res, 'Name is required for generic lead capture', 400);
      }
    }

    // Check if lead already exists by phone or email to prevent pure duplicates (optional logic)
    // For now, just create a new lead
    const lead = new Lead(leadData);
    await lead.save();

    sendSuccess(res, null, 'Lead captured successfully', 201);
  } catch (error) {
    next(error);
  }
});

export default router;
