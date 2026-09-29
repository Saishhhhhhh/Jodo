import { ProductAnalyticsData } from './product-analytics-dialog';

const PRODUCT_DATABASE: Record<string, Partial<ProductAnalyticsData>> = {
  'Ergo Chair': {
    name: 'Ergo Chair',
    sku: 'JD-FUR-ERG-01',
    category: 'Ergonomics & Seating',
    price: 12500,
    cogs: 4000,
    margin: 68,
    stock: 140,
    velocity: 85,
    returnRate: 1.2,
    rating: 4.9,
    reviewsCount: 512,
    growth: 22.4,
    description: 'High-performance mesh ergonomic chair with 4D armrests, dynamic lumbar support, and pneumatic gas lift.',
    image: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Obsidian Black Mesh', share: 50, units: 425, stock: 70 },
      { name: 'Mineral Gray Mesh', share: 35, units: 297, stock: 45 },
      { name: 'Forest Green Accent', share: 15, units: 128, stock: 25 }
    ],
    fulfillment: {
      hub: 'Bengaluru Central Hub',
      avgDelivery: '1-2 business days',
      reorderLevel: 50,
      reorderRecommendation: 'Current stock sufficient for 45 days. Reorder trigger in 3 weeks.'
    }
  },
  'Ergonomic Office Chair': {
    name: 'Ergonomic Office Chair',
    sku: 'JD-FUR-ERG-01',
    category: 'Ergonomics & Seating',
    price: 12500,
    cogs: 4200,
    margin: 66.4,
    stock: 140,
    velocity: 85,
    returnRate: 1.2,
    rating: 4.9,
    reviewsCount: 512,
    growth: 22.4,
    description: 'High-performance mesh ergonomic chair with 4D armrests, dynamic lumbar support, and pneumatic gas lift.',
    image: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Obsidian Black Mesh', share: 50, units: 425, stock: 70 },
      { name: 'Mineral Gray Mesh', share: 35, units: 297, stock: 45 },
      { name: 'Forest Green Accent', share: 15, units: 128, stock: 25 }
    ],
    fulfillment: {
      hub: 'Bengaluru Central Hub',
      avgDelivery: '1-2 business days',
      reorderLevel: 50,
      reorderRecommendation: 'Current stock sufficient for 45 days. Reorder trigger in 3 weeks.'
    }
  },
  'Pro Keyboard': {
    name: 'Pro Keyboard',
    sku: 'JD-TEC-KB-882',
    category: 'Workspace Tech & Peripherals',
    price: 4499,
    cogs: 2474,
    margin: 45,
    stock: 185,
    velocity: 65,
    returnRate: 1.8,
    rating: 4.8,
    reviewsCount: 342,
    growth: 18.5,
    description: 'Low-latency wireless mechanical keyboard with hot-swappable switches, sound dampening silicon pads, and RGB backlighting.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Gateron Red Linear', share: 45, units: 279, stock: 85 },
      { name: 'Gateron Brown Tactile', share: 35, units: 217, stock: 60 },
      { name: 'Gateron Blue Clicky', share: 20, units: 124, stock: 40 }
    ],
    fulfillment: {
      hub: 'Mumbai Logistics Park',
      avgDelivery: '2 business days',
      reorderLevel: 60,
      reorderRecommendation: 'Fast moving SKU. Restock order scheduled for 15 Oct.'
    }
  },
  'Desk Mat': {
    name: 'Desk Mat',
    sku: 'JD-ACC-DM-101',
    category: 'Desk Accessories',
    price: 1499,
    cogs: 375,
    margin: 75,
    stock: 340,
    velocity: 130,
    returnRate: 0.6,
    rating: 4.9,
    reviewsCount: 840,
    growth: 34.1,
    description: 'Water-resistant vegan leather and wool felt oversized desk pad with anti-slip micro-texture backing.',
    image: 'https://images.unsplash.com/photo-1629429408209-1ab913ca679b?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Midnight Black XL', share: 55, units: 660, stock: 180 },
      { name: 'Oxford Navy XL', share: 30, units: 360, stock: 110 },
      { name: 'Saddle Brown XL', share: 15, units: 180, stock: 50 }
    ],
    fulfillment: {
      hub: 'Delhi-NCR Warehouse',
      avgDelivery: '1-3 business days',
      reorderLevel: 100,
      reorderRecommendation: 'High volume anchor. Stock level healthy for next 60 days.'
    }
  },
  'Monitor Arm': {
    name: 'Monitor Arm',
    sku: 'JD-ACC-MA-204',
    category: 'Mounting & Ergonomics',
    price: 3899,
    cogs: 1754,
    margin: 55,
    stock: 68,
    velocity: 45,
    returnRate: 1.4,
    rating: 4.7,
    reviewsCount: 215,
    growth: 12.3,
    description: 'Heavy-duty gas spring single monitor arm with integrated cable management and 360-degree rotation.',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Matte Black Single Arm', share: 70, units: 301, stock: 45 },
      { name: 'Silver White Single Arm', share: 30, units: 129, stock: 23 }
    ],
    fulfillment: {
      hub: 'Bengaluru Central Hub',
      avgDelivery: '2 business days',
      reorderLevel: 30,
      reorderRecommendation: 'Optimal stock. Monitor demand spikes expected with upcoming campaigns.'
    }
  },
  'Webcam': {
    name: 'Webcam',
    sku: 'JD-TEC-WC-401',
    category: 'Audio & Video Tech',
    price: 4999,
    cogs: 2999,
    margin: 40,
    stock: 92,
    velocity: 60,
    returnRate: 2.2,
    rating: 4.6,
    reviewsCount: 180,
    growth: 9.8,
    description: '4K Ultra HD webcam with dual noise-cancelling microphones, privacy shutter, and low-light auto exposure.',
    image: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Standard Black Edition', share: 80, units: 472, stock: 70 },
      { name: 'White Minimalist Edition', share: 20, units: 118, stock: 22 }
    ],
    fulfillment: {
      hub: 'Mumbai Logistics Park',
      avgDelivery: '2-3 business days',
      reorderLevel: 40,
      reorderRecommendation: 'Steady velocity. Minimum order quantity batch arriving next week.'
    }
  },
  'T-Shirt': {
    name: 'T-Shirt',
    sku: 'JD-APP-TS-100',
    category: 'Apparel',
    price: 1200,
    cogs: 450,
    margin: 62.5,
    stock: 120,
    velocity: 45,
    returnRate: 2.1,
    rating: 4.7,
    reviewsCount: 290,
    growth: 14.2,
    description: '100% Supima combed cotton heavyweight t-shirt with ribbed crew neck and relaxed fit.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Jet Black / L', share: 45, units: 20, stock: 55 },
      { name: 'Heather Gray / M', share: 35, units: 15, stock: 40 },
      { name: 'Pure White / XL', share: 20, units: 10, stock: 25 }
    ],
    fulfillment: {
      hub: 'Tirupur Apparel Center',
      avgDelivery: '2-3 business days',
      reorderLevel: 30,
      reorderRecommendation: 'Stock healthy. Replenishment lead time is 7 days.'
    }
  },
  'Premium Cotton T-Shirt': {
    name: 'Premium Cotton T-Shirt',
    sku: 'JD-APP-TS-100',
    category: 'Apparel',
    price: 1200,
    cogs: 450,
    margin: 62.5,
    stock: 430,
    velocity: 45,
    returnRate: 2.1,
    rating: 4.7,
    reviewsCount: 290,
    growth: 14.2,
    description: '100% Supima combed cotton heavyweight t-shirt with ribbed crew neck and relaxed fit.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Jet Black / L', share: 45, units: 190, stock: 200 },
      { name: 'Heather Gray / M', share: 35, units: 150, stock: 150 },
      { name: 'Pure White / XL', share: 20, units: 90, stock: 80 }
    ],
    fulfillment: {
      hub: 'Tirupur Apparel Center',
      avgDelivery: '2-3 business days',
      reorderLevel: 100,
      reorderRecommendation: 'Well-stocked. Seasonal summer restock planned for next quarter.'
    }
  },
  'Hoodie': {
    name: 'Hoodie',
    sku: 'JD-APP-HD-200',
    category: 'Apparel',
    price: 2499,
    cogs: 950,
    margin: 62,
    stock: 15,
    velocity: 30,
    returnRate: 2.4,
    rating: 4.8,
    reviewsCount: 145,
    growth: 16.0,
    description: 'French terry brushed fleece oversized hoodie with front kangaroo pocket and reinforced ribbing.',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Oatmeal Heather / L', share: 55, units: 16, stock: 8 },
      { name: 'Charcoal Black / M', share: 45, units: 14, stock: 7 }
    ],
    fulfillment: {
      hub: 'Tirupur Apparel Center',
      avgDelivery: '2-3 business days',
      reorderLevel: 25,
      reorderRecommendation: '⚠️ Low Stock! Current stock level covers only ~15 days. Immediate PO required.'
    }
  },
  'Cap': {
    name: 'Cap',
    sku: 'JD-APP-CP-300',
    category: 'Accessories',
    price: 799,
    cogs: 250,
    margin: 68.7,
    stock: 45,
    velocity: 15,
    returnRate: 0.8,
    rating: 4.9,
    reviewsCount: 98,
    growth: 8.5,
    description: 'Unstructured 6-panel dad cap in washed cotton twill with brass buckle closure.',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Faded Khaki', share: 60, units: 9, stock: 28 },
      { name: 'Navy Blue', share: 40, units: 6, stock: 17 }
    ],
    fulfillment: {
      hub: 'Bengaluru Central Hub',
      avgDelivery: '1-2 business days',
      reorderLevel: 20,
      reorderRecommendation: 'Normal velocity. Buffer inventory adequate.'
    }
  },
  'Socks': {
    name: 'Socks',
    sku: 'JD-APP-SK-400',
    category: 'Everyday Essentials',
    price: 499,
    cogs: 120,
    margin: 75.9,
    stock: 200,
    velocity: 150,
    returnRate: 0.2,
    rating: 4.9,
    reviewsCount: 410,
    growth: 25.0,
    description: 'Cushioned seamless toe crew socks woven with organic combed cotton and elastane.',
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: '3-Pack Multi Neutral', share: 70, units: 105, stock: 140 },
      { name: '3-Pack Solid Black', share: 30, units: 45, stock: 60 }
    ],
    fulfillment: {
      hub: 'Delhi-NCR Warehouse',
      avgDelivery: '1-2 business days',
      reorderLevel: 80,
      reorderRecommendation: 'High repeat purchase rate. Keep inventory > 150 units.'
    }
  },
  'Jacket': {
    name: 'Jacket',
    sku: 'JD-APP-JK-500',
    category: 'Apparel & Outerwear',
    price: 4999,
    cogs: 2100,
    margin: 58,
    stock: 5,
    velocity: 2,
    returnRate: 3.5,
    rating: 4.6,
    reviewsCount: 65,
    growth: -4.0,
    description: 'Weatherproof insulated utility jacket with taped seams and detachable storm hood.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Olive Green / L', share: 60, units: 1, stock: 3 },
      { name: 'Matte Black / XL', share: 40, units: 1, stock: 2 }
    ],
    fulfillment: {
      hub: 'Delhi-NCR Warehouse',
      avgDelivery: '2 business days',
      reorderLevel: 10,
      reorderRecommendation: 'Slow mover item. Consider promotional bundle before next winter season.'
    }
  },
  'Wireless Headphones': {
    name: 'Wireless Headphones',
    sku: 'JD-TEC-WH-900',
    category: 'Electronics & Audio',
    price: 8900,
    cogs: 3500,
    margin: 60.6,
    stock: 45,
    velocity: 35,
    returnRate: 1.5,
    rating: 4.8,
    reviewsCount: 280,
    growth: 21.0,
    description: 'Active noise-cancelling over-ear wireless headphones with 40mm drivers and 40-hour battery life.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Midnight Charcoal', share: 65, units: 23, stock: 30 },
      { name: 'Silver Platinum', share: 35, units: 12, stock: 15 }
    ],
    fulfillment: {
      hub: 'Bengaluru Central Hub',
      avgDelivery: '1-2 business days',
      reorderLevel: 20,
      reorderRecommendation: 'Strong seller with high margin. Healthy stock level.'
    }
  },
  'Smart Fitness Watch': {
    name: 'Smart Fitness Watch',
    sku: 'JD-TEC-SW-800',
    category: 'Electronics & Wearables',
    price: 5400,
    cogs: 1800,
    margin: 66.6,
    stock: 89,
    velocity: 50,
    returnRate: 1.9,
    rating: 4.7,
    reviewsCount: 195,
    growth: 19.5,
    description: 'AMOLED display fitness smartwatch with continuous SpO2, heart rate monitoring, and 5ATM water resistance.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: 'Space Black / Silicone Band', share: 55, units: 28, stock: 50 },
      { name: 'Rose Gold / Milanese Loop', share: 45, units: 22, stock: 39 }
    ],
    fulfillment: {
      hub: 'Mumbai Logistics Park',
      avgDelivery: '2 business days',
      reorderLevel: 30,
      reorderRecommendation: 'High customer satisfaction. Reorder trigger in 5 weeks.'
    }
  },
  'Organic Coffee Beans': {
    name: 'Organic Coffee Beans',
    sku: 'JD-FOD-CB-600',
    category: 'Food & Beverage',
    price: 800,
    cogs: 250,
    margin: 68.7,
    stock: 210,
    velocity: 110,
    returnRate: 0.1,
    rating: 4.9,
    reviewsCount: 420,
    growth: 28.0,
    description: 'Single-origin 100% Arabica shade-grown beans roasted to medium-dark profile in Chikmagalur.',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
    variants: [
      { name: '500g Whole Bean', share: 60, units: 66, stock: 130 },
      { name: '500g French Press Grind', share: 40, units: 44, stock: 80 }
    ],
    fulfillment: {
      hub: 'Bengaluru Central Hub',
      avgDelivery: '1-2 business days',
      reorderLevel: 75,
      reorderRecommendation: 'Fast recurring purchase cycles. Fresh roasted lot delivered weekly.'
    }
  }
};

