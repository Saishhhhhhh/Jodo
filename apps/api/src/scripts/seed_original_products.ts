import '../config/env';
import { connectDB, disconnectDB } from '../config/db';
import { Product } from '../models/Product';
import { Tenant } from '../models/Tenant';
import { Store } from '../models/Store';
import { Collection } from '../models/Collection';
import { InventoryItem } from '../models/InventoryItem';

async function seed10Products() {
  console.log('🌱 Seeding exactly 10 products in admin and frontend...');
  await connectDB();

  const tenant = await Tenant.findOne();
  const store = await Store.findOne({ tenantId: tenant?._id });

  if (!tenant || !store) {
    console.error('❌ Base tenant/store not found.');
    await disconnectDB();
    return;
  }

  // 1. Clear existing products, inventory items, and collections
  console.log('🗑️ Clearing current products, inventory items, and collections...');
  await Product.deleteMany({});
  await InventoryItem.deleteMany({});
  await Collection.deleteMany({});

  // 2. Exactly 10 furniture products
  const exactly10Products = [
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Modern Oak Dining Table',
      slug: 'modern-oak-dining-table',
      status: 'active',
      price: 899.00,
      compareAtPrice: 1299.00,
      sku: 'FURN-DT-01',
      inventoryQuantity: 24,
      category: 'Dining Room',
      vendor: 'Jodo Living',
      imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop&q=80',
      material: 'Solid Oak Wood',
      dimensions: '72 x 36 x 30 inches',
      weight: 120.5,
      assemblyRequired: true,
      galleryImages: [
        'https://images.unsplash.com/photo-1617806118233-18e1c12e8467?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=1200&auto=format&fit=crop&q=80'
      ],
      productDetails: { 'Room Type': 'Dining Room' },
      tags: ['dining', 'table', 'oak', 'wood']
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Luxury Marble Dining Table',
      slug: 'luxury-marble-dining-table',
      status: 'active',
      price: 2499.00,
      compareAtPrice: 3199.00,
      sku: 'FURN-DT-02',
      inventoryQuantity: 10,
      category: 'Dining Room',
      vendor: 'Jodo Premium',
      imageUrl: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800&auto=format&fit=crop&q=80',
      material: 'Carrara Marble, Brass Base',
      dimensions: '84 x 42 x 30 inches',
      weight: 350.0,
      assemblyRequired: true,
      galleryImages: [
        'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=1200&auto=format&fit=crop&q=80'
      ],
      productDetails: { 'Room Type': 'Dining Room' },
      tags: ['dining', 'table', 'marble', 'luxury']
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Velvet Accent Sofa',
      slug: 'velvet-accent-sofa',
      status: 'active',
      price: 1450.00,
      compareAtPrice: 1950.00,
      sku: 'FURN-SOFA-01',
      inventoryQuantity: 14,
      category: 'Living Room',
      vendor: 'Plush Designs',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
      material: 'Velvet Fabric, Pine Wood Frame',
      dimensions: '84 x 35 x 32 inches',
      weight: 110.0,
      assemblyRequired: false,
      galleryImages: [
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80'
      ],
      productDetails: { 'Room Type': 'Living Room' },
      tags: ['sofa', 'living-room', 'velvet', 'seating']
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Mid-Century TV Stand',
      slug: 'mid-century-tv-stand',
      status: 'active',
      price: 399.00,
      compareAtPrice: 599.00,
      sku: 'FURN-TV-01',
      inventoryQuantity: 40,
      category: 'Living Room',
      vendor: 'RetroHome',
      imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=80',
      material: 'Walnut Veneer',
      dimensions: '60 x 16 x 22 inches',
      weight: 80.0,
      assemblyRequired: true,
      galleryImages: [
        'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=1200&auto=format&fit=crop&q=80'
      ],
      productDetails: { 'Room Type': 'Living Room' },
      tags: ['tv-stand', 'living-room', 'storage', 'mid-century']
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Industrial Bookshelf',
      slug: 'industrial-bookshelf',
      status: 'active',
      price: 349.00,
      compareAtPrice: 499.00,
      sku: 'FURN-BS-01',
      inventoryQuantity: 30,
      category: 'Living Room',
      vendor: 'IronCraft',
      imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&auto=format&fit=crop&q=80',
      material: 'Reclaimed Wood, Black Iron Pipes',
      dimensions: '48 x 12 x 72 inches',
      weight: 65.5,
      assemblyRequired: true,
      galleryImages: [
        'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80'
      ],
      productDetails: { 'Room Type': 'Living Room' },
      tags: ['bookshelf', 'storage', 'industrial', 'shelving']
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Glass Top Coffee Table',
      slug: 'glass-top-coffee-table',
      status: 'active',
      price: 249.00,
      compareAtPrice: 349.00,
      sku: 'FURN-CT-01',
      inventoryQuantity: 55,
      category: 'Living Room',
      vendor: 'ClearView',
      imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&auto=format&fit=crop&q=80',
      material: 'Tempered Glass, Chrome Base',
      dimensions: '40 x 40 x 18 inches',
      weight: 55.0,
      assemblyRequired: true,
      galleryImages: [
        'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80'
      ],
      productDetails: { 'Room Type': 'Living Room' },
      tags: ['coffee-table', 'table', 'glass', 'living-room']
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Queen Size Platform Bed',
      slug: 'queen-size-platform-bed',
      status: 'active',
      price: 599.00,
      compareAtPrice: 899.00,
      sku: 'FURN-BED-01',
      inventoryQuantity: 18,
      category: 'Bedroom',
      vendor: 'SleepWell',
      imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&auto=format&fit=crop&q=80',
      material: 'Upholstered Linen, Steel Frame',
      dimensions: '80 x 60 x 14 inches',
      weight: 75.0,
      assemblyRequired: true,
      galleryImages: [
        'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&auto=format&fit=crop&q=80'
      ],
      productDetails: { 'Room Type': 'Bedroom' },
      tags: ['bed', 'bedroom', 'platform-bed', 'furniture']
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Minimalist Nightstand',
      slug: 'minimalist-nightstand',
      status: 'active',
      price: 145.00,
      compareAtPrice: 199.00,
      sku: 'FURN-NS-01',
      inventoryQuantity: 45,
      category: 'Bedroom',
      vendor: 'Jodo Living',
      imageUrl: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&auto=format&fit=crop&q=80',
      material: 'Engineered Wood, Metal Hardware',
      dimensions: '18 x 15 x 24 inches',
      weight: 22.0,
      assemblyRequired: true,
      galleryImages: [
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=1200&auto=format&fit=crop&q=80'
      ],
      productDetails: { 'Room Type': 'Bedroom' },
      tags: ['nightstand', 'bedroom', 'storage', 'side-table']
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Ergonomic Office Chair',
      slug: 'ergonomic-office-chair',
      status: 'active',
      price: 199.50,
      compareAtPrice: 299.00,
      sku: 'FURN-OC-01',
      inventoryQuantity: 85,
      category: 'Office',
      vendor: 'ErgoMates',
      imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80',
      material: 'Mesh, Plastic, Metal Base',
      dimensions: '26 x 26 x 45 inches',
      weight: 35.0,
      assemblyRequired: true,
      galleryImages: [
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=1200&auto=format&fit=crop&q=80'
      ],
      productDetails: { 'Room Type': 'Office' },
      tags: ['chair', 'office', 'ergonomic', 'workspace']
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Outdoor Teak Lounge Chair',
      slug: 'outdoor-teak-lounge-chair',
      status: 'active',
      price: 499.00,
      compareAtPrice: 699.00,
      sku: 'FURN-OUT-01',
      inventoryQuantity: 20,
      category: 'Outdoor',
      vendor: 'Jodo Outdoors',
      imageUrl: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=800&auto=format&fit=crop&q=80',
      material: 'Grade A Teak Wood',
      dimensions: '30 x 35 x 34 inches',
      weight: 40.0,
      assemblyRequired: false,
      galleryImages: [
        'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop&q=80'
      ],
      productDetails: { 'Room Type': 'Outdoor' },
      tags: ['outdoor', 'lounge-chair', 'teak', 'patio']
    }
  ];

  const products = await Product.insertMany(exactly10Products);
  console.log(`✅ Exactly ${products.length} products seeded into MongoDB.`);

  // 3. Create inventory items for all 10 products
  const inventoryData = products.map((p) => ({
    tenantId: tenant._id,
    storeId: store._id,
    sku: p.sku,
    locationName: 'Main Warehouse',
    onHand: p.inventoryQuantity,
    available: p.inventoryQuantity,
    committed: 0,
    status: p.inventoryQuantity > 0 ? 'in_stock' : 'out_of_stock'
  }));
  await InventoryItem.insertMany(inventoryData);
  console.log(`✅ ${inventoryData.length} Inventory items synced in Admin Panel.`);

  // 4. Create collections matching these 10 products
  const diningProducts = products.filter(p => p.category === 'Dining Room').map(p => p._id);
  const livingProducts = products.filter(p => p.category === 'Living Room').map(p => p._id);
  const bedroomProducts = products.filter(p => p.category === 'Bedroom').map(p => p._id);
  const officeProducts = products.filter(p => p.category === 'Office').map(p => p._id);
  const outdoorProducts = products.filter(p => p.category === 'Outdoor').map(p => p._id);

  const collectionsData = [
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Dining Room',
      slug: 'dining-room',
      description: 'Solid wood and marble dining tables engineered for joyful daily meals.',
      imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=1200&auto=format&fit=crop&q=80',
      type: 'manual',
      products: diningProducts,
      status: 'active'
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Living Room',
      slug: 'living-room',
      description: 'Handcrafted velvet sofas, coffee tables, and bookshelves for living in comfort.',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80',
      type: 'manual',
      products: livingProducts,
      status: 'active'
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Bedroom',
      slug: 'bedroom',
      description: 'Platform beds and minimalist nightstands crafted for restful sleep.',
      imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200&auto=format&fit=crop&q=80',
      type: 'manual',
      products: bedroomProducts,
      status: 'active'
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Office',
      slug: 'office',
      description: 'Ergonomic seating and workspace furniture for productive days.',
      imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=1200&auto=format&fit=crop&q=80',
      type: 'manual',
      products: officeProducts,
      status: 'active'
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Outdoor',
      slug: 'outdoor',
      description: 'Weather-resistant teak lounge chairs for patios and balconies.',
      imageUrl: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=1200&auto=format&fit=crop&q=80',
      type: 'manual',
      products: outdoorProducts,
      status: 'active'
    }
  ];

  await Collection.insertMany(collectionsData);
  console.log(`✅ ${collectionsData.length} Collections created for the 10 products.`);

  await disconnectDB();
  console.log('🎉 Done! Exactly 10 products are active in the database and admin panel.');
}

seed10Products().catch((err) => {
  console.error('❌ Failed to seed 10 products:', err);
  process.exit(1);
});
