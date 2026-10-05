import mongoose from 'mongoose';
import { Product } from './apps/api/src/models/Product';
import { Order } from './apps/api/src/models/Order';
import dotenv from 'dotenv';
dotenv.config({ path: './apps/api/.env' });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const p = await Product.findOne();
  
  const tenantId = p.tenantId;
  const storeId = p.storeId;

  await Order.create({
    tenantId,
    storeId,
    orderNumber: 'ORD-TEST-' + Date.now(),
    customerEmail: 'test@example.com',
    customerName: 'Priya Patel',
    customerPhone: '+919876543211',
    itemsCount: 2,
    items: [
      { productId: p._id, quantity: 2, price: 15000, title: 'Ergonomic Office Chair', sku: 'CHAIR-001', total: 30000 }
    ],
    totalAmount: 30000,
    status: 'open',
    paymentStatus: 'paid'
  });

  console.log('Order seeded successfully');
  process.exit(0);
}
seed();
