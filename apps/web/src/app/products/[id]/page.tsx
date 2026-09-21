import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { networkInterfaces } from 'os';
import ProductPageClient from '@/components/ProductPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductData {
  _id: string;
  title: string;
  vendor: string;
  price: number;
  compareAtPrice?: number;
  inventoryQuantity: number;
  imageUrl: string;
  slug?: string;
  galleryImages?: string[];
  material?: string;
  dimensions?: string;
  weight?: number;
  assemblyRequired?: boolean;
  category?: string;
  shortDescription?: string;
  longDescription?: string;
  emiAvailable?: boolean;
  emiStartingFrom?: number;
  additionalOffers?: string[];
  assemblyFee?: number;
  careAndMaintenance?: string;
  warrantyTerms?: string;
  productDetails?: Record<string, string>;
  specifications?: { key: string; value: string }[];
  marketingImages?: {
    fullBleed?: string;
    feature1?: string;
    feature2?: string;
  };
}

const fallbackProduct: ProductData = {
  _id: 'mock-premium-01',
  slug: 'miranda-chenille-fabric-3-seater-sofa',
  vendor: 'Woodsworth',
  title: 'Miranda Chenille Fabric 3 Seater Sofa In Charcoal Grey Colour',
  price: 47999,
  compareAtPrice: 61999,
  inventoryQuantity: 40,
  imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80',
  galleryImages: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=2400&auto=format&fit=crop&q=80'
  ],
  shortDescription: 'Experience a new level of sophistication and comfort, crafted specifically for your space.',
  longDescription: 'Crafted with premium materials and timeless aesthetics, this piece seamlessly integrates sophisticated craftsmanship with everyday comfort. Built to last with durable materials, high-density cushioning, and engineered stability for modern living.',
  emiAvailable: true,
  emiStartingFrom: 2305,
  additionalOffers: [
    'Sign-Up & Get Up to ₹1,500 off on Your First Purchase!',
  ],
  assemblyFee: 1399,
  productDetails: {
    'Brand': 'Woodsworth',
    'Assembly': 'Carpenter Assembly',
    'Dimensions': 'H 35 x W 79.7 x D 35.6 in',
    'Primary Material': 'Fabric',
    'Room Type': 'Living Room',
    'Sofa Firmness': 'Medium',
    'Weight': '54 KG',
  },
  specifications: [
    { key: 'Frame', value: 'Pine Wood & Commercial Grade Plywood' },
    { key: 'Upholstery', value: 'Fabric' },
    { key: 'Seating Mechanism', value: 'S Spring' },
    { key: 'Foam', value: 'PU Foam 32D' },
  ],
  careAndMaintenance: 'To protect your furniture from fading, avoid keeping your furniture next to windows and other places where it can be exposed to direct sunlight.\n\nCleaning your furniture items regularly will help you maintain them for a long time, make sure that you clean your furniture gently with a soft lightly damp cloth.',
  warrantyTerms: 'The warranty covers manufacturing/ workmanship and material defects that occur during the warranty period. The warranty applies to furniture used under normal household conditions.',
};

async function getProductById(id: string): Promise<ProductData | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/products/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data as ProductData;
        return {
          ...fallbackProduct,
          ...data,
          shortDescription: (data.shortDescription && data.shortDescription.trim()) || fallbackProduct.shortDescription,
          longDescription: (data.longDescription && data.longDescription.trim()) || fallbackProduct.longDescription || '',
          galleryImages: data.galleryImages?.length ? data.galleryImages : fallbackProduct.galleryImages,
          productDetails: data.productDetails && Object.keys(data.productDetails).length > 0 ? data.productDetails : fallbackProduct.productDetails,
          specifications: data.specifications?.length ? data.specifications : fallbackProduct.specifications,
        };
      }
    }
  } catch {}
  return fallbackProduct;
}

function getLocalIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const localIp = getLocalIp();
  const product = await getProductById(params.id);
  
  if (!product) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ProductPageClient product={product} localIp={localIp} />
    </Suspense>
  );
}
