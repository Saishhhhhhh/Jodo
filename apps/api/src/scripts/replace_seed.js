const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, 'seed.ts');
let content = fs.readFileSync(seedFile, 'utf8');

const newProducts = `  const products = await Product.insertMany([
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
      title: 'Ergonomic Office Chair', slug: 'ergonomic-office-chair',
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
  ]);`;

// Replace products array
content = content.replace(/const products = await Product\.insertMany\(\[[\s\S]*?\]\);/, newProducts);

// Update Orders
content = content.replace(/'Premium Cotton T-Shirt'/g, "'Modern Oak Dining Table'");
content = content.replace(/'TSH-001'/g, "'FURN-DT-01'");
content = content.replace(/price: 29\.99, total: 89\.97/g, "price: 899.00, total: 2697.00");
content = content.replace(/subtotal: 89\.97/g, "subtotal: 2697.00");
content = content.replace(/totalAmount: 125\.00/g, "totalAmount: 2732.03"); // 2697 + 10.03 + 25

content = content.replace(/'Ergonomic Office Chair'/g, "'Velvet Accent Sofa'");
content = content.replace(/'OC-003'/g, "'FURN-SOFA-01'");
content = content.replace(/price: 149\.50, total: 149\.50/g, "price: 1450.00, total: 1450.00");
content = content.replace(/subtotal: 149\.50/g, "subtotal: 1450.00");
content = content.replace(/totalAmount: 165\.00/g, "totalAmount: 1465.50"); // 1450 + 15.50

content = content.replace(/'Wireless Noise-Canceling Headphones'/g, "'Ergonomic Office Chair'");
content = content.replace(/'WH-002'/g, "'FURN-OC-01'");
content = content.replace(/price: 199\.99, total: 399\.98/g, "price: 199.50, total: 399.00");
content = content.replace(/subtotal: 399\.98/g, "subtotal: 399.00");
content = content.replace(/totalAmount: 440\.00/g, "totalAmount: 439.02"); // 399.00 + 40.02

content = content.replace(/'Organic Arabica Coffee Beans'/g, "'Minimalist Nightstand'");
content = content.replace(/'CB-004'/g, "'FURN-NS-01'");
content = content.replace(/price: 18\.00, total: 18\.00/g, "price: 145.00, total: 145.00");
content = content.replace(/subtotal: 18\.00/g, "subtotal: 145.00");
content = content.replace(/totalAmount: 25\.00/g, "totalAmount: 152.00"); // 145 + 2 + 5

// Update Returns
content = content.replace(/refundAmount: 399\.98/g, "refundAmount: 399.00");

fs.writeFileSync(seedFile, content);
console.log('Seed file updated successfully.');
