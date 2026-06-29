/**
 * Seed script — creates initial tenant, store, roles, and admin user.
 * Run: npm run seed
 *
 * Credentials seeded:
 *   Email: admin@jodo.dev
 *   Password: Admin@123456
 */

import '../config/env'; // Load env first
import { connectDB, disconnectDB } from '../config/db';
import { Tenant } from '../models/Tenant';
import { Store } from '../models/Store';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Customer } from '../models/Customer';
import { InventoryItem } from '../models/InventoryItem';
import { Discount } from '../models/Discount';
import { AppPlugin } from '../models/AppPlugin';
import { AuditLog } from '../models/AuditLog';
import { Review } from '../models/Review';
import { PERMISSIONS, SYSTEM_ROLES } from '@jodo/shared';

const SEED_EMAIL = process.env.ADMIN_SEED_EMAIL || 'admin@jodo.dev';
const SEED_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'Admin@123456';

async function seed() {
  console.log('🌱 Starting database seed...');
  await connectDB();

  // Check if already seeded base data
  const existingUser = await User.findOne({ email: SEED_EMAIL });
  if (existingUser) {
    console.log(`✅ Base auth data already seeded. Updating dummy data only...`);
    const tenant = await Tenant.findOne();
    const store = await Store.findOne({ tenantId: tenant?._id });
    if (tenant && store) {
      await seedDummyData(tenant._id, store._id);
    }
    await disconnectDB();
    return;
  }

  // 1. Create Tenant
  const tenant = await Tenant.create({
    name: 'Jodo Commerce',
    slug: 'jodo-commerce',
    plan: 'pro',
    status: 'active',
    billingEmail: SEED_EMAIL,
  });
  console.log(`✅ Tenant created: ${tenant.name} (${tenant._id})`);

  // 2. Create Store
  const store = await Store.create({
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
  const allPermissions = Object.values(PERMISSIONS);

  const ownerRole = await Role.create({
    tenantId: tenant._id,
    name: SYSTEM_ROLES.OWNER,
    description: 'Full access to everything',
    permissions: allPermissions,
    isSystemRole: true,
  });

  await Role.create({
    tenantId: tenant._id,
    name: SYSTEM_ROLES.ADMIN,
    description: 'Admin access — all except billing',
    permissions: allPermissions.filter((p) => p !== PERMISSIONS.MANAGE_BILLING),
    isSystemRole: true,
  });

  await Role.create({
    tenantId: tenant._id,
    name: SYSTEM_ROLES.STAFF,
    description: 'Operational staff — orders, products, customers',
    permissions: [
      PERMISSIONS.READ_PRODUCTS,
      PERMISSIONS.WRITE_PRODUCTS,
      PERMISSIONS.READ_ORDERS,
      PERMISSIONS.WRITE_ORDERS,
      PERMISSIONS.READ_CUSTOMERS,
      PERMISSIONS.READ_INVENTORY,
      PERMISSIONS.WRITE_INVENTORY,
      PERMISSIONS.READ_ANALYTICS,
    ],
    isSystemRole: true,
  });

  await Role.create({
    tenantId: tenant._id,
    name: SYSTEM_ROLES.VIEWER,
    description: 'Read-only access',
    permissions: [
      PERMISSIONS.READ_PRODUCTS,
      PERMISSIONS.READ_ORDERS,
      PERMISSIONS.READ_CUSTOMERS,
      PERMISSIONS.READ_ANALYTICS,
    ],
    isSystemRole: true,
  });

  console.log('✅ System roles created: owner, admin, staff, viewer');

  // 4. Create Admin User
  const adminUser = await User.create({
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
  await Tenant.findByIdAndUpdate(tenant._id, { ownerUserId: adminUser._id });

  console.log(`\n✅ Admin user created:`);
  console.log(`   Email:    ${SEED_EMAIL}`);
  console.log(`   Password: ${SEED_PASSWORD}`);
  console.log(`   Role:     ${SYSTEM_ROLES.OWNER}\n`);

  await seedDummyData(tenant._id, store._id);

  console.log('🎉 Seed completed successfully!');
  await disconnectDB();
}

async function seedDummyData(tenantId: any, storeId: any) {
  console.log('📦 Seeding dummy data...');

  // Clear existing
  await Product.deleteMany({});
  await Customer.deleteMany({});
  await Order.deleteMany({});
  await InventoryItem.deleteMany({});
  await Discount.deleteMany({});
  await AppPlugin.deleteMany({});
  await Review.deleteMany({});

  const products = await Product.insertMany([
    { tenantId: tenantId, storeId: storeId, title: 'Premium Cotton T-Shirt', slug: 'cotton-tshirt', status: 'active', price: 29.99, compareAtPrice: 39.99, sku: 'TSH-001', inventoryQuantity: 150, category: 'Apparel', vendor: 'Jodo Apparel', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&auto=format&fit=crop&q=60' },
    { tenantId: tenantId, storeId: storeId, title: 'Wireless Noise-Canceling Headphones', slug: 'wireless-headphones', status: 'active', price: 199.99, compareAtPrice: 249.99, sku: 'WH-002', inventoryQuantity: 45, category: 'Electronics', vendor: 'Jodo Audio', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=60' },
    { tenantId: tenantId, storeId: storeId, title: 'Ergonomic Office Chair', slug: 'office-chair', status: 'active', price: 149.50, sku: 'OC-003', inventoryQuantity: 12, category: 'Furniture', vendor: 'Jodo Living', imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=120&auto=format&fit=crop&q=60' },
    { tenantId: tenantId, storeId: storeId, title: 'Organic Arabica Coffee Beans', slug: 'coffee-beans', status: 'active', price: 18.00, sku: 'CB-004', inventoryQuantity: 300, category: 'Food & Beverage', vendor: 'Jodo Farms', imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=120&auto=format&fit=crop&q=60' },
    { tenantId: tenantId, storeId: storeId, title: 'Minimalist Leather Wallet', slug: 'leather-wallet', status: 'draft', price: 45.00, sku: 'LW-005', inventoryQuantity: 0, category: 'Accessories', vendor: 'Jodo Leather', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=120&auto=format&fit=crop&q=60' },
  ]);
  console.log(`✅ ${products.length} Products seeded.`);

  const customers = await Customer.insertMany([
    { tenantId: tenantId, storeId: storeId, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', ordersCount: 2, totalSpent: 125.00, status: 'active' },
    { tenantId: tenantId, storeId: storeId, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', ordersCount: 5, totalSpent: 850.50, status: 'active' },
    { tenantId: tenantId, storeId: storeId, firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', ordersCount: 0, totalSpent: 0, status: 'inactive' },
    { tenantId: tenantId, storeId: storeId, firstName: 'Diana', lastName: 'Prince', email: 'diana@example.com', ordersCount: 12, totalSpent: 2450.00, status: 'active' },
  ]);
  console.log(`✅ ${customers.length} Customers seeded.`);

  const orders = await Order.insertMany([
    { tenantId: tenantId, storeId: storeId, orderNumber: 'ORD-1001', customerName: 'Alice Smith', customerEmail: 'alice@example.com', totalAmount: 125.00, paymentStatus: 'paid', fulfillmentStatus: 'fulfilled', itemsCount: 3 },
    { tenantId: tenantId, storeId: storeId, orderNumber: 'ORD-1002', customerName: 'Bob Johnson', customerEmail: 'bob@example.com', totalAmount: 45.00, paymentStatus: 'pending', fulfillmentStatus: 'unfulfilled', itemsCount: 1 },
    { tenantId: tenantId, storeId: storeId, orderNumber: 'ORD-1003', customerName: 'Diana Prince', customerEmail: 'diana@example.com', totalAmount: 850.50, paymentStatus: 'refunded', fulfillmentStatus: 'returned', itemsCount: 2 },
    { tenantId: tenantId, storeId: storeId, orderNumber: 'ORD-1004', customerName: 'Eve Adams', customerEmail: 'eve@example.com', totalAmount: 199.99, paymentStatus: 'paid', fulfillmentStatus: 'unfulfilled', itemsCount: 1 },
  ]);
  console.log(`✅ ${orders.length} Orders seeded.`);

  const inventoryItems = await InventoryItem.insertMany([
    { tenantId: tenantId, storeId: storeId, sku: 'TSH-001', locationName: 'Main Warehouse', onHand: 150, available: 140, committed: 10, status: 'in_stock' },
    { tenantId: tenantId, storeId: storeId, sku: 'WH-002', locationName: 'Main Warehouse', onHand: 45, available: 45, committed: 0, status: 'in_stock' },
    { tenantId: tenantId, storeId: storeId, sku: 'OC-003', locationName: 'East Coast Hub', onHand: 12, available: 2, committed: 10, status: 'low_stock' },
    { tenantId: tenantId, storeId: storeId, sku: 'LW-005', locationName: 'Main Warehouse', onHand: 0, available: 0, committed: 0, status: 'out_of_stock' },
  ]);
  console.log(`✅ ${inventoryItems.length} Inventory Items seeded.`);

  const discounts = await Discount.insertMany([
    { tenantId: tenantId, storeId: storeId, code: 'SUMMER24', type: 'percentage', value: 20, status: 'active', usageCount: 45 },
    { tenantId: tenantId, storeId: storeId, code: 'FREESHIP', type: 'free_shipping', value: 0, status: 'active', usageCount: 120 },
    { tenantId: tenantId, storeId: storeId, code: 'WELCOME10', type: 'fixed_amount', value: 10, status: 'active', usageCount: 890 },
    { tenantId: tenantId, storeId: storeId, code: 'BFCM50', type: 'percentage', value: 50, status: 'scheduled', usageCount: 0 },
  ]);
  console.log(`✅ ${discounts.length} Discounts seeded.`);

  const apps = await AppPlugin.insertMany([
    { tenantId: tenantId, storeId: storeId, name: 'ShipRocket India', developer: 'Jodo', version: '1.2.0', status: 'active', description: 'Automate shipping across India with multiple couriers.' },
    { tenantId: tenantId, storeId: storeId, name: 'Razorpay Checkout', developer: 'Razorpay', version: '2.0.1', status: 'active', description: 'Accept UPI, Cards, and NetBanking easily.' },
    { tenantId: tenantId, storeId: storeId, name: 'Mailchimp Sync', developer: 'Mailchimp', version: '3.1.5', status: 'installed', description: 'Sync customers and orders to Mailchimp lists.' },
    { tenantId: tenantId, storeId: storeId, name: 'Advanced SEO', developer: 'SEO Pro', version: '1.0.0', status: 'disabled', description: 'Automated SEO tag generation.' },
  ]);
  console.log(`✅ ${apps.length} Apps seeded.`);

  const reviews = await Review.insertMany([
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
  const adminUser = await User.findOne({ email: SEED_EMAIL });
  if (adminUser) {
    await AuditLog.deleteMany({});
    await AuditLog.insertMany([
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
