import '../config/env';
import { connectDB, disconnectDB } from '../config/db';
import { Product } from '../models/Product';
import { Tenant } from '../models/Tenant';
import { Store } from '../models/Store';
import { Review } from '../models/Review';
import { Return } from '../models/Return';

async function seedFurniture() {
  console.log('🌱 Starting furniture seed...');
  await connectDB();

  const tenant = await Tenant.findOne();
  const store = await Store.findOne({ tenantId: tenant?._id });

  if (!tenant || !store) {
    console.error('❌ Base data not found. Please run npm run seed first.');
    await disconnectDB();
    return;
  }

  // Clear existing products, reviews and returns related to them
  console.log('🗑️ Clearing existing products and related data...');
  await Product.deleteMany({});
  await Review.deleteMany({});
  await Return.deleteMany({});

  const furnitureProducts = [
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Modern Oak Dining Table',
      slug: 'modern-oak-dining-table',
      status: 'active',
      price: 899.00,
      compareAtPrice: 1200.00,
      sku: 'FURN-DT-01',
      inventoryQuantity: 24,
      category: 'Dining Room',
      vendor: 'Jodo Living',
      imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop&q=80',
      material: 'Solid Oak Wood',
      dimensions: '72 x 36 x 30 inches',
      weight: 120.5,
      assemblyRequired: true,
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Ergonomic Office Chair',
      slug: 'ergonomic-office-chair',
      status: 'active',
      price: 199.50,
      compareAtPrice: 249.00,
      sku: 'FURN-OC-01',
      inventoryQuantity: 85,
      category: 'Office',
      vendor: 'ErgoMates',
      imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80',
      material: 'Mesh, Plastic, Metal Base',
      dimensions: '26 x 26 x 45 inches',
      weight: 35.0,
      assemblyRequired: true,
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Velvet Accent Sofa',
      slug: 'velvet-accent-sofa',
      status: 'active',
      price: 1450.00,
      compareAtPrice: 1800.00,
      sku: 'FURN-SOFA-01',
      inventoryQuantity: 10,
      category: 'Living Room',
      vendor: 'Plush Designs',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
      material: 'Velvet Fabric, Pine Wood Frame',
      dimensions: '84 x 35 x 32 inches',
      weight: 110.0,
      assemblyRequired: false,
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
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Queen Size Platform Bed',
      slug: 'queen-size-platform-bed',
      status: 'active',
      price: 599.00,
      compareAtPrice: 750.00,
      sku: 'FURN-BED-01',
      inventoryQuantity: 15,
      category: 'Bedroom',
      vendor: 'SleepWell',
      imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&auto=format&fit=crop&q=80',
      material: 'Upholstered Linen, Steel Frame',
      dimensions: '80 x 60 x 14 inches',
      weight: 75.0,
      assemblyRequired: true,
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Industrial Bookshelf',
      slug: 'industrial-bookshelf',
      status: 'active',
      price: 349.00,
      sku: 'FURN-BS-01',
      inventoryQuantity: 30,
      category: 'Living Room',
      vendor: 'IronCraft',
      imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&auto=format&fit=crop&q=80',
      material: 'Reclaimed Wood, Black Iron Pipes',
      dimensions: '48 x 12 x 72 inches',
      weight: 65.5,
      assemblyRequired: true,
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Outdoor Teak Lounge Chair',
      slug: 'outdoor-teak-lounge-chair',
      status: 'active',
      price: 499.00,
      sku: 'FURN-OUT-01',
      inventoryQuantity: 20,
      category: 'Outdoor',
      vendor: 'Jodo Outdoors',
      imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop&q=80',
      ],
      material: 'Grade A Teak Wood',
      dimensions: '30 x 35 x 34 inches',
      weight: 40.0,
      assemblyRequired: false,
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Glass Top Coffee Table',
      slug: 'glass-top-coffee-table',
      status: 'active',
      price: 249.00,
      sku: 'FURN-CT-01',
      inventoryQuantity: 55,
      category: 'Living Room',
      vendor: 'ClearView',
      imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&auto=format&fit=crop&q=80',
      material: 'Tempered Glass, Chrome Base',
      dimensions: '40 x 40 x 18 inches',
      weight: 55.0,
      assemblyRequired: true,
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Mid-Century TV Stand',
      slug: 'mid-century-tv-stand',
      status: 'active',
      price: 399.00,
      sku: 'FURN-TV-01',
      inventoryQuantity: 40,
      category: 'Living Room',
      vendor: 'RetroHome',
      imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=80',
      material: 'Walnut Veneer',
      dimensions: '60 x 16 x 22 inches',
      weight: 80.0,
      assemblyRequired: true,
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Luxury Marble Dining Table',
      slug: 'luxury-marble-dining-table',
      status: 'draft',
      price: 2499.00,
      sku: 'FURN-DT-02',
      inventoryQuantity: 0,
      category: 'Dining Room',
      vendor: 'Jodo Premium',
      imageUrl: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800&auto=format&fit=crop&q=80',
      material: 'Carrara Marble, Brass Base',
      dimensions: '84 x 42 x 30 inches',
      weight: 350.0,
      assemblyRequired: true,
    }
  ];

  await Product.insertMany(furnitureProducts);
  console.log(`✅ ${furnitureProducts.length} Furniture Products seeded successfully.`);
  await disconnectDB();
}

seedFurniture().catch((err) => {
  console.error('❌ Furniture Seed failed:', err);
  process.exit(1);
});