export function getProductAnalytics(
  name: string,
  dateMultiplier: number = 1,
  overrideVolume?: number,
  overrideMargin?: number
): ProductAnalyticsData {
  const base = PRODUCT_DATABASE[name] || {};

  const volume = overrideVolume ?? Math.floor((base.velocity ? base.velocity * 12 : 500) * dateMultiplier);
  const margin = overrideMargin ?? base.margin ?? 55;
  const price = base.price ?? 2500;
  const cogs = base.cogs ?? Math.round(price * (1 - margin / 100));
  const stock = base.stock ?? 100;
  const velocity = base.velocity ?? Math.max(1, Math.round(volume / (dateMultiplier * 12 || 1)));

  // Generate 6-week trend data
  const baseWeekly = Math.max(1, Math.round(volume / 6));
  const weeklyTrend = [
    { week: 'W-5', units: Math.round(baseWeekly * 0.8), revenue: Math.round(baseWeekly * 0.8 * price) },
    { week: 'W-4', units: Math.round(baseWeekly * 0.9), revenue: Math.round(baseWeekly * 0.9 * price) },
    { week: 'W-3', units: Math.round(baseWeekly * 1.05), revenue: Math.round(baseWeekly * 1.05 * price) },
    { week: 'W-2', units: Math.round(baseWeekly * 0.95), revenue: Math.round(baseWeekly * 0.95 * price) },
    { week: 'W-1', units: Math.round(baseWeekly * 1.1), revenue: Math.round(baseWeekly * 1.1 * price) },
    { week: 'Current', units: Math.round(baseWeekly * 1.2), revenue: Math.round(baseWeekly * 1.2 * price) },
  ];

  const variants = base.variants || [
    { name: 'Default Variant A', share: 60, units: Math.round(volume * 0.6), stock: Math.round(stock * 0.6) },
    { name: 'Alternative Variant B', share: 40, units: Math.round(volume * 0.4), stock: Math.round(stock * 0.4) }
  ];

  return {
    name: base.name || name,
    sku: base.sku || `JD-PRD-${Math.abs(name.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) % 900 + 100)}`,
    category: base.category || 'General Merchandise',
    price,
    cogs,
    margin,
    volume,
    stock,
    velocity,
    returnRate: base.returnRate ?? 1.5,
    rating: base.rating ?? 4.8,
    reviewsCount: base.reviewsCount ?? 210,
    growth: base.growth ?? 15.2,
    description: base.description || `High quality ${name} crafted with superior materials for durability and performance.`,
    image: base.image,
    variants,
    weeklyTrend,
    fulfillment: base.fulfillment || {
      hub: 'Central Fulfillment Hub',
      avgDelivery: '2-3 business days',
      reorderLevel: 40,
      reorderRecommendation: 'Inventory levels are currently within safe operational buffers.'
    }
  };
}
