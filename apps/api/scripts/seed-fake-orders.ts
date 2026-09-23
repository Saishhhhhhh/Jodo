import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dvinternal_db_user:AyyDv3VXaXiZzGQ7@jodoadmin.cc8vtnj.mongodb.net/jodo_commerce?appName=jodoadmin';

async function seedFakeOrders() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const tenantId = new mongoose.Types.ObjectId('6a3e4098f6589e92a1e66ff3');
  const storeId = new mongoose.Types.ObjectId('6a3e4098f6589e92a1e66ff6');

  // Find products
  const products = await db.collection('products').find({}).toArray();
  const productMap = new Map();
  products.forEach(p => productMap.set(p.sku, p));

  const now = new Date();

  const fakeOrders = [
    {
      orderNumber: 'ORD-742918',
      customerName: 'Priya Sharma',
      customerEmail: 'priya.sharma@example.com',
      shippingAddress: {
        firstName: 'Priya',
        lastName: 'Sharma',
        address1: 'Flat 1403, Oberoi Exquisite, Goregaon East',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400063',
        country: 'India',
        phone: '+91 98201 44556',
      },
      items: [
        {
          sku: 'FURN-SOFA-01',
          title: 'Velvet Accent Sofa',
          quantity: 1,
          price: 1450,
        },
        {
          sku: 'FURN-CT-01',
          title: 'Glass Top Coffee Table',
          quantity: 1,
          price: 249,
        },
      ],
      paymentStatus: 'paid',
      fulfillmentStatus: 'unfulfilled',
      notes: 'Customer requested evening delivery after 6 PM.',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hrs ago
    },
    {
      orderNumber: 'ORD-851930',
      customerName: 'Arjun Mehta',
      customerEmail: 'arjun.mehta@example.com',
      shippingAddress: {
        firstName: 'Arjun',
        lastName: 'Mehta',
        address1: 'Villa 42, Prestige Golfshire, Nandi Hills Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        zip: '562110',
        country: 'India',
        phone: '+91 98450 12345',
      },
      items: [
        {
          sku: 'FURN-BED-01',
          title: 'Queen Size Platform Bed',
          quantity: 1,
          price: 599,
        },
        {
          sku: 'FURN-NS-01',
          title: 'Minimalist Nightstand',
          quantity: 2,
          price: 145,
        },
      ],
      paymentStatus: 'paid',
      fulfillmentStatus: 'fulfilled',
      fulfillments: [
        {
          carrier: 'BlueDart Express',
          trackingNumber: 'BD-982341908',
          trackingUrl: 'https://www.bluedart.com/tracking?track=BD-982341908',
          notifyCustomer: true,
          createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        },
      ],
      notes: 'Dispatched via express logistics partner.',
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hrs ago
    },
    {
      orderNumber: 'ORD-920471',
      customerName: 'Neha Kapoor',
      customerEmail: 'neha.kapoor@example.com',
      shippingAddress: {
        firstName: 'Neha',
        lastName: 'Kapoor',
        address1: 'C-45, Greater Kailash Part 1',
        city: 'Delhi',
        state: 'Delhi',
        zip: '110048',
        country: 'India',
        phone: '+91 98110 99887',
      },
      items: [
        {
          sku: 'FURN-DT-01',
          title: 'Modern Oak Dining Table',
          quantity: 1,
          price: 899,
        },
      ],
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
      notes: 'Cash on delivery / awaiting payment verification.',
      createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000), // 18 hrs ago
    },
    {
      orderNumber: 'ORD-638104',
      customerName: 'Vikram Reddy',
      customerEmail: 'vikram.reddy@example.com',
      shippingAddress: {
        firstName: 'Vikram',
        lastName: 'Reddy',
        address1: 'Tower 3, Apt 804, My Home Bhooja, HITEC City',
        city: 'Hyderabad',
        state: 'Telangana',
        zip: '500081',
        country: 'India',
        phone: '+91 99890 55443',
      },
      items: [
        {
          sku: 'FURN-OC-01',
          title: 'Ergonomic Office Chair',
          quantity: 2,
          price: 199.5,
        },
        {
          sku: 'FURN-BS-01',
          title: 'Industrial Bookshelf',
          quantity: 1,
          price: 349,
        },
      ],
      paymentStatus: 'paid',
      fulfillmentStatus: 'partial',
      notes: 'Partially shipped from Hyderabad regional hub.',
      createdAt: new Date(now.getTime() - 26 * 60 * 60 * 1000), // 1 day ago
    },
    {
      orderNumber: 'ORD-517829',
      customerName: 'Rajesh Kulkarni',
      customerEmail: 'rajesh.k@example.com',
      shippingAddress: {
        firstName: 'Rajesh',
        lastName: 'Kulkarni',
        address1: 'Row House 7, Panchshil Towers, Kharadi',
        city: 'Pune',
        state: 'Maharashtra',
        zip: '411014',
        country: 'India',
        phone: '+91 98900 11223',
      },
      items: [
        {
          sku: 'FURN-OUT-01',
          title: 'Outdoor Teak Lounge Chair',
          quantity: 2,
          price: 499,
        },
        {
          sku: 'FURN-TV-01',
          title: 'Mid-Century TV Stand',
          quantity: 1,
          price: 399,
        },
      ],
      paymentStatus: 'paid',
      fulfillmentStatus: 'unfulfilled',
      notes: 'Large item freight delivery needed.',
      createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
    },
  ];

  console.log(`Processing ${fakeOrders.length} fake orders...`);

  for (const o of fakeOrders) {
    // Check if order already exists
    const existing = await db.collection('orders').findOne({ storeId, orderNumber: o.orderNumber });
    if (existing) {
      console.log(`Order ${o.orderNumber} already exists. Skipping.`);
      continue;
    }

    // Build items with proper product IDs
    let subtotal = 0;
    let itemsCount = 0;
    const orderItems = o.items.map(item => {
      const prod = productMap.get(item.sku);
      const total = item.price * item.quantity;
      subtotal += total;
      itemsCount += item.quantity;
      return {
        _id: new mongoose.Types.ObjectId(),
        productId: prod ? prod._id : new mongoose.Types.ObjectId(),
        sku: item.sku,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        total,
      };
    });

    const orderDoc = {
      tenantId,
      storeId,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      items: orderItems,
      shippingAddress: {
        ...o.shippingAddress,
        _id: new mongoose.Types.ObjectId(),
      },
      subtotal,
      taxTotal: 0,
      shippingTotal: 0,
      totalAmount: subtotal,
      currency: 'INR',
      paymentStatus: o.paymentStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      itemsCount,
      riskScore: 0,
      riskLevel: 'low',
      fraudStatus: 'approved',
      status: 'open',
      fulfillments: o.fulfillments || [],
      riskIndicators: [],
      notes: o.notes || '',
      createdAt: o.createdAt,
      updatedAt: o.createdAt,
      __v: 0,
    };

    await db.collection('orders').insertOne(orderDoc);
    console.log(`✓ Inserted order ${o.orderNumber} (${o.customerName}, City: ${o.shippingAddress.city}, ₹${subtotal})`);

    // Upsert Customer
    await db.collection('customers').updateOne(
      { storeId, email: o.customerEmail },
      {
        $setOnInsert: {
          tenantId,
          storeId,
          firstName: o.shippingAddress.firstName,
          lastName: o.shippingAddress.lastName,
          email: o.customerEmail,
          phone: o.shippingAddress.phone,
          status: 'active',
          tags: ['online-order'],
          createdAt: o.createdAt,
        },
        $inc: { ordersCount: 1, totalSpent: subtotal },
        $set: {
          updatedAt: new Date(),
          defaultShippingAddress: o.shippingAddress,
        },
      },
      { upsert: true }
    );

    // Update reserved stock & stock movements for unfulfilled orders
    if (o.fulfillmentStatus === 'unfulfilled' || o.fulfillmentStatus === 'partial') {
      for (const item of orderItems) {
        const inv = await db.collection('inventoryitems').findOne({ storeId, sku: item.sku });
        if (inv) {
          const qtyToReserve = o.fulfillmentStatus === 'partial' ? 1 : item.quantity;
          const newReserved = (inv.reservedStock || 0) + qtyToReserve;
          const available = Math.max(0, inv.onHand - newReserved);
          let status = 'in_stock';
          if (available <= 0) status = 'out_of_stock';
          else if (available <= (inv.reorderLevel || 5)) status = 'low_stock';

          await db.collection('inventoryitems').updateOne(
            { _id: inv._id },
            { $set: { reservedStock: newReserved, available, status } }
          );

          await db.collection('stockmovements').insertOne({
            tenantId,
            storeId,
            sku: item.sku,
            movementType: 'Stock Reserved',
            quantity: -qtyToReserve,
            reference: o.orderNumber,
            reason: `Order ${o.orderNumber} placed by ${o.customerName}`,
            createdAt: o.createdAt,
          });
        }
      }
    }
  }

  console.log('Finished seeding 5 fake orders successfully!');
  await mongoose.disconnect();
}

seedFakeOrders().catch(err => {
  console.error('Error seeding orders:', err);
  process.exit(1);
});
