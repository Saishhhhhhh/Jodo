export interface ARProduct {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
  enquiryOnly: boolean;
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  weight: number | null;
  model: {
    glbUrl: string;
    usdzUrl: string | null;
    posterUrl: string;
    fileSizeMb: number | null;
  };
  images: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AREventLog {
  productId: string;
  eventType:
    | 'qr_scan'
    | 'page_view'
    | 'model_loaded'
    | 'ar_clicked'
    | 'ar_not_supported'
    | 'enquiry_clicked'
    | 'whatsapp_clicked';
  deviceType: 'ios' | 'android' | 'desktop' | 'unknown';
  browser?: string;
  userAgent?: string;
  timestamp: string;
}

export type ViewType =
  | 'home'
  | 'products'
  | 'product-detail'
  | 'wishlist'
  | 'compare'
  | 'admin'
  | 'admin-products'
  | 'admin-analytics';

export const CATEGORIES = [
  'All',
  'Furniture',
  'Lighting',
  'Decor',
  'Seating',
  'Tables',
  'Storage',
] as const;

export type Category = (typeof CATEGORIES)[number];
