"use strict";
/**
 * Seed script — creates initial tenant, store, roles, and admin user.
 * Run: npm run seed
 *
 * Credentials seeded:
 *   Email: admin@jodo.dev
 *   Password: Admin@123456
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("../config/env"); // Load env first
const db_1 = require("../config/db");
const Tenant_1 = require("../models/Tenant");
const Store_1 = require("../models/Store");
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const Customer_1 = require("../models/Customer");
const InventoryItem_1 = require("../models/InventoryItem");
const Discount_1 = require("../models/Discount");
const AppPlugin_1 = require("../models/AppPlugin");
const AuditLog_1 = require("../models/AuditLog");
const Review_1 = require("../models/Review");
const Return_1 = require("../models/Return");
const CustomerSegment_1 = require("../models/CustomerSegment");
const shared_1 = require("@jodo/shared");
const SEED_EMAIL = process.env.ADMIN_SEED_EMAIL || 'admin@jodo.dev';
const SEED_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'Admin@123456';
async function seed() {
    console.log('🌱 Starting database seed...');
    await (0, db_1.connectDB)();
    // Check if already seeded base data
    const existingUser = await User_1.User.findOne({ email: SEED_EMAIL });
    if (existingUser) {
        console.log(`✅ Base auth data already seeded. Updating dummy data only...`);
        const tenant = await Tenant_1.Tenant.findOne();
        const store = await Store_1.Store.findOne({ tenantId: tenant?._id });
        if (tenant && store) {
            await seedDummyData(tenant._id, store._id);
        }
        await (0, db_1.disconnectDB)();
        return;
    }
    // 1. Create Tenant
    const tenant = await Tenant_1.Tenant.create({
        name: 'Jodo Commerce',
        slug: 'jodo-commerce',
        plan: 'pro',
        status: 'active',
        billingEmail: SEED_EMAIL,
    });
    console.log(`✅ Tenant created: ${tenant.name} (${tenant._id})`);
    // 2. Create Store
    const store = await Store_1.Store.create({
        tenantId: tenant._id,
        name: 'My Store',
        slug: 'my-store',
        defaultCurrency: 'INR',
        defaultCountry: 'IN',
        timezone: 'Asia/Kolkata',
        status: 'active',
    });
    console.log(`✅ Store created: ${store.name} (${store._id})`);
    // 3. Create System Roles
    const allPermissions = Object.values(shared_1.PERMISSIONS);
    const ownerRole = await Role_1.Role.create({
        tenantId: tenant._id,
        name: shared_1.SYSTEM_ROLES.OWNER,
        description: 'Full access to everything',
        permissions: allPermissions,
        isSystemRole: true,
    });
    await Role_1.Role.create({
        tenantId: tenant._id,
        name: shared_1.SYSTEM_ROLES.ADMIN,
        description: 'Admin access — all except billing',
        permissions: allPermissions.filter((p) => p !== shared_1.PERMISSIONS.MANAGE_BILLING),
        isSystemRole: true,
    });
    await Role_1.Role.create({
        tenantId: tenant._id,
        name: shared_1.SYSTEM_ROLES.STAFF,
        description: 'Operational staff — orders, products, customers',
        permissions: [
            shared_1.PERMISSIONS.READ_PRODUCTS,
            shared_1.PERMISSIONS.WRITE_PRODUCTS,
            shared_1.PERMISSIONS.READ_ORDERS,
            shared_1.PERMISSIONS.WRITE_ORDERS,
            shared_1.PERMISSIONS.READ_CUSTOMERS,
            shared_1.PERMISSIONS.READ_INVENTORY,
            shared_1.PERMISSIONS.WRITE_INVENTORY,
            shared_1.PERMISSIONS.READ_ANALYTICS,
        ],
        isSystemRole: true,
    });
    await Role_1.Role.create({
        tenantId: tenant._id,
        name: shared_1.SYSTEM_ROLES.VIEWER,
        description: 'Read-only access',
        permissions: [
            shared_1.PERMISSIONS.READ_PRODUCTS,
            shared_1.PERMISSIONS.READ_ORDERS,
            shared_1.PERMISSIONS.READ_CUSTOMERS,
            shared_1.PERMISSIONS.READ_ANALYTICS,
        ],
        isSystemRole: true,
    });
    console.log('✅ System roles created: owner, admin, staff, viewer');
    // 4. Create Admin User
    const adminUser = await User_1.User.create({
        tenantId: tenant._id,
        storeId: store._id,
        name: 'Admin User',
        email: SEED_EMAIL,
        passwordHash: SEED_PASSWORD, // Will be hashed by pre-save hook
        status: 'active',
        roleIds: [ownerRole._id],
        permissions: allPermissions,
        twoFactorEnabled: false,
    });
    // Update tenant owner
    await Tenant_1.Tenant.findByIdAndUpdate(tenant._id, { ownerUserId: adminUser._id });
    console.log(`\n✅ Admin user created:`);
    console.log(`   Email:    ${SEED_EMAIL}`);
    console.log(`   Password: ${SEED_PASSWORD}`);
    console.log(`   Role:     ${shared_1.SYSTEM_ROLES.OWNER}\n`);
    await seedDummyData(tenant._id, store._id);
    console.log('🎉 Seed completed successfully!');
    await (0, db_1.disconnectDB)();
}
async function seedDummyData(tenantId, storeId) {
    console.log('📦 Seeding dummy data...');
    // Clear existing
    await Product_1.Product.deleteMany({});
    await Customer_1.Customer.deleteMany({});
    await Order_1.Order.deleteMany({});
    await InventoryItem_1.InventoryItem.deleteMany({});
    await Discount_1.Discount.deleteMany({});
    await AppPlugin_1.AppPlugin.deleteMany({});
    await Review_1.Review.deleteMany({});
    await Return_1.Return.deleteMany({});
    await CustomerSegment_1.CustomerSegment.deleteMany({});
    const products = await Product_1.Product.insertMany([
        { tenantId: tenantId, storeId: storeId, title: 'Premium Cotton T-Shirt', slug: 'cotton-tshirt', status: 'active', price: 29.99, compareAtPrice: 39.99, sku: 'TSH-001', inventoryQuantity: 150, category: 'Apparel', vendor: 'Jodo Apparel', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80', galleryImages: ['https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80'] },
        { tenantId: tenantId, storeId: storeId, title: 'Wireless Noise-Canceling Headphones', slug: 'wireless-headphones', status: 'active', price: 199.99, compareAtPrice: 249.99, sku: 'WH-002', inventoryQuantity: 45, category: 'Electronics', vendor: 'Jodo Audio', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80', galleryImages: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1546435770-a3e426fa47ce?auto=format&fit=crop&w=1200&q=80'] },
        { tenantId: tenantId, storeId: storeId, title: 'Ergonomic Office Chair', slug: 'office-chair', status: 'active', price: 149.50, sku: 'OC-003', inventoryQuantity: 12, category: 'Furniture', vendor: 'Jodo Living', imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=1200&q=80', galleryImages: ['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=1200&q=80'] },
        { tenantId: tenantId, storeId: storeId, title: 'Organic Arabica Coffee Beans', slug: 'coffee-beans', status: 'active', price: 18.00, sku: 'CB-004', inventoryQuantity: 300, category: 'Food & Beverage', vendor: 'Jodo Farms', imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80', galleryImages: ['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1200&q=80'] },
        { tenantId: tenantId, storeId: storeId, title: 'Minimalist Leather Wallet', slug: 'leather-wallet', status: 'draft', price: 45.00, sku: 'LW-005', inventoryQuantity: 0, category: 'Accessories', vendor: 'Jodo Leather', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80', galleryImages: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=1200&q=80'] },
    ]);
    console.log(`✅ ${products.length} Products seeded.`);
    const customers = await Customer_1.Customer.insertMany([
        { tenantId: tenantId, storeId: storeId, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', ordersCount: 2, totalSpent: 125.00, status: 'active', tags: ['local'] },
        { tenantId: tenantId, storeId: storeId, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', ordersCount: 5, totalSpent: 850.50, status: 'active', tags: ['wholesale', 'vip'] },
        { tenantId: tenantId, storeId: storeId, firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', ordersCount: 0, totalSpent: 0, status: 'inactive', tags: [] },
        { tenantId: tenantId, storeId: storeId, firstName: 'Diana', lastName: 'Prince', email: 'diana@example.com', ordersCount: 12, totalSpent: 2450.00, status: 'active', tags: ['vip'] },
    ]);
    console.log(`✅ ${customers.length} Customers seeded.`);
    const orders = await Order_1.Order.insertMany([
        {
            tenantId, storeId, orderNumber: 'ORD-1001',
            customerName: 'Alice Smith', customerEmail: 'alice@example.com',
            items: [
                { productId: products[0]._id, sku: 'TSH-001', title: 'Premium Cotton T-Shirt', quantity: 3, price: 29.99, total: 89.97 }
            ],
            shippingAddress: { firstName: 'Alice', lastName: 'Smith', address1: '123 Fashion Ave', city: 'Mumbai', state: 'MH', zip: '400001', country: 'India' },
            subtotal: 89.97, taxTotal: 10.03, shippingTotal: 25.00, totalAmount: 125.00, currency: 'INR',
            paymentStatus: 'paid', fulfillmentStatus: 'fulfilled', itemsCount: 3,
            notes: 'Please leave package at the front door.',
            riskScore: 12, riskLevel: 'low',
            riskIndicators: [
                { indicator: 'CVV Check', severity: 'low', message: 'Card verification value (CVV) is correct.' },
                { indicator: 'Location Match', severity: 'low', message: 'Billing and shipping address locations are within the expected range.' }
            ],
            fraudStatus: 'approved'
        },
        {
            tenantId, storeId, orderNumber: 'ORD-1002',
            customerName: 'Bob Johnson', customerEmail: 'bob@example.com',
            items: [
                { productId: products[2]._id, sku: 'OC-003', title: 'Ergonomic Office Chair', quantity: 1, price: 149.50, total: 149.50 }
            ],
            shippingAddress: { firstName: 'Bob', lastName: 'Johnson', address1: '456 Tech Park', city: 'Bengaluru', state: 'KA', zip: '560001', country: 'India' },
            subtotal: 149.50, taxTotal: 15.50, shippingTotal: 0.00, totalAmount: 165.00, currency: 'INR',
            paymentStatus: 'pending', fulfillmentStatus: 'unfulfilled', itemsCount: 1,
            riskScore: 88, riskLevel: 'high',
            riskIndicators: [
                { indicator: 'Anonymous Proxy', severity: 'high', message: 'Order was placed using an anonymous web proxy or VPN service.' },
                { indicator: 'Billing Name Mismatch', severity: 'medium', message: 'Cardholder name does not match the customer billing name.' },
                { indicator: 'Location Mismatch', severity: 'high', message: 'IP address location is 3,000 miles away from the shipping address.' }
            ],
            fraudStatus: 'under_review'
        },
        {
            tenantId, storeId, orderNumber: 'ORD-1003',
            customerName: 'Diana Prince', customerEmail: 'diana@example.com',
            items: [
                { productId: products[1]._id, sku: 'WH-002', title: 'Wireless Noise-Canceling Headphones', quantity: 2, price: 199.99, total: 399.98 }
            ],
            shippingAddress: { firstName: 'Diana', lastName: 'Prince', address1: '789 Justice Blvd', city: 'Delhi', state: 'DL', zip: '110001', country: 'India' },
            subtotal: 399.98, taxTotal: 40.02, shippingTotal: 0.00, totalAmount: 440.00, currency: 'INR',
            paymentStatus: 'refunded', fulfillmentStatus: 'returned', itemsCount: 2,
            notes: 'Customer requested cancellation.',
            riskScore: 5, riskLevel: 'low',
            riskIndicators: [
                { indicator: 'CVV Check', severity: 'low', message: 'Card verification value (CVV) is correct.' }
            ],
            fraudStatus: 'approved'
        },
        {
            tenantId, storeId, orderNumber: 'ORD-1004',
            customerName: 'Eve Adams', customerEmail: 'eve@example.com',
            items: [
                { productId: products[3]._id, sku: 'CB-004', title: 'Organic Arabica Coffee Beans', quantity: 1, price: 18.00, total: 18.00 }
            ],
            shippingAddress: { firstName: 'Eve', lastName: 'Adams', address1: '321 Brew St', city: 'Pune', state: 'MH', zip: '411001', country: 'India' },
            subtotal: 18.00, taxTotal: 2.00, shippingTotal: 5.00, totalAmount: 25.00, currency: 'INR',
            paymentStatus: 'paid', fulfillmentStatus: 'unfulfilled', itemsCount: 1,
            riskScore: 42, riskLevel: 'medium',
            riskIndicators: [
                { indicator: 'Payment Attempts', severity: 'medium', message: 'Multiple checkout attempts (3 attempts) before a successful payment.' },
                { indicator: 'Billing Address Check', severity: 'low', message: 'Billing zip code matches the credit card registered address.' }
            ],
            fraudStatus: 'under_review'
        }
    ]);
    console.log(`✅ ${orders.length} Orders seeded.`);
    const ord1003 = orders.find(o => o.orderNumber === 'ORD-1003');
    if (ord1003) {
        const returns = await Return_1.Return.insertMany([
            {
                tenantId,
                storeId,
                orderId: ord1003._id,
                orderNumber: ord1003.orderNumber,
                customerName: ord1003.customerName,
                customerEmail: ord1003.customerEmail,
                items: [
                    {
                        productId: products[1]._id,
                        sku: 'WH-002',
                        title: 'Wireless Noise-Canceling Headphones',
                        quantity: 2,
                        price: 199.99,
                        reason: 'did_not_like',
                    }
                ],
                status: 'received',
                refundAmount: 399.98,
                notes: 'Customer returned as they wanted a different model.',
            }
        ]);
        console.log(`✅ ${returns.length} Returns seeded.`);
    }
    const segments = await CustomerSegment_1.CustomerSegment.insertMany([
        {
            tenantId,
            storeId,
            name: 'VIP Club',
            description: 'Customers who have spent ₹1,000 or more in total.',
            rules: [
                { field: 'totalSpent', operator: 'gte', value: 1000 }
            ]
        },
        {
            tenantId,
            storeId,
            name: 'Loyal Buyers',
            description: 'Customers who have placed 5 or more orders.',
            rules: [
                { field: 'ordersCount', operator: 'gte', value: 5 }
            ]
        },
        {
            tenantId,
            storeId,
            name: 'Inactive Accounts',
            description: 'Customer accounts set as inactive.',
            rules: [
                { field: 'status', operator: 'eq', value: 'inactive' }
            ]
        },
        {
            tenantId,
            storeId,
            name: 'New Signups',
            description: 'Newly registered customer accounts with no orders yet.',
            rules: [
                { field: 'ordersCount', operator: 'eq', value: 0 }
            ]
        },
        {
            tenantId,
            storeId,
            name: 'Wholesale Accounts',
            description: 'Customers tagged with the "wholesale" status.',
            rules: [
                { field: 'tags', operator: 'contains', value: 'wholesale' }
            ]
        }
    ]);
    console.log(`✅ ${segments.length} Customer Segments seeded.`);
    const inventoryItems = await InventoryItem_1.InventoryItem.insertMany([
        { tenantId: tenantId, storeId: storeId, sku: 'TSH-001', locationName: 'Main Warehouse', onHand: 150, available: 140, committed: 10, status: 'in_stock' },
        { tenantId: tenantId, storeId: storeId, sku: 'WH-002', locationName: 'Main Warehouse', onHand: 45, available: 45, committed: 0, status: 'in_stock' },
        { tenantId: tenantId, storeId: storeId, sku: 'OC-003', locationName: 'East Coast Hub', onHand: 12, available: 2, committed: 10, status: 'low_stock' },
        { tenantId: tenantId, storeId: storeId, sku: 'LW-005', locationName: 'Main Warehouse', onHand: 0, available: 0, committed: 0, status: 'out_of_stock' },
    ]);
    console.log(`✅ ${inventoryItems.length} Inventory Items seeded.`);
    const discounts = await Discount_1.Discount.insertMany([
        { tenantId: tenantId, storeId: storeId, code: 'SUMMER24', type: 'percentage', value: 20, status: 'active', usageCount: 45 },
        { tenantId: tenantId, storeId: storeId, code: 'FREESHIP', type: 'free_shipping', value: 0, status: 'active', usageCount: 120 },
        { tenantId: tenantId, storeId: storeId, code: 'WELCOME10', type: 'fixed_amount', value: 10, status: 'active', usageCount: 890 },
        { tenantId: tenantId, storeId: storeId, code: 'BFCM50', type: 'percentage', value: 50, status: 'scheduled', usageCount: 0 },
    ]);
    console.log(`✅ ${discounts.length} Discounts seeded.`);
    const apps = await AppPlugin_1.AppPlugin.insertMany([
        { tenantId: tenantId, storeId: storeId, name: 'ShipRocket India', developer: 'Jodo', version: '1.2.0', status: 'active', description: 'Automate shipping across India with multiple couriers.' },
        { tenantId: tenantId, storeId: storeId, name: 'Razorpay Checkout', developer: 'Razorpay', version: '2.0.1', status: 'active', description: 'Accept UPI, Cards, and NetBanking easily.' },
        { tenantId: tenantId, storeId: storeId, name: 'Mailchimp Sync', developer: 'Mailchimp', version: '3.1.5', status: 'installed', description: 'Sync customers and orders to Mailchimp lists.' },
        { tenantId: tenantId, storeId: storeId, name: 'Advanced SEO', developer: 'SEO Pro', version: '1.0.0', status: 'disabled', description: 'Automated SEO tag generation.' },
    ]);
    console.log(`✅ ${apps.length} Apps seeded.`);
    const reviews = await Review_1.Review.insertMany([
        {
            tenantId,
            storeId,
            productId: products[1]._id, // Headphones
            rating: 5,
            authorName: 'Sanjay Kumar',
            authorEmail: 'sanjay@example.com',
            title: 'Outstanding Sound Quality!',
            body: 'I have been using these noise-canceling headphones for a week now, and the sound isolation is incredibly clean. Battery life easily lasts 30 hours. Highly recommended!',
            status: 'approved',
        },
        {
            tenantId,
            storeId,
            productId: products[0]._id, // T-Shirt
            rating: 4,
            authorName: 'Rohan Sharma',
            authorEmail: 'rohan@example.com',
            title: 'Very comfortable, slightly loose fit',
            body: 'The fabric is extremely soft and breathable. Good for summers. It fits slightly looser than expected, but overall a great buy.',
            status: 'approved',
        },
        {
            tenantId,
            storeId,
            productId: products[2]._id, // Office Chair
            rating: 5,
            authorName: 'Priya Patel',
            authorEmail: 'priya@example.com',
            title: 'Saved my back during long work hours',
            body: 'Excellent lumbar support! Adjustable armrests and back tilt work perfectly. Very sturdy build.',
            status: 'pending',
        },
        {
            tenantId,
            storeId,
            productId: products[1]._id, // Headphones
            rating: 1,
            authorName: 'Spam Bot',
            authorEmail: 'spambot@marketing-spam.ru',
            title: 'CHEAP WATCHES ONLINE CLICK HERE',
            body: 'Buy replica watches for cheap prices on our storefront now, instant delivery guaranteed!',
            status: 'spam',
        },
        {
            tenantId,
            storeId,
            productId: products[3]._id, // Coffee Beans
            rating: 3,
            authorName: 'Amit Verma',
            authorEmail: 'amit@example.com',
            title: 'Decent aroma, bit dark roasted',
            body: 'The flavor profile is nice, but it was roasted slightly darker than expected. Good for strong espressos.',
            status: 'approved',
        },
    ]);
    console.log(`✅ ${reviews.length} Product Reviews seeded.\n`);
    // Seed AuditLogs
    const adminUser = await User_1.User.findOne({ email: SEED_EMAIL });
    if (adminUser) {
        await AuditLog_1.AuditLog.deleteMany({});
        await AuditLog_1.AuditLog.insertMany([
            {
                tenantId,
                storeId,
                actorUserId: adminUser._id,
                actorType: 'user',
                action: 'settings.update',
                resourceType: 'StoreSettings',
                resourceId: storeId.toString(),
                before: { name: 'My Old Store', defaultCurrency: 'USD' },
                after: { name: 'Jodo Commerce', defaultCurrency: 'INR' },
                ip: '127.0.0.1',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                createdAt: new Date(Date.now() - 3600000 * 2),
            },
            {
                tenantId,
                storeId,
                actorUserId: adminUser._id,
                actorType: 'user',
                action: 'product.create',
                resourceType: 'Product',
                resourceId: 'prod-999',
                before: {},
                after: { title: 'Premium Cotton T-Shirt', price: 29.99, sku: 'TSH-001' },
                ip: '127.0.0.1',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                createdAt: new Date(Date.now() - 3600000 * 24),
            },
            {
                tenantId,
                storeId,
                actorUserId: adminUser._id,
                actorType: 'user',
                action: 'auth.login',
                resourceType: 'Session',
                resourceId: 'session-1234',
                before: {},
                after: { email: SEED_EMAIL, device: 'MacBook Pro' },
                ip: '127.0.0.1',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                createdAt: new Date(Date.now() - 3600000 * 48),
            },
        ]);
        console.log('✅ Audit Logs seeded.\n');
    }
}
seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map