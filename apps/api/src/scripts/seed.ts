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
import { Return } from '../models/Return';
import { CustomerSegment } from '../models/CustomerSegment';
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
  await Return.deleteMany({});
  await CustomerSegment.deleteMany({});

    const products = await Product.insertMany([
    {
      tenantId, storeId,
      title: 'Modern Oak Dining Table', slug: 'modern-oak-dining-table',
      status: 'active', price: 899.00, compareAtPrice: 1200.00,
      sku: 'FURN-DT-01', inventoryQuantity: 24, category: 'Dining Room',
      vendor: 'Jodo Living',
      imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1617806118233-18e1c12e8467?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=1200&auto=format&fit=crop&q=80'
      ],
      model3dUrl: '/models/modern-oak-dining-table.glb',
      material: 'Solid Oak Wood', dimensions: '72 x 36 x 30 inches',
      weight: 120.5, assemblyRequired: true,
      shortDescription: 'A beautiful oak dining table for family dinners.'
    },
    {
      tenantId, storeId,
      title: 'Velvet Accent Sofa', slug: 'ergonomic-office-chair',
      status: 'active', price: 199.50, compareAtPrice: 249.00,
      sku: 'FURN-OC-01', inventoryQuantity: 85, category: 'Office',
      vendor: 'ErgoMates',
      imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=1200&auto=format&fit=crop&q=80'
      ],
      model3dUrl: '/models/ergonomic-office-chair.glb',
      material: 'Mesh, Plastic, Metal Base', dimensions: '26 x 26 x 45 inches',
      weight: 35.0, assemblyRequired: true,
      shortDescription: 'Stay comfortable all day with this ergonomic office chair.'
    },
    {
      tenantId, storeId,
      title: 'Velvet Accent Sofa', slug: 'velvet-accent-sofa',
      status: 'active', price: 1450.00, compareAtPrice: 1800.00,
      sku: 'FURN-SOFA-01', inventoryQuantity: 10, category: 'Living Room',
      vendor: 'Plush Designs',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80'
      ],
      model3dUrl: '/models/velvet-accent-sofa.glb',
      material: 'Velvet Fabric, Pine Wood Frame', dimensions: '84 x 35 x 32 inches',
      weight: 110.0, assemblyRequired: false,
      shortDescription: 'Add a touch of elegance with this plush velvet sofa.'
    },
    {
      tenantId, storeId,
      title: 'Minimalist Nightstand', slug: 'minimalist-nightstand',
      status: 'active', price: 145.00, compareAtPrice: 199.00,
      sku: 'FURN-NS-01', inventoryQuantity: 45, category: 'Bedroom',
      vendor: 'Jodo Living',
      imageUrl: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=1200&auto=format&fit=crop&q=80'
      ],
      model3dUrl: '/models/minimalist-nightstand.glb',
      material: 'Engineered Wood, Metal Hardware', dimensions: '18 x 15 x 24 inches',
      weight: 22.0, assemblyRequired: true,
      shortDescription: 'Keep essentials close at hand with this minimalist piece.'
    },
    {
      tenantId, storeId,
      title: 'Queen Size Platform Bed', slug: 'queen-size-platform-bed',
      status: 'active', price: 599.00, compareAtPrice: 750.00,
      sku: 'FURN-BED-01', inventoryQuantity: 15, category: 'Bedroom',
      vendor: 'SleepWell',
      imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&auto=format&fit=crop&q=80'
      ],
      model3dUrl: '/models/queen-size-platform-bed.glb',
      material: 'Upholstered Linen, Steel Frame', dimensions: '80 x 60 x 14 inches',
      weight: 75.0, assemblyRequired: true,
      shortDescription: 'Rest peacefully on this sturdy platform bed.'
    },
    {
      tenantId, storeId,
      title: 'Industrial Bookshelf', slug: 'industrial-bookshelf',
      status: 'active', price: 349.00, compareAtPrice: 450.00,
      sku: 'FURN-BS-01', inventoryQuantity: 30, category: 'Living Room',
      vendor: 'IronCraft',
      imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80'
      ],
      model3dUrl: '/models/industrial-bookshelf.glb',
      material: 'Reclaimed Wood, Black Iron Pipes', dimensions: '48 x 12 x 72 inches',
      weight: 65.5, assemblyRequired: true,
      shortDescription: 'Showcase your library on this durable bookshelf.'
    },
    {
      tenantId, storeId,
      title: 'Outdoor Teak Lounge Chair', slug: 'outdoor-teak-lounge-chair',
      status: 'active', price: 499.00, compareAtPrice: 650.00,
      sku: 'FURN-OUT-01', inventoryQuantity: 20, category: 'Outdoor',
      vendor: 'Jodo Outdoors',
      imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&auto=format&fit=crop&q=80'
      ],
      model3dUrl: '/models/outdoor-teak-lounge-chair.glb',
      material: 'Grade A Teak Wood', dimensions: '30 x 35 x 34 inches',
      weight: 40.0, assemblyRequired: false,
      shortDescription: 'Relax outdoors on this weather-resistant chair.'
    },
    {
      tenantId, storeId,
      title: 'Glass Top Coffee Table', slug: 'glass-top-coffee-table',
      status: 'active', price: 249.00, compareAtPrice: 350.00,
      sku: 'FURN-CT-01', inventoryQuantity: 55, category: 'Living Room',
      vendor: 'ClearView',
      imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80'
      ],
      model3dUrl: '/models/glass-top-coffee-table.glb',
      material: 'Tempered Glass, Chrome Base', dimensions: '40 x 40 x 18 inches',
      weight: 55.0, assemblyRequired: true,
      shortDescription: 'A sleek coffee table that makes any room feel larger.'
    },
    {
      tenantId, storeId,
      title: 'Mid-Century TV Stand', slug: 'mid-century-tv-stand',
      status: 'active', price: 399.00, compareAtPrice: 500.00,
      sku: 'FURN-TV-01', inventoryQuantity: 40, category: 'Living Room',
      vendor: 'RetroHome',
      imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=1200&auto=format&fit=crop&q=80'
      ],
      model3dUrl: '/models/mid-century-tv-stand.glb',
      material: 'Walnut Veneer', dimensions: '60 x 16 x 22 inches',
      weight: 80.0, assemblyRequired: true,
      shortDescription: 'The perfect focal point for your entertainment center.'
    },
    {
      tenantId, storeId,
      title: 'Luxury Marble Dining Table', slug: 'luxury-marble-dining-table',
      status: 'active', price: 2499.00, compareAtPrice: 3000.00,
      sku: 'FURN-DT-02', inventoryQuantity: 5, category: 'Dining Room',
      vendor: 'Jodo Premium',
      imageUrl: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=1200&auto=format&fit=crop&q=80'
      ],
      model3dUrl: '/models/luxury-marble-dining-table.glb',
      material: 'Carrara Marble, Brass Base', dimensions: '84 x 42 x 30 inches',
      weight: 350.0, assemblyRequired: true,
      shortDescription: 'Make a statement with this premium dining table.'
    }
  ]);
  console.log(`✅ ${products.length} Products seeded.`);

  const customers = await Customer.insertMany([
    { tenantId: tenantId, storeId: storeId, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', ordersCount: 2, totalSpent: 125.00, status: 'active', tags: ['local'] },
    { tenantId: tenantId, storeId: storeId, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', ordersCount: 5, totalSpent: 850.50, status: 'active', tags: ['wholesale', 'vip'] },
    { tenantId: tenantId, storeId: storeId, firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', ordersCount: 0, totalSpent: 0, status: 'inactive', tags: [] },
    { tenantId: tenantId, storeId: storeId, firstName: 'Diana', lastName: 'Prince', email: 'diana@example.com', ordersCount: 12, totalSpent: 2450.00, status: 'active', tags: ['vip'] },
  ]);
  console.log(`✅ ${customers.length} Customers seeded.`);

  const orders = await Order.insertMany([
    {
      tenantId, storeId, orderNumber: 'ORD-1001',
      customerName: 'Alice Smith', customerEmail: 'alice@example.com',
      items: [
        { productId: products[0]._id, sku: 'FURN-DT-01', title: 'Modern Oak Dining Table', quantity: 3, price: 899.00, total: 2697.00 }
      ],
      shippingAddress: { firstName: 'Alice', lastName: 'Smith', address1: '123 Fashion Ave', city: 'Mumbai', state: 'MH', zip: '400001', country: 'India' },
      subtotal: 2697.00, taxTotal: 10.03, shippingTotal: 25.00, totalAmount: 2732.03, currency: 'INR',
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
        { productId: products[2]._id, sku: 'FURN-SOFA-01', title: 'Velvet Accent Sofa', quantity: 1, price: 1450.00, total: 1450.00 }
      ],
      shippingAddress: { firstName: 'Bob', lastName: 'Johnson', address1: '456 Tech Park', city: 'Bengaluru', state: 'KA', zip: '560001', country: 'India' },
      subtotal: 1450.00, taxTotal: 15.50, shippingTotal: 0.00, totalAmount: 1465.50, currency: 'INR',
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
        { productId: products[1]._id, sku: 'FURN-OC-01', title: 'Ergonomic Office Chair', quantity: 2, price: 199.50, total: 399.00 }
      ],
      shippingAddress: { firstName: 'Diana', lastName: 'Prince', address1: '789 Justice Blvd', city: 'Delhi', state: 'DL', zip: '110001', country: 'India' },
      subtotal: 399.00, taxTotal: 40.02, shippingTotal: 0.00, totalAmount: 439.02, currency: 'INR',
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
        { productId: products[3]._id, sku: 'FURN-NS-01', title: 'Minimalist Nightstand', quantity: 1, price: 145.00, total: 145.00 }
      ],
      shippingAddress: { firstName: 'Eve', lastName: 'Adams', address1: '321 Brew St', city: 'Pune', state: 'MH', zip: '411001', country: 'India' },
      subtotal: 145.00, taxTotal: 2.00, shippingTotal: 5.00, totalAmount: 152.00, currency: 'INR',
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
    const returns = await Return.insertMany([
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
            sku: 'FURN-OC-01',
            title: 'Ergonomic Office Chair',
            quantity: 2,
            price: 199.99,
            reason: 'did_not_like',
          }
        ],
        status: 'received',
        refundAmount: 399.00,
        notes: 'Customer returned as they wanted a different model.',
      }
    ]);
    console.log(`✅ ${returns.length} Returns seeded.`);
  }

  const segments = await CustomerSegment.insertMany([
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

  const inventoryItems = await InventoryItem.insertMany([
    { tenantId: tenantId, storeId: storeId, sku: 'FURN-DT-01', locationName: 'Main Warehouse', onHand: 150, available: 140, committed: 10, status: 'in_stock' },
    { tenantId: tenantId, storeId: storeId, sku: 'FURN-OC-01', locationName: 'Main Warehouse', onHand: 45, available: 45, committed: 0, status: 'in_stock' },
    { tenantId: tenantId, storeId: storeId, sku: 'FURN-SOFA-01', locationName: 'East Coast Hub', onHand: 12, available: 2, committed: 10, status: 'low_stock' },
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
        after: { title: 'Modern Oak Dining Table', price: 29.99, sku: 'FURN-DT-01' },
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
