import express from 'express';
import { requireAuth } from '../middleware/auth';
import { Product } from '../models/Product';
import { InventoryItem } from '../models/InventoryItem';
import { Order } from '../models/Order';
import { Return } from '../models/Return';
import { Task } from '../models/Task';
import { Message } from '../models/Message';
import { Review } from '../models/Review';

const router = express.Router();

router.get('/', requireAuth, async (req: any, res) => {
  try {
    const storeId = req.user?.storeId || req.storeId;
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Store ID required' });
    }

    const [
      productsRequiresAction,
      inventoryLowStock,
      inventoryOutOfStock,
      ordersPending,
      ordersProcessing,
      ordersNew,
      ordersDraft,
      ordersShippingPending,
      ordersFraudReview,
      returnsNew,
      returnsPending,
      returnsOpenComplaints,
      returnsUnresolved,
      tasksTodo,
      tasksInProgress,
      tasksOverdue,
      messagesUnread,
      reviewsPending,
      reviewsAwaitingApproval,
      reviewsRequiresReply
    ] = await Promise.all([
      Product.countDocuments({ storeId, status: 'draft' }), // simplified requiresAction logic
      InventoryItem.countDocuments({ storeId, status: 'low_stock' }),
      InventoryItem.countDocuments({ storeId, status: 'out_of_stock' }),
      Order.countDocuments({ storeId, paymentStatus: 'pending', status: { $in: ['open'] } }),
      Order.countDocuments({ storeId, fulfillmentStatus: 'partial', status: { $in: ['open'] } }),
      Order.countDocuments({ storeId, status: 'open', createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) } }),
      Order.countDocuments({ storeId, status: 'draft' }),
      Order.countDocuments({ storeId, status: 'open', fulfillmentStatus: 'unfulfilled' }),
      Order.countDocuments({ storeId, fraudStatus: 'under_review' }),
      Return.countDocuments({ storeId, status: 'requested' }),
      Return.countDocuments({ storeId, status: 'approved' }),
      0, // Open complaints logic
      0, // Unresolved complaints logic
      Task.countDocuments({ storeId, status: 'Pending' }),
      Task.countDocuments({ storeId, status: 'In Progress' }),
      Task.countDocuments({ 
        storeId, 
        dueDate: { $lt: new Date() }, 
        status: { $nin: ['Completed', 'Cancelled'] } 
      }),
      Message.countDocuments({ storeId, isRead: false }),
      Review.countDocuments({ storeId, status: 'pending' }),
      Review.countDocuments({ storeId, status: 'pending' }), // awaiting approval
      0 // requires reply
    ]);

    const counts = {
      products: {
        requiresAction: productsRequiresAction
      },
      inventory: {
        lowStock: inventoryLowStock,
        outOfStock: inventoryOutOfStock
      },
      orders: {
        pending: ordersPending + ordersProcessing + ordersNew,
        draft: ordersDraft,
        shippingPending: ordersShippingPending,
        fraudReview: ordersFraudReview
      },
      returns: {
        open: returnsNew + returnsPending + returnsOpenComplaints + returnsUnresolved
      },
      tasks: {
        todo: tasksTodo,
        inProgress: tasksInProgress,
        overdue: tasksOverdue,
        totalOpen: tasksTodo + tasksInProgress
      },
      messages: {
        unread: messagesUnread
      },
      reviews: {
        pending: reviewsPending + reviewsAwaitingApproval + reviewsRequiresReply
      }
    };

    res.json({ success: true, data: counts });
  } catch (error) {
    console.error('Error fetching admin counts:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
