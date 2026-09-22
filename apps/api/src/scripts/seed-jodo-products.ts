import '../config/env';
import { connectDB, disconnectDB } from '../config/db';
import { Tenant } from '../models/Tenant';
import { Store } from '../models/Store';
import { Product } from '../models/Product';
import { InventoryItem } from '../models/InventoryItem';
import { Collection } from '../models/Collection';
import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { AiContent } from '../models/AiContent';
import { AiContentVersion } from '../models/AiContentVersion';
import { AiContentActivity } from '../models/AiContentActivity';

async function seedJodoProducts() {
  console.log('🚀 Connecting to database to seed JODO furniture products...');
  await connectDB();

  let tenant = await Tenant.findOne();
  if (!tenant) {
    tenant = await Tenant.create({
      name: 'JODO Living',
      slug: 'jodo-living',
      plan: 'pro',
      status: 'active',
      billingEmail: 'admin@jodo.dev',
    });
  }

  let store = await Store.findOne({ tenantId: tenant._id });
  if (!store) {
    store = await Store.create({
      tenantId: tenant._id,
      name: 'JODO Online Store',
      slug: 'jodo-store',
      defaultCurrency: 'INR',
      defaultCountry: 'IN',
      timezone: 'Asia/Kolkata',
      status: 'active',
    });
  }

  console.log(`Tenant: ${tenant.name} (${tenant._id}), Store: ${store.name} (${store._id})`);

  // 1. CLEAR ALL PREVIOUS PRODUCTS AND RELATED RECORDS
  console.log('🧹 Clearing old products, inventory items, reviews, collections, orders, and ai-content...');
  await Product.deleteMany({});
  await InventoryItem.deleteMany({});
  await Review.deleteMany({});
  await Collection.deleteMany({});
  await Order.deleteMany({});
  await AiContent.deleteMany({});
  await AiContentVersion.deleteMany({});
  await AiContentActivity.deleteMany({});

  // 2. 10 AUTHENTIC JODO FURNITURE PRODUCTS
  const jodoProducts = [
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Ananta Solid Sheesham 6-Seater Dining Table',
      slug: 'ananta-6-seater-dining-table',
      status: 'active' as const,
      price: 28999,
      compareAtPrice: 34999,
      sku: 'JD-DT-ANA-006',
      inventoryQuantity: 24,
      category: 'Dining Room',
      vendor: 'JODO',
      imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=1200&q=80'
      ],
      material: 'Solid Sheesham Wood',
      dimensions: '150 x 90 x 76 cm',
      weight: 38,
      assemblyRequired: true,
      assemblyFee: 0,
      shortDescription: 'The Ananta Solid Sheesham 6-Seater Dining Table combines thoughtful manufacturing and functional design, crafted from genuine solid Sheesham with a warm honey walnut finish.',
      longDescription: `### Introduction
The Ananta Solid Sheesham 6-Seater Dining Table brings the true essence of JODO's philosophy: "The Joy of Together." Thoughtfully manufactured in our own workshop, it is designed to turn dining and daily conversations into an anchor of family togetherness.

### Design & Function
With balanced proportions seating six adults comfortably, it features solid timber joinery, eased table edges for comfort, and reinforced corner brackets engineered for enduring stability.

### Material & Finish
Meticulously crafted from kiln-seasoned Indian Sheesham wood. The warm walnut honey finish highlights authentic grain patterns while guarding against daily dining spills.

### Assembly
Designed for straightforward post-delivery assembly. Includes pre-drilled precision fittings, high-tensile Allen bolts, and an assembly wrench. Setup takes under 15 minutes.`,
      careAndMaintenance: 'Wipe with a soft, slightly damp cloth. Use placemats for hot cookware. Avoid harsh solvent cleaners.',
      warrantyTerms: '1 Year Manufacturer Warranty against structural defects',
      specifications: [
        { key: 'Seating Capacity', value: '6 Persons' },
        { key: 'Primary Material', value: 'Solid Sheesham Wood' },
        { key: 'Finish', value: 'Warm Walnut Honey' },
        { key: 'Dimensions', value: '150 cm (L) x 90 cm (W) x 76 cm (H)' },
        { key: 'Assembly', value: 'DIY / Self-Assembly (Hardware Included)' },
        { key: 'Brand & Origin', value: 'JODO, Made in India' },
      ],
      tags: ['dining', 'sheesham', '6-seater', 'solid wood', 'togetherness', 'easy assembly'],
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Aurelia Minimalist Teak Armchair',
      slug: 'aurelia-minimalist-teak-armchair',
      status: 'active' as const,
      price: 24999,
      compareAtPrice: 29999,
      sku: 'JD-CHR-AUR-001',
      inventoryQuantity: 18,
      category: 'Living Room',
      vendor: 'JODO',
      imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80'
      ],
      material: 'Kiln-Dried Burma Teakwood & Bouclé Fabric',
      dimensions: '82 x 78 x 75 cm',
      weight: 16,
      assemblyRequired: true,
      assemblyFee: 0,
      shortDescription: 'Open-frame minimalist armchair handcrafted in kiln-dried teakwood with textured oatmeal bouclé upholstery.',
      longDescription: `### Introduction
The Aurelia Armchair reflects quiet, modern Indian warmth. Handcrafted from solid Burma teakwood and upholstered in rich textured bouclé, it delivers an inviting seat for reading or conversation.

### Design & Craftsmanship
Its sculptural open-frame design allows air and light to circulate, creating an airy feel even in compact living rooms. Mortise-and-tenon joints ensure generational durability.

### Assembly
Engineered with interlocking sub-frames for effortless post-delivery setup. Comes with step-by-step instructions and all needed fittings.`,
      careAndMaintenance: 'Vacuum fabric gently with an upholstery attachment. Dust wooden frame with a clean dry microfiber cloth.',
      warrantyTerms: '3 Year Structural Warranty',
      specifications: [
        { key: 'Frame', value: 'Solid Kiln-Dried Burma Teak' },
        { key: 'Upholstery', value: 'Oatmeal Bouclé Fabric' },
        { key: 'Dimensions', value: '82 cm (W) x 78 cm (D) x 75 cm (H)' },
        { key: 'Seating Height', value: '44 cm' },
        { key: 'Assembly', value: 'Easy Self-Assembly' }
      ],
      tags: ['armchair', 'living room', 'teak', 'boucle', 'warmth', 'minimalist'],
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Nordic Oak Floating Platform Bedframe (King Size)',
      slug: 'nordic-oak-floating-bedframe',
      status: 'active' as const,
      price: 48999,
      compareAtPrice: 56999,
      sku: 'JD-BED-NOR-004',
      inventoryQuantity: 12,
      category: 'Bedroom',
      vendor: 'JODO',
      imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
      ],
      material: 'American White Oak & Birch Slats',
      dimensions: '205 x 185 x 85 cm',
      weight: 62,
      assemblyRequired: true,
      assemblyFee: 0,
      shortDescription: 'Japanese-Nordic cantilevered platform king bed with solid oak perimeter and acoustic-dampened birch support slats.',
      longDescription: `### Introduction
The Nordic Oak Floating Bedframe is an architectural focal point designed for restful bedrooms. A recessed pedestal base gives the frame a light, floating appearance.

### Thoughtful Manufacturing
Precision-milled from certified American White Oak with integrated acoustic-dampened birch slats that absorb motion and support any standard king mattress without a box spring.

### Easy Assembly
Designed with heavy-duty modular slot-in hardware. Side rails lock firmly into the headboard and footboard in minutes.`,
      careAndMaintenance: 'Wipe down with a dry or slightly damp lint-free cloth. Do not use chemical abrasive powders.',
      warrantyTerms: '5 Year Structural Warranty',
      specifications: [
        { key: 'Bed Size', value: 'King (Fits 180 x 200 cm mattress)' },
        { key: 'Material', value: 'American White Oak & Birch Slat Foundation' },
        { key: 'Finish', value: 'Blond Matte Lacquer' },
        { key: 'Load Capacity', value: '450 kg' },
        { key: 'Assembly', value: 'Modular Slot-and-Lock' }
      ],
      tags: ['bed', 'bedroom', 'oak', 'floating bed', 'platform bed', 'easy assembly'],
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Aarambh Solid Teak Study Desk with Cable Management',
      slug: 'aarambh-solid-teak-study-desk',
      status: 'active' as const,
      price: 18499,
      compareAtPrice: 22999,
      sku: 'JD-DSK-AAR-002',
      inventoryQuantity: 30,
      category: 'Study & Office',
      vendor: 'JODO',
      imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
      ],
      material: 'Solid Burma Teak & Powder-Coated Matte Steel',
      dimensions: '120 x 60 x 75 cm',
      weight: 24,
      assemblyRequired: true,
      assemblyFee: 0,
      shortDescription: 'Functional study and work desk featuring solid teak tabletop, concealed wire trough, and sturdy matte black steel legs.',
      longDescription: `### Introduction
The Aarambh Study Desk is built for deep work and purposeful productivity. Combining warm natural teak with a durable steel framework, it elevates home offices and study nooks.

### Functional Design
Features a continuous concealed cable management trough underneath to keep laptop chargers and monitors clutter-free. Eased front bevel reduces wrist strain during long sessions.

### Assembly Experience
Pre-drilled threaded inserts allow you to bolt on the steel leg frames in less than 10 minutes with the included tool.`,
      careAndMaintenance: 'Wipe tabletop with a soft microfibre cloth. Avoid direct contact with excessive heat.',
      warrantyTerms: '2 Year Manufacturer Warranty',
      specifications: [
        { key: 'Top Material', value: 'Solid Burma Teakwood' },
        { key: 'Leg Frame', value: 'Heavy Gauge Matte Black Steel' },
        { key: 'Cable Management', value: 'Integrated Under-Desk Wire Channel' },
        { key: 'Dimensions', value: '120 cm (L) x 60 cm (W) x 75 cm (H)' },
        { key: 'Assembly', value: 'Bolt-on Legs (10 min DIY)' }
      ],
      tags: ['desk', 'study', 'home office', 'teak', 'cable management'],
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Ananta Sheesham Upholstered Dining Chairs (Set of 2)',
      slug: 'ananta-sheesham-dining-chairs-set-of-2',
      status: 'active' as const,
      price: 13999,
      compareAtPrice: 16999,
      sku: 'JD-CHR-ANA-002',
      inventoryQuantity: 36,
      category: 'Dining Room',
      vendor: 'JODO',
      imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1580481077167-333e61bfd0d6?auto=format&fit=crop&w=1200&q=80'
      ],
      material: 'Solid Sheesham Wood & Linen Blend Fabric',
      dimensions: '48 x 52 x 88 cm',
      weight: 14,
      assemblyRequired: true,
      assemblyFee: 0,
      shortDescription: 'Pair of ergonomic dining chairs in solid Sheesham with comfortable high-resilience foam and sand linen upholstery.',
      longDescription: `### Introduction
Designed as the perfect companion to the Ananta Dining Table, this set of two dining chairs blends structural integrity with plush comfort for lingering family dinners.

### Everyday Usability
Contoured backrest provides lumbar support, while premium sand linen fabric offers breathable seating year-round in Indian climates.

### Assembly
Delivered with pre-assembled seats and backrests. Attach the four legs using the included fasteners and you're ready to host.`,
      careAndMaintenance: 'Spot-clean fabric with mild soap foam. Wipe wood with a dry lint-free cloth.',
      warrantyTerms: '1 Year Manufacturer Warranty',
      specifications: [
        { key: 'Quantity', value: 'Set of 2 Chairs' },
        { key: 'Wood', value: 'Solid Sheesham' },
        { key: 'Fabric', value: 'Sand Linen Blend' },
        { key: 'Dimensions', value: '48 cm (W) x 52 cm (D) x 88 cm (H)' },
        { key: 'Seat Height', value: '46 cm' }
      ],
      tags: ['dining chair', 'dining set', 'sheesham', 'cushioned chair', 'linen'],
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Vistara 3-Seater Modular Sofa with Natural Cane Weave',
      slug: 'vistara-3-seater-modular-sofa',
      status: 'active' as const,
      price: 44999,
      compareAtPrice: 52999,
      sku: 'JD-SOF-VIS-003',
      inventoryQuantity: 10,
      category: 'Living Room',
      vendor: 'JODO',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80'
      ],
      material: 'Solid Mango Wood Frame & Handwoven Rattan Cane',
      dimensions: '210 x 85 x 78 cm',
      weight: 46,
      assemblyRequired: true,
      assemblyFee: 0,
      shortDescription: 'Expansive 3-seater sofa celebrating traditional Indian cane weave accents with contemporary deep-lounge cushions.',
      longDescription: `### Introduction
The Vistara 3-Seater Sofa marries heritage Indian rattan craftsmanship with modern relaxed lounging. Its warm pecan wood frame and handwoven cane side panels create a timeless presence.

### Comfort & Craft
Equipped with dual-density foam core and feather-touch microfibre wrap, ensuring supportive seating that doesn't sag over time. Removable cushion covers for easy washing.

### Easy Assembly
Tool-free modular connectors secure the seat and back modules quickly, making room rearranging effortless.`,
      careAndMaintenance: 'Removable cushion covers are dry-clean recommended. Gently dust rattan panels with a soft brush.',
      warrantyTerms: '3 Year Frame Warranty',
      specifications: [
        { key: 'Seating Capacity', value: '3-4 Persons' },
        { key: 'Frame', value: 'Solid Mango Wood' },
        { key: 'Side Panels', value: 'Handwoven Natural Cane' },
        { key: 'Dimensions', value: '210 cm (W) x 85 cm (D) x 78 cm (H)' }
      ],
      tags: ['sofa', '3-seater', 'cane furniture', 'living room', 'modular'],
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Sahyadri Fluted Oak 3-Drawer Nightstand',
      slug: 'sahyadri-fluted-oak-nightstand',
      status: 'active' as const,
      price: 11999,
      compareAtPrice: 14499,
      sku: 'JD-NST-SAH-003',
      inventoryQuantity: 28,
      category: 'Bedroom',
      vendor: 'JODO',
      imageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
      ],
      material: 'Engineered Oak & Solid Oak Fluted Facing',
      dimensions: '50 x 42 x 55 cm',
      weight: 15,
      assemblyRequired: true,
      assemblyFee: 0,
      shortDescription: 'Textured fluted bedside table with three smooth-gliding soft-close drawers and warm brass pull accents.',
      longDescription: `### Introduction
The Sahyadri Nightstand brings architectural texture and calm utility to your bedside. Fluted timber fronts catch soft ambient light beautifully.

### Functional Storage
Three spacious drawers with concealed soft-close undermount runners store reading materials, nighttime essentials, and electronics out of sight.

### Fast Assembly
Ships with the main drawer carcass pre-assembled. Simply screw in the solid oak legs with the included hardware.`,
      careAndMaintenance: 'Wipe surface with a clean microfibre cloth. Avoid abrasive glass cleaners on wood surfaces.',
      warrantyTerms: '1 Year Warranty',
      specifications: [
        { key: 'Drawers', value: '3 Soft-Close Drawers' },
        { key: 'Material', value: 'Oak Veneer with Solid Fluted Facing' },
        { key: 'Dimensions', value: '50 cm (W) x 42 cm (D) x 55 cm (H)' }
      ],
      tags: ['nightstand', 'bedside table', 'oak', 'bedroom storage'],
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Malhar Low-Profile Teak Coffee Table with Storage Shelf',
      slug: 'malhar-low-profile-teak-coffee-table',
      status: 'active' as const,
      price: 15999,
      compareAtPrice: 18999,
      sku: 'JD-CTB-MAL-001',
      inventoryQuantity: 22,
      category: 'Living Room',
      vendor: 'JODO',
      imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80'
      ],
      material: 'Kiln-Dried Burma Teakwood',
      dimensions: '110 x 60 x 42 cm',
      weight: 18,
      assemblyRequired: true,
      assemblyFee: 0,
      shortDescription: 'Grounded living room centerpiece featuring rounded organic corners, solid teak construction, and an open lower magazine shelf.',
      longDescription: `### Introduction
The Malhar Coffee Table anchors your living space with warmth and tactile craftsmanship. Its low-profile silhouette encourages relaxed gatherings and informal tea moments.

### Everyday Usability
A generous lower shelf keeps coffee table books, remotes, and board games organized, leaving the top surface clean and open.

### Assembly
Straightforward 4-bolt leg attachment with alignment dowels ensuring a wobble-free fit every time.`,
      careAndMaintenance: 'Wipe clean with a damp cloth. Use coasters for hot mugs and beverages.',
      warrantyTerms: '2 Year Manufacturer Warranty',
      specifications: [
        { key: 'Material', value: 'Solid Kiln-Dried Burma Teakwood' },
        { key: 'Storage', value: 'Full-length Lower Open Shelf' },
        { key: 'Dimensions', value: '110 cm (L) x 60 cm (W) x 42 cm (H)' }
      ],
      tags: ['coffee table', 'center table', 'living room', 'teakwood', 'storage shelf'],
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Nilgiri Modular Bookshelf & Room Divider (5-Tier)',
      slug: 'nilgiri-modular-bookshelf-5-tier',
      status: 'active' as const,
      price: 26999,
      compareAtPrice: 31999,
      sku: 'JD-BKS-NIL-005',
      inventoryQuantity: 15,
      category: 'Study & Office',
      vendor: 'JODO',
      imageUrl: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1200&q=80'
      ],
      material: 'Solid Sheesham & Natural Cane Weave Panels',
      dimensions: '100 x 35 x 180 cm',
      weight: 32,
      assemblyRequired: true,
      assemblyFee: 0,
      shortDescription: '5-tier architectural bookshelf and room partition with alternating open shelving and natural cane backing.',
      longDescription: `### Introduction
The Nilgiri Bookshelf is designed to define living and working zones in modern open-plan apartments without blocking natural light.

### Thoughtful Manufacturing
Constructed from solid Sheesham with alternating cane weave accent panels. Reinforced shelving supports heavy art books, ceramics, and indoor greenery.

### Assembly
Numbered modular uprights and pre-drilled shelf locking pins enable stable, straightforward assembly. Wall-anchor safety strap included.`,
      careAndMaintenance: 'Dust shelves with a feather duster or dry cloth. Check wall fasteners periodically.',
      warrantyTerms: '2 Year Warranty',
      specifications: [
        { key: 'Tiers', value: '5 Heavy-Duty Display Shelves' },
        { key: 'Wood', value: 'Solid Sheesham' },
        { key: 'Backing', value: 'Natural Cane Weave Panels' },
        { key: 'Dimensions', value: '100 cm (W) x 35 cm (D) x 180 cm (H)' }
      ],
      tags: ['bookshelf', 'shelving', 'room divider', 'sheesham', 'cane', 'storage'],
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Samvaad Round 4-Seater Breakfast Table',
      slug: 'samvaad-round-4-seater-breakfast-table',
      status: 'active' as const,
      price: 22499,
      compareAtPrice: 26999,
      sku: 'JD-DT-SAM-004',
      inventoryQuantity: 20,
      category: 'Dining Room',
      vendor: 'JODO',
      imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80'
      ],
      material: 'Solid White Ash Wood with Pedestal Base',
      dimensions: '105 x 105 x 75 cm',
      weight: 26,
      assemblyRequired: true,
      assemblyFee: 0,
      shortDescription: 'Intimate round breakfast and dining table in solid White Ash wood with a sculptural pedestal column base.',
      longDescription: `### Introduction
"Samvaad" translates to dialogue — this round table is built to encourage eye contact and lively conversations over morning chai or dinner.

### Pedestal Base Utility
The center pedestal column eliminates awkward corner legs, allowing four chairs to tuck in smoothly even in compact breakfast nooks.

### Fast Assembly
Two-piece assembly: securely fasten the solid pedestal base to the circular top using four heavy-duty machine bolts.`,
      careAndMaintenance: 'Wipe down with a slightly damp cloth. Use hot pads or trivets under hot serving bowls.',
      warrantyTerms: '1 Year Warranty',
      specifications: [
        { key: 'Seating', value: '4 Persons' },
        { key: 'Material', value: 'Solid White Ash Wood' },
        { key: 'Base Type', value: 'Fluted Sculptural Center Pedestal' },
        { key: 'Dimensions', value: '105 cm Diameter x 75 cm Height' }
      ],
      tags: ['round table', 'breakfast table', 'dining', 'ash wood', 'pedestal'],
    },
  ];

  const insertedProducts = await Product.insertMany(jodoProducts);
  console.log(`✅ ${insertedProducts.length} JODO Furniture Products inserted successfully!`);

  // 3. SEED INVENTORY ITEMS
  console.log('📦 Seeding warehouse inventory items for all 10 products...');
  const inventoryItemsToInsert = insertedProducts.map((p) => ({
    tenantId: tenant._id,
    storeId: store._id,
    sku: p.sku!,
    locationName: 'Bhiwandi Central Warehouse',
    onHand: p.inventoryQuantity,
    available: p.inventoryQuantity - 2,
    committed: 2,
    lowStockThreshold: 5,
    status: 'in_stock' as const,
    reservedStock: 0,
    reorderLevel: 8,
    reorderQuantity: 25,
    lastRestockedAt: new Date(),
  }));
  await InventoryItem.insertMany(inventoryItemsToInsert);
  console.log(`✅ ${inventoryItemsToInsert.length} Inventory items created across warehouses.`);

  // 4. SEED COLLECTIONS
  console.log('🛋️ Seeding JODO collections...');
  const livingProducts = insertedProducts.filter((p) => p.category === 'Living Room').map((p) => p._id);
  const diningProducts = insertedProducts.filter((p) => p.category === 'Dining Room').map((p) => p._id);
  const bedroomProducts = insertedProducts.filter((p) => p.category === 'Bedroom').map((p) => p._id);
  const studyProducts = insertedProducts.filter((p) => p.category === 'Study & Office').map((p) => p._id);

  await Collection.insertMany([
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Living Room Serenity',
      slug: 'living-room-serenity',
      description: 'Handcrafted sofas, armchairs, and coffee tables designed to bring family together.',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      type: 'manual',
      products: livingProducts,
      status: 'active',
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Dining & Togetherness',
      slug: 'dining-and-togetherness',
      description: 'Solid Sheesham and Ash wood dining tables engineered for joyful daily meals.',
      imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
      type: 'manual',
      products: diningProducts,
      status: 'active',
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Restful Bedroom',
      slug: 'restful-bedroom',
      description: 'Floating platform beds and fluted oak nightstands crafted for restorative sleep.',
      imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      type: 'manual',
      products: bedroomProducts,
      status: 'active',
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      title: 'Study & Workspace',
      slug: 'study-and-workspace',
      description: 'Ergonomic teak desks and modular shelving for productive, uncluttered work.',
      imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
      type: 'manual',
      products: studyProducts,
      status: 'active',
    },
  ]);
  console.log('✅ 4 JODO Collections created and linked to products.');

  // 5. SEED AUTHENTIC REVIEWS
  console.log('⭐ Seeding customer reviews for JODO products...');
  await Review.insertMany([
    {
      tenantId: tenant._id,
      storeId: store._id,
      productId: insertedProducts[0]._id, // Ananta Dining Table
      rating: 5,
      authorName: 'Rohan Deshmukh',
      authorEmail: 'rohan.d@gmail.com',
      title: 'Sensational quality and surprisingly easy assembly!',
      body: 'The solid Sheesham wood grain is gorgeous in natural sunlight. Assembling the table with my wife took only 15 minutes because all the bolt holes aligned accurately. JODO truly delivers on "The Joy of Together"!',
      status: 'approved',
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      productId: insertedProducts[1]._id, // Aurelia Armchair
      rating: 5,
      authorName: 'Meera Iyer',
      authorEmail: 'meera.iyer@outlook.com',
      title: 'Comfortable, sculptural, and warm',
      body: 'I was hesitant about buying furniture online, but the bouclé fabric feels premium and the teak finish is smooth with no chemical smell. It has become my favourite reading corner.',
      status: 'approved',
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      productId: insertedProducts[2]._id, // Nordic Floating Bed
      rating: 5,
      authorName: 'Aditya & Pooja Nair',
      authorEmail: 'aditya.nair@techfirm.in',
      title: 'Rock-solid bed without any creaking',
      body: 'The floating design makes our bedroom feel twice as spacious. The birch slats support our heavy latex mattress perfectly. Assembly instructions were clear and simple.',
      status: 'approved',
    },
  ]);
  console.log('✅ Reviews seeded.');

  // 6. SEED INITIAL ORDERS
  console.log('🛍️ Seeding realistic customer orders...');
  await Order.insertMany([
    {
      tenantId: tenant._id,
      storeId: store._id,
      orderNumber: 'JD-ORD-2026-001',
      customerName: 'Ananya Sharma',
      customerEmail: 'ananya.s@gmail.com',
      items: [
        {
          productId: insertedProducts[0]._id,
          sku: insertedProducts[0].sku!,
          title: insertedProducts[0].title,
          quantity: 1,
          price: insertedProducts[0].price,
          total: insertedProducts[0].price,
        },
        {
          productId: insertedProducts[4]._id, // Chairs
          sku: insertedProducts[4].sku!,
          title: insertedProducts[4].title,
          quantity: 2,
          price: insertedProducts[4].price,
          total: insertedProducts[4].price * 2,
        },
      ],
      shippingAddress: {
        firstName: 'Ananya',
        lastName: 'Sharma',
        address1: 'Flat 402, Godrej Woods, Kharadi',
        city: 'Pune',
        state: 'Maharashtra',
        zip: '411014',
        country: 'India',
      },
      subtotal: 56997,
      taxTotal: 0,
      shippingTotal: 0,
      totalAmount: 56997,
      currency: 'INR',
      paymentStatus: 'paid',
      fulfillmentStatus: 'fulfilled',
      itemsCount: 3,
      notes: 'Please call before delivery.',
      riskScore: 5,
      riskLevel: 'low',
      fraudStatus: 'approved',
    },
    {
      tenantId: tenant._id,
      storeId: store._id,
      orderNumber: 'JD-ORD-2026-002',
      customerName: 'Kunal Kapoor',
      customerEmail: 'kunal.k@indiamail.com',
      items: [
        {
          productId: insertedProducts[3]._id, // Aarambh Desk
          sku: insertedProducts[3].sku!,
          title: insertedProducts[3].title,
          quantity: 1,
          price: insertedProducts[3].price,
          total: insertedProducts[3].price,
        },
      ],
      shippingAddress: {
        firstName: 'Kunal',
        lastName: 'Kapoor',
        address1: 'Villa 18, Palm Meadows, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        zip: '560066',
        country: 'India',
      },
      subtotal: 18499,
      taxTotal: 0,
      shippingTotal: 0,
      totalAmount: 18499,
      currency: 'INR',
      paymentStatus: 'paid',
      fulfillmentStatus: 'unfulfilled',
      itemsCount: 1,
      riskScore: 10,
      riskLevel: 'low',
      fraudStatus: 'approved',
    },
  ]);
  console.log('✅ Orders seeded.');

  // 7. SEED AI CONTENT GENERATED DRAFTS & PUBLISHED ITEMS
  console.log('🤖 Seeding AI Content drafts and published items for JODO...');
  const aiContents = [
    {
      contentId: 'AIC-2026-001',
      tenantId: tenant._id,
      storeId: store._id,
      contentType: 'product_description' as const,
      productId: insertedProducts[0]._id,
      productName: insertedProducts[0].title,
      sku: insertedProducts[0].sku,
      category: insertedProducts[0].category,
      price: insertedProducts[0].price,
      imageUrl: insertedProducts[0].imageUrl,
      title: `${insertedProducts[0].title} - JODO`,
      generatedContent: {
        seo_title: `${insertedProducts[0].title} - JODO`,
        meta_description: `Discover the Ananta Solid Sheesham 6-Seater Dining Table by JODO. Designed for family dining and togetherness with easy assembly.`,
        url_slug: insertedProducts[0].slug,
        primary_keyword: 'JODO 6 seater wooden dining table',
        secondary_keywords: ['sheesham dining table', 'wooden dining table 6 seater', 'solid wood dining table'],
        short_description: insertedProducts[0].shortDescription,
        full_description: insertedProducts[0].longDescription,
        key_features: [
          'Solid Sheesham wood tabletop and legs',
          'Seats up to 6 persons comfortably',
          'Warm walnut honey finish highlighting natural grain',
          'Straightforward DIY bolt-on leg assembly (15 mins)'
        ],
        assembly_information: 'DIY bolt-on leg assembly. Hardware and instructions included.',
        care_and_maintenance: insertedProducts[0].careAndMaintenance,
        whats_included: ['1 Tabletop', '4 Legs', 'Hardware Pack', 'Manual'],
        who_is_this_for: 'Families who value warm gatherings and durable handcrafted Indian wood furniture.',
        faqs: [
          { question: 'Is assembly required?', answer: 'Yes, simple DIY assembly with included wrench and bolts.' },
          { question: 'What is the warranty?', answer: '1 Year Manufacturer Warranty against structural defects.' }
        ],
        specification_summary: {
          material: insertedProducts[0].material,
          dimensions: insertedProducts[0].dimensions,
          weight: `${insertedProducts[0].weight} kg`,
          assembly: 'DIY (15 mins)',
          warranty: insertedProducts[0].warrantyTerms,
          sku: insertedProducts[0].sku
        },
        productTitle: `${insertedProducts[0].title} - JODO`,
        shortDescription: insertedProducts[0].shortDescription,
        fullDescription: insertedProducts[0].longDescription,
        keyFeatures: [
          'Solid Sheesham wood tabletop and legs',
          'Seats up to 6 persons comfortably',
          'Warm walnut honey finish highlighting natural grain',
          'Straightforward DIY bolt-on leg assembly (15 mins)'
        ],
        seoMetaTitle: `${insertedProducts[0].title} - JODO`,
        seoMetaDescription: `Discover the Ananta Solid Sheesham 6-Seater Dining Table by JODO. Designed for family dining and togetherness with easy assembly.`,
        seoKeywords: 'JODO 6 seater wooden dining table, sheesham dining table'
      },
      tone: 'Warm & Thoughtful',
      length: 'Detailed',
      channel: 'Website',
      qualityScore: 98,
      qualityChecks: {
        grammar: true,
        brandTone: true,
        seo: true,
        productAccuracy: true,
        duplicateRisk: 'Low',
        unsupportedClaimsCount: 0
      },
      status: 'Published' as const,
      version: 1,
      createdBy: 'Admin User',
      publishedBy: 'Admin User',
      publishedAt: new Date(),
    },
    {
      contentId: 'AIC-2026-002',
      tenantId: tenant._id,
      storeId: store._id,
      contentType: 'product_description' as const,
      productId: insertedProducts[1]._id,
      productName: insertedProducts[1].title,
      sku: insertedProducts[1].sku,
      category: insertedProducts[1].category,
      price: insertedProducts[1].price,
      imageUrl: insertedProducts[1].imageUrl,
      title: `${insertedProducts[1].title} - JODO`,
      generatedContent: {
        seo_title: `${insertedProducts[1].title} - JODO`,
        meta_description: `Shop the Aurelia Minimalist Teak Armchair by JODO. Crafted from kiln-dried Burma teakwood with cozy bouclé upholstery.`,
        url_slug: insertedProducts[1].slug,
        primary_keyword: 'JODO teak armchair with bouclé',
        secondary_keywords: ['minimalist wooden armchair', 'teak accent chair', 'living room chair'],
        short_description: insertedProducts[1].shortDescription,
        full_description: insertedProducts[1].longDescription,
        key_features: [
          'Solid Burma teakwood open frame',
          'Soft textured oatmeal bouclé fabric',
          'Ergonomic back support',
          'Interlocking frame for easy assembly'
        ],
        assembly_information: 'Interlocking frame with 4 corner bolts.',
        care_and_maintenance: insertedProducts[1].careAndMaintenance,
        whats_included: ['1 Seat Module', '2 Teak Armrest Frames', 'Hardware Kit'],
        who_is_this_for: 'Modern homeowners looking for an inviting, design-conscious reading chair.',
        faqs: [
          { question: 'What wood is used?', answer: 'Solid kiln-dried Burma teakwood.' }
        ],
        specification_summary: {
          material: insertedProducts[1].material,
          dimensions: insertedProducts[1].dimensions,
          weight: `${insertedProducts[1].weight} kg`,
          assembly: 'Interlocking DIY',
          warranty: insertedProducts[1].warrantyTerms,
          sku: insertedProducts[1].sku
        },
        productTitle: `${insertedProducts[1].title} - JODO`,
        shortDescription: insertedProducts[1].shortDescription,
        fullDescription: insertedProducts[1].longDescription,
        keyFeatures: [
          'Solid Burma teakwood open frame',
          'Soft textured oatmeal bouclé fabric',
          'Ergonomic back support',
          'Interlocking frame for easy assembly'
        ],
        seoMetaTitle: `${insertedProducts[1].title} - JODO`,
        seoMetaDescription: `Shop the Aurelia Minimalist Teak Armchair by JODO. Crafted from kiln-dried Burma teakwood with cozy bouclé upholstery.`,
        seoKeywords: 'JODO teak armchair with bouclé, minimalist wooden armchair'
      },
      tone: 'Warm & Thoughtful',
      length: 'Medium',
      channel: 'Website',
      qualityScore: 97,
      qualityChecks: {
        grammar: true,
        brandTone: true,
        seo: true,
        productAccuracy: true,
        duplicateRisk: 'Low',
        unsupportedClaimsCount: 0
      },
      status: 'Draft' as const,
      version: 1,
      createdBy: 'Admin User',
    }
  ];

  await AiContent.insertMany(aiContents);
  console.log('✅ AI Content drafts & published records created.');

  console.log('\n🎉 ALL FLOWS COMPLETED SUCCESSFULLY!');
  console.log(`- 10 JODO Furniture Products are active in the database.`);
  console.log(`- Inventory items, collections, reviews, and orders are synchronized.`);
  console.log(`- AI Content system is loaded with JODO copywriting persona & gpt-4o-mini.`);

  await disconnectDB();
}

seedJodoProducts().catch((err) => {
  console.error('❌ Error during JODO seeding:', err);
  process.exit(1);
});
