import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import QRCode from 'qrcode';

const SAMPLE_PRODUCTS = [
  {
    slug: 'premium-oak-chair',
    sku: 'CHAIR-OAK-001',
    name: 'Premium Oak Chair',
    category: 'Seating',
    description: 'A beautifully crafted premium oak chair with modern Scandinavian design. Features solid oak wood construction with a natural matte finish, ergonomic curved backrest, and hand-woven linen seat cushion. Perfect for dining rooms, living areas, and office spaces. Built to last with premium joinery techniques.',
    price: null,
    enquiryOnly: true,
    width: 52,
    height: 88,
    depth: 55,
    unit: 'cm',
    weight: 8.5,
    glbUrl: '/models/premium-oak-chair.glb',
    usdzUrl: '/models/premium-oak-chair.usdz',
    posterUrl: '/posters/premium-oak-chair.png',
    fileSizeMb: 4.2,
    images: ['/posters/premium-oak-chair.png'],
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: 'modern-coffee-table',
    sku: 'TABLE-COF-002',
    name: 'Modern Coffee Table',
    category: 'Tables',
    description: 'Elegant modern coffee table featuring a tempered glass top with solid walnut wood legs. The minimalist design combines contemporary aesthetics with exceptional durability. Features rounded edges for safety, adjustable foot pads, and a lower shelf for storage. Ideal for living rooms and lounge areas.',
    price: null,
    enquiryOnly: true,
    width: 120,
    height: 45,
    depth: 60,
    unit: 'cm',
    weight: 18,
    glbUrl: '/models/modern-coffee-table.glb',
    usdzUrl: '/models/modern-coffee-table.usdz',
    posterUrl: '/posters/modern-coffee-table.png',
    fileSizeMb: 5.8,
    images: ['/posters/modern-coffee-table.png'],
    isActive: true,
    sortOrder: 2,
  },
  {
    slug: 'luxury-bookshelf',
    sku: 'SHEL-LUX-003',
    name: 'Luxury Bookshelf',
    category: 'Storage',
    description: 'A stunning luxury bookshelf crafted from premium mahogany wood with brass accents. Features five spacious shelves with adjustable heights, integrated LED lighting, and a glass-door display section. The perfect statement piece for home libraries, offices, and living spaces.',
    price: null,
    enquiryOnly: true,
    width: 90,
    height: 200,
    depth: 35,
    unit: 'cm',
    weight: 42,
    glbUrl: '/models/luxury-bookshelf.glb',
    usdzUrl: '/models/luxury-bookshelf.usdz',
    posterUrl: '/posters/luxury-bookshelf.png',
    fileSizeMb: 7.1,
    images: ['/posters/luxury-bookshelf.png'],
    isActive: true,
    sortOrder: 3,
  },
  {
    slug: 'minimalist-desk-lamp',
    sku: 'LAMP-MIN-004',
    name: 'Minimalist Desk Lamp',
    category: 'Lighting',
    description: 'A sleek minimalist desk lamp with an adjustable articulated arm and warm LED light. Features a brushed brass finish, touch-sensitive dimmer control, wireless charging base, and a weighted non-slip base. Provides flicker-free lighting perfect for workspaces and reading nooks.',
    price: null,
    enquiryOnly: true,
    width: 25,
    height: 48,
    depth: 25,
    unit: 'cm',
    weight: 2.3,
    glbUrl: '/models/minimalist-desk-lamp.glb',
    usdzUrl: '/models/minimalist-desk-lamp.usdz',
    posterUrl: '/posters/minimalist-desk-lamp.png',
    fileSizeMb: 2.1,
    images: ['/posters/minimalist-desk-lamp.png'],
    isActive: true,
    sortOrder: 4,
  },
  {
    slug: 'designer-sofa',
    sku: 'SOFA-DES-005',
    name: 'Designer Sofa',
    category: 'Seating',
    description: 'A luxurious designer sofa with deep cushioning and premium Italian leather upholstery. Features a solid hardwood frame, high-density foam padding, and chrome-finished legs. The modular design allows for multiple configurations. Perfect for contemporary living rooms and executive lounges.',
    price: null,
    enquiryOnly: true,
    width: 220,
    height: 85,
    depth: 95,
    unit: 'cm',
    weight: 65,
    glbUrl: '/models/designer-sofa.glb',
    usdzUrl: '/models/designer-sofa.usdz',
    posterUrl: '/posters/designer-sofa.png',
    fileSizeMb: 9.4,
    images: ['/posters/designer-sofa.png'],
    isActive: true,
    sortOrder: 5,
  },
  {
    slug: 'ceramic-vase-set',
    sku: 'VASE-CER-006',
    name: 'Ceramic Vase Set',
    category: 'Decor',
    description: 'A beautiful set of three handmade ceramic vases in varying sizes with a matte terracotta finish. Each vase features unique organic shapes inspired by natural forms. The set creates a stunning display on shelves, tables, or mantels. Handcrafted by skilled artisans.',
    price: null,
    enquiryOnly: true,
    width: 30,
    height: 45,
    depth: 30,
    unit: 'cm',
    weight: 5.2,
    glbUrl: '/models/ceramic-vase-set.glb',
    usdzUrl: '/models/ceramic-vase-set.usdz',
    posterUrl: '/posters/ceramic-vase-set.png',
    fileSizeMb: 3.3,
    images: ['/posters/ceramic-vase-set.png'],
    isActive: true,
    sortOrder: 6,
  },
  {
    slug: 'thermos-hydration-bottle',
    sku: 'BOTTLE-THER-007',
    name: 'Thermos Hydration Bottle 24oz',
    category: 'Decor',
    description: 'Premium stainless steel Thermos hydration bottle with 24oz capacity. Features vacuum insulation technology that keeps drinks cold for 24 hours or hot for 12 hours. The leak-proof lid with built-in carrying loop makes it perfect for on-the-go hydration. Durable BPA-free construction with a sleek matte finish. Ideal for gym, office, outdoor adventures, and everyday use.',
    price: null,
    enquiryOnly: true,
    width: 7.5,
    height: 27,
    depth: 7.5,
    unit: 'cm',
    weight: 0.45,
    glbUrl: '/models/thermos-hydration-bottle.glb',
    usdzUrl: null,
    posterUrl: '/posters/thermos-hydration-bottle.png',
    fileSizeMb: 22,
    images: ['/posters/thermos-hydration-bottle.png'],
    isActive: true,
    sortOrder: 7,
  },
];

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force');
    
    // Check if products already exist
    const existingCount = await db.product.count();
    if (existingCount > 0 && !force) {
      // Check if thermos exists, add it if missing
      const thermosExists = await db.product.findFirst({ where: { slug: 'thermos-hydration-bottle' } });
      if (!thermosExists) {
        const thermos = SAMPLE_PRODUCTS.find(p => p.slug === 'thermos-hydration-bottle');
        if (thermos) {
          await db.product.create({
            data: { ...thermos, images: JSON.stringify(thermos.images) },
          });
        }
        return NextResponse.json({ message: 'Thermos product added', count: existingCount + 1 });
      }
      return NextResponse.json({ message: 'Products already seeded', count: existingCount });
    }

    let createdCount = 0;

    for (const product of SAMPLE_PRODUCTS) {
      // Skip if already exists (for force mode)
      if (force) {
        const exists = await db.product.findFirst({ where: { slug: product.slug } });
        if (exists) continue;
      }
      await db.product.create({
        data: {
          ...product,
          images: JSON.stringify(product.images),
        },
      });
      createdCount++;
    }

    return NextResponse.json({ message: `Seeded ${createdCount} products successfully` });
  } catch (error) {
    console.error('Error seeding products:', error);
    return NextResponse.json({ error: 'Failed to seed products' }, { status: 500 });
  }
}
