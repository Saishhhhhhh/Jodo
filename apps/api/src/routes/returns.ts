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
    const filter: any = {
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    };
    if (req.query.orderId) {
      filter.orderId = req.query.orderId;
    }
    const returns = await Return.find(filter)
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
    const { orderId, items, refundAmount, notes, type, images } = req.body;

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

    const returnObj = new Return({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      orderId,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      type: type || 'return',
      items,
      refundAmount: refundAmount || 0,
      notes,
      images: images || [],
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
    const { status, notes, resolution } = req.body;

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
    if (resolution !== undefined) returnObj.resolution = resolution;

    await returnObj.save();

    // If the return is successfully refunded, transition the associated order's payment status to refunded
    if (status === 'refunded') {
      const order = await Order.findOne({
        _id: returnObj.orderId,
        tenantId: req.auth!.tenantId,
        storeId: req.auth!.storeId,
      });
      if (order) {
        order.paymentStatus = 'refunded';
        await order.save();
      }
    }

    sendSuccess(res, returnObj, 'Return request updated successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
