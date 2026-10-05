import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Return } from '../models/Return';
import { Order } from '../models/Order';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/admin/returns
 * List all returns
 */
router.get('/', async (req, res, next) => {
  try {
    const returns = await Return.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    })
      .populate('items.productId', 'imageUrl')
      .sort({ createdAt: -1 });

    sendSuccess(res, returns);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/returns/:id
 * Get single return detail
 */
router.get('/:id', async (req, res, next) => {
  try {
    const returnObj = await Return.findOne({
      _id: req.params.id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).populate('items.productId', 'imageUrl');

    if (!returnObj) {
      return sendError(res, 'Return request not found', 404);
    }

    sendSuccess(res, returnObj);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/returns
 * Create a new return request for an order
 */
router.post('/', async (req, res, next) => {
  try {
    const { orderId, items, refundAmount, notes } = req.body;

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Order ID and returned items are required', 400);
    }

    const order = await Order.findOne({
      _id: orderId,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!order) {
      return sendError(res, 'Associated order not found', 404);
    }

    if (order.fulfillmentStatus !== 'fulfilled') {
      return sendError(
        res,
        'Returns can only be initiated for orders that have been fulfilled and delivered to the customer.',
        400
      );
    }

    const returnObj = new Return({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      orderId,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items,
      refundAmount: refundAmount || 0,
      notes,
      status: 'requested',
    });

    await returnObj.save();

    // Transition the order's fulfillmentStatus to returned
    order.fulfillmentStatus = 'returned';
    await order.save();

    sendSuccess(res, returnObj, 'Return request initiated successfully', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/returns/:id
 * Update status/notes for a return request
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const returnObj = await Return.findOne({
      _id: req.params.id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!returnObj) {
      return sendError(res, 'Return request not found', 404);
    }

    if (status) returnObj.status = status;
    if (notes !== undefined) returnObj.notes = notes;

    await returnObj.save();

    // Update associated order status
    const order = await Order.findOne({
      $or: [
        { _id: returnObj.orderId },
        { orderNumber: returnObj.orderNumber }
      ],
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });
    if (order) {
      if (status === 'approved' || status === 'received' || status === 'refunded') {
        order.fulfillmentStatus = 'returned';
      }
      if (status === 'refunded') {
        order.paymentStatus = 'refunded';
      }
      await order.save();
    }

    sendSuccess(res, returnObj, 'Return request updated successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
