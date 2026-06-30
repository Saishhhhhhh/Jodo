import '../config/env';
import { connectDB, disconnectDB } from '../config/db';
import { Product } from '../models/Product';
import { Tenant } from '../models/Tenant';
import { Store } from '../models/Store';
import { Collection } from '../models/Collection';

async function seedCollections() {
  console.log('🌱 Starting collections seed...');
  await connectDB();

  const tenant = await Tenant.findOne();
  const store = await Store.findOne({ tenantId: tenant?._id });

  if (!tenant || !store) {
    console.error('❌ Base data not found. Please run npm run seed first.');
    await disconnectDB();
    return;
  }

  // Clear existing collections
  console.log('🗑️ Clearing existing collections...');
  await Collection.deleteMany({});

  // Get all products
  const products = await Product.find({ tenantId: tenant._id, storeId: store._id });
  if (products.length === 0) {
    console.error('❌ No products found. Please seed products first.');
    await disconnectDB();
    return;
  }

  // Group by category
  const categories: Record<string, string[]> = {};
  for (const product of products) {
    const cat = product.category;
    if (cat) {
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(product._id);
    }
  }

  const collectionData = [];
  
  const categoryImages: Record<string, string> = {
    'Dining Room': 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800&auto=format&fit=crop&q=80',
    'Office': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
    'Living Room': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
    'Bedroom': 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&auto=format&fit=crop&q=80',
    'Outdoor': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80'
  };

  for (const [catName, productIds] of Object.entries(categories)) {
    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    collectionData.push({
      tenantId: tenant._id,
      storeId: store._id,
      title: catName,
      slug: slug,
      description: `Shop our exclusive ${catName} furniture collection.`,
      imageUrl: categoryImages[catName] || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&auto=format&fit=crop&q=80',
      type: 'manual',
      products: productIds,
      status: 'active'
    });
  }

  await Collection.insertMany(collectionData);
  console.log(`✅ ${collectionData.length} Collections seeded successfully (matching the furniture products).`);
  
  await disconnectDB();
}

seedCollections().catch((err) => {
  console.error('❌ Collections Seed failed:', err);
  process.exit(1);
});
