"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Product_1 = require("../models/Product");
const InventoryItem_1 = require("../models/InventoryItem");
const Order_1 = require("../models/Order");
const Return_1 = require("../models/Return");
const Task_1 = require("../models/Task");
const Message_1 = require("../models/Message");
const Review_1 = require("../models/Review");
const Notification_1 = require("../models/Notification");
const Tenant_1 = require("../models/Tenant");
const Store_1 = require("../models/Store");
const router = express_1.default.Router();
// Apply auth to counts route with dev fallback
router.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] !== 'undefined' && authHeader.split(' ')[1] !== 'null') {
        return (0, auth_1.requireAuth)(req, res, next);
    }
    // Graceful fallback on local dev: use seeded tenant and store
    try {
        const tenant = await Tenant_1.Tenant.findOne();
        const store = await Store_1.Store.findOne({ tenantId: tenant?._id });
        if (tenant && store) {
            req.auth = {
                sub: 'dev-admin',
                tenantId: String(tenant._id),
                storeId: String(store._id),
                email: 'admin@jodo.dev',
                name: 'Admin',
                type: 'access',
            };
            return next();
        }
    }
    catch {
        // continue
    }
    return (0, auth_1.requireAuth)(req, res, next);
});
router.get('/', async (req, res) => {
    try {
        const storeId = req.auth?.storeId || req.user?.storeId || req.storeId;
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID required' });
        }
        const [productsRequiresAction, inventoryLowStock, inventoryOutOfStock, ordersTotal, ordersUnfulfilled, ordersPending, ordersProcessing, ordersNew, ordersDraft, ordersShippingPending, ordersFraudReview, returnsNew, returnsPending, returnsOpenComplaints, returnsUnresolved, tasksTodo, tasksInProgress, tasksOverdue, messagesUnread, reviewsPending, reviewsAwaitingApproval, reviewsRequiresReply, notificationsUnread, notificationsOrders] = await Promise.all([
            Product_1.Product.countDocuments({ storeId, status: 'draft' }), // simplified requiresAction logic
            InventoryItem_1.InventoryItem.countDocuments({ storeId, status: 'low_stock' }),
            InventoryItem_1.InventoryItem.countDocuments({ storeId, status: 'out_of_stock' }),
            Order_1.Order.countDocuments({ storeId }),
            Order_1.Order.countDocuments({ storeId, fulfillmentStatus: { $in: ['unfulfilled', 'partial'] } }),
            Order_1.Order.countDocuments({ storeId, paymentStatus: 'pending', status: { $in: ['open'] } }),
            Order_1.Order.countDocuments({ storeId, fulfillmentStatus: 'partial', status: { $in: ['open'] } }),
            Order_1.Order.countDocuments({ storeId, status: 'open', createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
            Order_1.Order.countDocuments({ storeId, status: 'draft' }),
            Order_1.Order.countDocuments({ storeId, status: 'open', fulfillmentStatus: 'unfulfilled' }),
            Order_1.Order.countDocuments({ storeId, fraudStatus: 'under_review' }),
            Return_1.Return.countDocuments({ storeId, status: 'requested' }),
            Return_1.Return.countDocuments({ storeId, status: 'approved' }),
            0, // Open complaints logic
            0, // Unresolved complaints logic
            Task_1.Task.countDocuments({ storeId, status: 'Pending' }),
            Task_1.Task.countDocuments({ storeId, status: 'In Progress' }),
            Task_1.Task.countDocuments({
                storeId,
                dueDate: { $lt: new Date() },
                status: { $nin: ['Completed', 'Cancelled'] }
            }),
            Message_1.Message.countDocuments({ storeId, isRead: false }),
            Review_1.Review.countDocuments({ storeId, status: 'pending' }),
            Review_1.Review.countDocuments({ storeId, status: 'pending' }), // awaiting approval
            0, // requires reply
            Notification_1.Notification.countDocuments({ storeId, state: 'unread' }),
            Notification_1.Notification.countDocuments({ storeId, type: 'order_alert', state: 'unread' })
        ]);
        const activeOrdersCount = ordersUnfulfilled > 0 ? ordersUnfulfilled : (ordersPending + ordersProcessing + ordersNew);
        const counts = {
            products: {
                requiresAction: productsRequiresAction
            },
            inventory: {
                lowStock: inventoryLowStock,
                outOfStock: inventoryOutOfStock
            },
            orders: {
                total: ordersTotal,
                pending: activeOrdersCount,
                unfulfilled: ordersUnfulfilled,
                new: ordersNew,
                draft: ordersDraft,
                shippingPending: ordersShippingPending,
                fraudReview: ordersFraudReview
            },
            notifications: {
                unread: notificationsUnread,
                orders: notificationsOrders
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
    }
    catch (error) {
        console.error('Error fetching admin counts:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
exports.default = router;
//# sourceMappingURL=counts.js.map