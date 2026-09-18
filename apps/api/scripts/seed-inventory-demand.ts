import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from root or api folder
dotenv.config({ path: path.join(__dirname, '../.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, '../../../.env') });
}

import { Tenant } from '../src/models/Tenant';
import { Store } from '../src/models/Store';
import { InventoryItem } from '../src/models/InventoryItem';
import { Order } from '../src/models/Order';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const tenant = await Tenant.findOne();
    const store = await Store.findOne();

    if (!tenant || !store) {
      console.log('No tenant or store found.');
      process.exit(1);
    }

    const inventoryItems = await InventoryItem.find({
      tenantId: tenant._id,
      storeId: store._id,
    });

    if (inventoryItems.length === 0) {
      console.log('No inventory items found. Seed products first.');
      process.exit(1);
    }

    console.log(`Found ${inventoryItems.length} inventory items. Generating demand data...`);

    // Pick a few items to simulate 'Hot' and 'Steady' demand
    const hotItems = inventoryItems.slice(0, Math.min(3, inventoryItems.length));
    const steadyItems = inventoryItems.slice(3, Math.min(7, inventoryItems.length));

    let orderCount = Math.floor(Math.random() * 100000);
    const fakeOrders = [];
    const now = new Date();

    for (let i = 0; i < 70; i++) {
      const orderDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const orderItems = [];
      
      // 80% chance to buy a Hot item (higher quantity)
      if (Math.random() > 0.2 && hotItems.length > 0) {
        const item = hotItems[Math.floor(Math.random() * hotItems.length)];
        orderItems.push({
          productId: item._id, // using inventory item ID as placeholder
          sku: item.sku,
          title: `Simulated Hot Product (${item.sku})`,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: 50,
          total: 50
        });
      }

      // 60% chance to buy a Steady item (quantity 1)
      if (Math.random() > 0.4 && steadyItems.length > 0) {
        const item = steadyItems[Math.floor(Math.random() * steadyItems.length)];
        orderItems.push({
          productId: item._id,
          sku: item.sku,
          title: `Simulated Steady Product (${item.sku})`,
          quantity: 1,
          price: 20,
          total: 20
        });
      }

      if (orderItems.length === 0) continue;

      fakeOrders.push({
        tenantId: tenant._id,
        storeId: store._id,
        orderNumber: `ORD-DEMAND-${orderCount++}`,
        customerName: 'Fake Customer',
        customerEmail: 'fake@example.com',
        items: orderItems,
        subtotal: 100,
        taxTotal: 0,
        shippingTotal: 0,
        totalAmount: 100,
        currency: 'USD',
        paymentStatus: 'paid', // Must be paid to count towards velocity
        fulfillmentStatus: Math.random() > 0.85 ? 'unfulfilled' : 'fulfilled', // 15% unfulfilled to create 'committed' stock
        itemsCount: orderItems.length,
        createdAt: orderDate,
        updatedAt: orderDate,
        status: 'open'
      });
    }

    await Order.insertMany(fakeOrders);
    console.log(`Successfully inserted ${fakeOrders.length} fake past orders for demand simulation.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding demand data:', error);
    process.exit(1);
  }
}

seed();
