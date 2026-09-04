import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, '../../../.env') });
}

import { Tenant } from '../src/models/Tenant';
import { Store } from '../src/models/Store';
import { InventoryItem } from '../src/models/InventoryItem';
import { Product } from '../src/models/Product';

async function fix() {
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
    
    const products = await Product.find({
      tenantId: tenant._id,
      storeId: store._id,
    });
    
    const productSkus = new Set(products.map(p => p.sku));
    
    for (const item of inventoryItems) {
      if (!productSkus.has(item.sku)) {
        console.log(`Orphaned SKU found: ${item.sku}. Creating dummy product...`);
        await Product.create({
          tenantId: tenant._id,
          storeId: store._id,
          title: `Sample Product (${item.sku})`,
          slug: `sample-product-${item.sku.toLowerCase()}`,
          description: 'Automatically generated product to fix orphaned inventory.',
          sku: item.sku,
          price: 99.99,
          compareAtPrice: 129.99,
          costPerItem: 40.00,
          status: 'active',
          vendor: 'Jodo Supplies',
          category: 'General',
          tags: ['sample'],
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Generic product image
        });
        productSkus.add(item.sku);
      }
    }

    console.log('Fixed orphaned inventory items.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing orphaned items:', error);
    process.exit(1);
  }
}

fix();
