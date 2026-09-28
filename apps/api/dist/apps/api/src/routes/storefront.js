"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const Store_1 = require("../models/Store");
const Review_1 = require("../models/Review");
const Collection_1 = require("../models/Collection");
const Customer_1 = require("../models/Customer");
const Notification_1 = require("../models/Notification");
const AuditLog_1 = require("../models/AuditLog");
const FulfilmentReadiness_1 = require("../models/FulfilmentReadiness");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.get('/products', async (req, res, next) => {
    try {
        const products = await Product_1.Product.find({}).sort({ createdAt: -1 }).limit(100);
        (0, response_1.sendSuccess)(res, products);
    }
    catch (error) {
        next(error);
    }
});
router.get('/collections', async (req, res, next) => {
    try {
        const collections = await Collection_1.Collection.find({ status: 'active' }).sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, collections);
    }
    catch (error) {
        next(error);
    }
});
router.get('/collections/:slug', async (req, res, next) => {
    try {
        const rawSlug = (req.params.slug || '').toLowerCase().trim();
        // 1. Direct match on slug
        let collection = await Collection_1.Collection.findOne({ slug: rawSlug, status: 'active' })
            .populate({
            path: 'products',
            match: { status: 'active' }
        });
        // 2. Check room & category slug aliases
        if (!collection) {
            const SLUG_ALIASES = {
                'dining-room': 'dining-and-togetherness',
                'dining': 'dining-and-togetherness',
                'kitchen-dining': 'dining-and-togetherness',
                'kitchen-and-dining': 'dining-and-togetherness',
                'living-room': 'living-room-serenity',
                'living': 'living-room-serenity',
                'bedroom': 'restful-bedroom',
                'bed-room': 'restful-bedroom',
                'study': 'study-and-workspace',
                'workspace': 'study-and-workspace',
                'study-room': 'study-and-workspace',
                'study-office': 'study-and-workspace',
                'study-and-office': 'study-and-workspace',
                'office': 'study-and-workspace',
            };
            const aliasedSlug = SLUG_ALIASES[rawSlug];
            if (aliasedSlug) {
                collection = await Collection_1.Collection.findOne({ slug: aliasedSlug, status: 'active' })
                    .populate({
                    path: 'products',
                    match: { status: 'active' }
                });
            }
        }
        // 3. Keyword / partial match against existing collection titles or slugs
        if (!collection) {
            const keywords = rawSlug.split('-').filter(w => w && !['and', 'room', 'the', 'for', 'set'].includes(w));
            if (keywords.length > 0) {
                const regex = new RegExp(keywords.join('|'), 'i');
                collection = await Collection_1.Collection.findOne({
                    status: 'active',
                    $or: [{ slug: regex }, { title: regex }]
                }).populate({
                    path: 'products',
                    match: { status: 'active' }
                });
            }
        }
        // 4. Dynamic category/tag fallback from Products if no manual collection matches
        if (!collection) {
            const regex = new RegExp(rawSlug.replace(/-/g, '[ -]?'), 'i');
            const matchingProducts = await Product_1.Product.find({
                status: 'active',
                $or: [
                    { category: regex },
                    { tags: { $in: [rawSlug, ...rawSlug.split('-')] } },
                    { title: regex }
                ]
            }).sort({ createdAt: -1 });
            if (matchingProducts.length > 0) {
                const formattedTitle = rawSlug
                    .split('-')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
                return (0, response_1.sendSuccess)(res, {
                    _id: 'cat_' + rawSlug,
                    title: formattedTitle,
                    slug: rawSlug,
                    description: `Explore our premium ${formattedTitle} collection crafted with sustainable materials and contemporary designs.`,
                    imageUrl: matchingProducts[0]?.imageUrl || 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
                    type: 'automated',
                    products: matchingProducts,
                    status: 'active'
                });
            }
        }
        if (!collection) {
            return res.status(404).json({ success: false, message: 'Collection not found' });
        }
        (0, response_1.sendSuccess)(res, collection);
    }
    catch (error) {
        next(error);
    }
});
router.get('/search', async (req, res, next) => {
    try {
        let q = req.query.q || '';
        if (!q)
            return (0, response_1.sendSuccess)(res, []);
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
        const dbQuery = { status: 'active' };
        if (maxPrice !== undefined || minPrice !== undefined) {
            dbQuery.price = {};
            if (maxPrice !== undefined)
                dbQuery.price.$lte = maxPrice;
            if (minPrice !== undefined)
                dbQuery.price.$gte = minPrice;
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
        const products = await Product_1.Product.find(dbQuery).limit(12).sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, products);
    }
    catch (error) {
        next(error);
    }
});
router.get('/banners', async (req, res, next) => {
    try {
        const { Banner } = require('../models/Banner');
        const banners = await Banner.find({ status: 'active' }).sort({ order: 1, createdAt: -1 });
        (0, response_1.sendSuccess)(res, banners);
    }
    catch (error) {
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
        (0, response_1.sendSuccess)(res, menu);
    }
    catch (error) {
        next(error);
    }
});
router.get('/products/:id', async (req, res, next) => {
    try {
        const isObjectId = mongoose_1.default.Types.ObjectId.isValid(req.params.id);
        let product = null;
        if (isObjectId) {
            product = await Product_1.Product.findById(req.params.id).populate('addons');
        }
        if (!product) {
            product = await Product_1.Product.findOne({ slug: req.params.id }).populate('addons');
        }
        if (!product)
            return res.status(404).json({ success: false, message: 'Not found' });
        (0, response_1.sendSuccess)(res, product);
    }
    catch (error) {
        next(error);
    }
});
router.get('/products/:id/reviews', async (req, res, next) => {
    try {
        let productId = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            const prod = await Product_1.Product.findOne({ slug: productId }).select('_id');
            if (prod)
                productId = prod._id.toString();
        }
        const reviews = await Review_1.Review.find({ productId, status: 'approved' }).sort({ createdAt: -1 });
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1) : 0;
        res.json({ success: true, data: reviews, meta: { totalReviews, averageRating } });
    }
    catch (error) {
        next(error);
    }
});
router.post('/products/:id/reviews', async (req, res, next) => {
    try {
        const store = await Store_1.Store.findOne();
        if (!store)
            return (0, response_1.sendError)(res, 'Store not found', 404);
        const { rating, authorName, authorEmail, title, body } = req.body;
        if (!rating || !authorName || !authorEmail || !body) {
            return (0, response_1.sendError)(res, 'Missing required review fields', 400);
        }
        const review = await Review_1.Review.create({
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
        (0, response_1.sendSuccess)(res, review, 'Review submitted successfully and is pending approval', 201);
    }
    catch (error) {
        next(error);
    }
});
router.post('/checkout', async (req, res, next) => {
    try {
        const store = await Store_1.Store.findOne();
        if (!store) {
            return res.status(400).json({ success: false, message: 'No store found to accept order' });
        }
        const { customerName, customerEmail, shippingAddress, items, subtotal, taxTotal, shippingTotal, totalAmount, } = req.body;
        const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        const order = new Order_1.Order({
            tenantId: store.tenantId,
            storeId: store._id,
            orderNumber,
            customerName: customerName || 'Valued Customer',
            customerEmail: customerEmail || 'customer@example.com',
            shippingAddress,
            items: (items || []).map((item) => ({
                ...item,
                productId: mongoose_1.default.Types.ObjectId.isValid(item.productId) ? item.productId : undefined,
            })),
            subtotal: subtotal || 0,
            taxTotal: taxTotal || 0,
            shippingTotal: shippingTotal || 0,
            totalAmount: totalAmount || 0,
            currency: store.defaultCurrency || 'INR',
            paymentStatus: 'paid', // Simulating successful payment
            fulfillmentStatus: 'unfulfilled',
            itemsCount: (items || []).reduce((acc, item) => acc + (item.quantity || 1), 0),
        });
        await order.save();
        // 1. Deduct Product Inventory in MongoDB
        if (Array.isArray(items)) {
            for (const item of items) {
                if (mongoose_1.default.Types.ObjectId.isValid(item.productId)) {
                    await Product_1.Product.findByIdAndUpdate(item.productId, {
                        $inc: { inventoryQuantity: -Number(item.quantity || 1) },
                    }).catch((err) => console.error('Error decrementing inventory:', err));
                }
            }
        }
        // 2. Update or Create Customer in MongoDB
        if (customerEmail) {
            try {
                const emailClean = customerEmail.trim().toLowerCase();
                let customer = await Customer_1.Customer.findOne({ tenantId: store.tenantId, email: emailClean });
                if (customer) {
                    customer.ordersCount = (customer.ordersCount || 0) + 1;
                    customer.totalSpent = (customer.totalSpent || 0) + (totalAmount || 0);
                    if (!customer.defaultShippingAddress && shippingAddress) {
                        customer.defaultShippingAddress = shippingAddress;
                    }
                    await customer.save();
                }
                else {
                    const [fName, ...rest] = (customerName || '').trim().split(' ');
                    const lName = rest.join(' ') || 'Customer';
                    await Customer_1.Customer.create({
                        tenantId: store.tenantId,
                        storeId: store._id,
                        firstName: fName || 'Valued',
                        lastName: lName,
                        email: emailClean,
                        phone: shippingAddress?.phone || '',
                        ordersCount: 1,
                        totalSpent: totalAmount || 0,
                        defaultShippingAddress: shippingAddress,
                    });
                }
            }
            catch (custErr) {
                console.error('Error updating customer on checkout:', custErr);
            }
        }
        // 3. Create Admin Notification in MongoDB
        try {
            await Notification_1.Notification.create({
                tenantId: store.tenantId,
                storeId: store._id,
                type: 'system_alert',
                title: `New Order #${orderNumber}`,
                message: `${customerName || 'Customer'} placed order #${orderNumber} for ₹${Number(totalAmount || 0).toLocaleString('en-IN')}`,
                severity: 'info',
                state: 'unread',
                targetRoles: ['admin', 'operations', 'sales'],
                metadata: {
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    totalAmount: order.totalAmount,
                },
            });
        }
        catch (notifErr) {
            console.error('Error creating order notification:', notifErr);
        }
        // 4. Record Immutable Audit Log in MongoDB
        try {
            await AuditLog_1.AuditLog.create({
                tenantId: store.tenantId,
                storeId: store._id,
                actorType: 'system',
                action: 'order.placed',
                resourceType: 'Order',
                resourceId: order._id.toString(),
                after: {
                    orderNumber: order.orderNumber,
                    totalAmount: order.totalAmount,
                    customerEmail: order.customerEmail,
                    itemsCount: order.itemsCount,
                },
            });
        }
        catch (auditErr) {
            console.error('Error creating audit log:', auditErr);
        }
        // 5. Create Fulfilment Readiness record for Warehouse tracking
        if (Array.isArray(items)) {
            try {
                for (const item of items) {
                    await FulfilmentReadiness_1.FulfilmentReadiness.create({
                        tenantId: store.tenantId,
                        orderId: orderNumber,
                        customer: customerName || 'Valued Customer',
                        channel: 'Online Store',
                        product: item.title || 'Product Item',
                        sku: item.sku || `SKU-${item.productId ? String(item.productId).slice(-6) : 'GEN'}`,
                        quantity: item.quantity || 1,
                        requiredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days
                        readinessScore: 35, // stockAvailable + stockReserved
                        conditions: {
                            stockAvailable: true,
                            stockReserved: true,
                            productionCompleted: true,
                            qcPassed: true,
                            packagingReady: false,
                            dispatchPrepared: false,
                        },
                        status: 'Partially Ready',
                        warehouse: 'Central Hub - BLR',
                    });
                }
            }
            catch (fulfErr) {
                console.error('Error creating fulfilment readiness record:', fulfErr);
            }
        }
        (0, response_1.sendSuccess)(res, order, 'Order placed successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=storefront.js.map