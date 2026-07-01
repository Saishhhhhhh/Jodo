import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, ShoppingBag, ArrowLeft, Truck, Package, ShieldCheck, Ruler, Scale, Wrench } from 'lucide-react';

interface ProductData {
  _id: string;
  title: string;
  vendor: string;
  price: number;
  compareAtPrice?: number;
  inventoryQuantity: number;
  imageUrl: string;
  galleryImages?: string[];
  material?: string;
  dimensions?: string;
  weight?: number;
  assemblyRequired?: boolean;
  category?: string;
}

// Re-using the same fallback database snapshot from FeaturedProducts
const fallbackProducts: ProductData[] = [
  {
    _id: '6a438dfe74b049d5bc53d522',
    vendor: 'RetroHome',
    title: 'Mid-Century TV Stand',
    price: 399,
    inventoryQuantity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=80',
    material: 'Walnut Veneer',
    dimensions: '60 x 16 x 22 inches',
    weight: 80,
    assemblyRequired: true,
  },
  {
    _id: '6a438dfe74b049d5bc53d51f',
    vendor: 'IronCraft',
    title: 'Industrial Bookshelf',
    price: 349,
    inventoryQuantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&auto=format&fit=crop&q=80',
    material: 'Reclaimed Wood, Black Iron Pipes',
    dimensions: '48 x 12 x 72 inches',
    weight: 65.5,
    assemblyRequired: true,
  },
  {
    _id: '6a438dfe74b049d5bc53d51b',
    vendor: 'ErgoMates',
    title: 'Ergonomic Office Chair',
    price: 199.5,
    inventoryQuantity: 85,
    imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80',
    material: 'Mesh, Plastic, Metal Base',
    dimensions: '26 x 26 x 45 inches',
    weight: 35,
    assemblyRequired: true,
  },
  {
    _id: '6a438dfe74b049d5bc53d51e',
    vendor: 'SleepWell',
    title: 'Queen Size Platform Bed',
    price: 599,
    inventoryQuantity: 15,
    imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&auto=format&fit=crop&q=80',
    material: 'Upholstered Linen, Steel Frame',
    dimensions: '80 x 60 x 14 inches',
    weight: 75,
    assemblyRequired: true,
  },
  {
    _id: '6a438dfe74b049d5bc53d51d',
    vendor: 'Jodo Living',
    title: 'Minimalist Nightstand',
    price: 145,
    inventoryQuantity: 45,
    imageUrl: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&auto=format&fit=crop&q=80',
    material: 'Engineered Wood, Metal Hardware',
    dimensions: '18 x 15 x 24 inches',
    weight: 22,
    assemblyRequired: true,
  },
  {
    _id: '6a438dfe74b049d5bc53d51c',
    vendor: 'Plush Designs',
    title: 'Velvet Accent Sofa',
    price: 1450,
    inventoryQuantity: 10,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
    material: 'Velvet Fabric, Pine Wood Frame',
    dimensions: '84 x 35 x 32 inches',
    weight: 110,
    assemblyRequired: false,
  },
  {
    _id: '6a438dfe74b049d5bc53d51a',
    vendor: 'Jodo Living',
    title: 'Modern Oak Dining Table',
    price: 899,
    inventoryQuantity: 24,
    imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop&q=80',
    material: 'Solid Oak Wood',
    dimensions: '72 x 36 x 30 inches',
    weight: 120.5,
    assemblyRequired: true,
  },
  {
    _id: '6a438dfe74b049d5bc53d521',
    vendor: 'ClearView',
    title: 'Glass Top Coffee Table',
    price: 249,
    inventoryQuantity: 55,
    imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&auto=format&fit=crop&q=80',
    material: 'Tempered Glass, Chrome Base',
    dimensions: '40 x 40 x 18 inches',
    weight: 55,
    assemblyRequired: true,
  },
  {
    _id: '6a438dfe74b049d5bc53d523',
    vendor: 'Jodo Premium',
    title: 'Luxury Marble Dining Table',
    price: 2499,
    inventoryQuantity: 0,
    imageUrl: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800&auto=format&fit=crop&q=80',
    material: 'Carrara Marble, Brass Base',
    dimensions: '84 x 42 x 30 inches',
    weight: 350,
    assemblyRequired: true,
  },
  {
    _id: 'furn-out-01',
    vendor: 'Jodo Outdoors',
    title: 'Outdoor Teak Lounge Chair',
    price: 499,
    inventoryQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=800&auto=format&fit=crop&q=80',
    material: 'Solid Teak Wood',
    dimensions: '30 x 36 x 32 inches',
    weight: 45,
    assemblyRequired: false,
  }
];

async function getProductById(id: string): Promise<ProductData | null> {
  try {
    const res = await fetch(`http://localhost:4000/api/admin/products/${id}`, {
      cache: 'no-store'
    });
    
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as ProductData;
      }
    }
  } catch (error) {
    console.warn("Backend unavailable, falling back to database snapshot.");
  }
  
  // Fallback if DB is offline
  return fallbackProducts.find(p => p._id === id) || null;
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  // Assuming 4.5 average for all mock products as backend doesn't have rating yet
  const rating = 4.8;
  const reviews = 124;

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-[#FDB022] text-[#FDB022]' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="bg-[#FAF9F7] min-h-screen pb-20 pt-10 font-sans">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Featured
        </Link>

        {/* ── Main PDP Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* 1. Left Visuals */}
          <div className="flex flex-col gap-4 sticky top-10">
            <div className="relative w-full aspect-[4/5] lg:aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            
            {/* Mock Gallery Thumbnails (if backend adds multiple images later) */}
            <div className="grid grid-cols-4 gap-4">
              {[product.imageUrl, product.imageUrl].map((img, i) => (
                <div key={i} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${i === 0 ? 'border-black' : 'border-transparent hover:border-gray-200 cursor-pointer'} transition-colors`}>
                  <Image src={img} alt={`Gallery ${i}`} fill className="object-cover opacity-80 hover:opacity-100" unoptimized />
                </div>
              ))}
            </div>
          </div>

          {/* 2. Right Details */}
          <div className="flex flex-col pt-4 lg:pt-10">
            
            {/* Header */}
            <div className="mb-8">
              <p className="text-gray-500 font-bold tracking-widest uppercase text-xs mb-3">
                {product.vendor || 'Jodo Home'}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-[#111111] leading-tight mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                {product.title}
              </h1>
              
              {/* Reviews */}
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars()}</div>
                <span className="text-sm font-medium text-gray-600 underline cursor-pointer">{reviews} Reviews</span>
              </div>
            </div>

            <hr className="border-gray-200 mb-8" />

            {/* Pricing & Inventory */}
            <div className="mb-10">
              <div className="flex items-end gap-4 mb-3">
                <span className="text-4xl font-bold text-[#111111]">
                  ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xl text-gray-400 line-through mb-1">
                    ₹{product.compareAtPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
              
              <p className={`text-sm font-semibold flex items-center gap-1.5 ${product.inventoryQuantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                <span className={`w-2 h-2 rounded-full ${product.inventoryQuantity > 0 ? 'bg-green-600' : 'bg-red-500'}`}></span>
                {product.inventoryQuantity > 0 ? `${product.inventoryQuantity} in stock — Ready to ship` : 'Out of stock'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mb-12">
              <button 
                disabled={product.inventoryQuantity === 0}
                className="w-full bg-[#111111] hover:bg-[#222222] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-5 rounded-xl font-bold text-[16px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/5"
              >
                <ShoppingBag className="w-5 h-5" />
                {product.inventoryQuantity > 0 ? 'Add to Cart' : 'Sold Out'}
              </button>
            </div>

            {/* Features/Trust badges */}
            <div className="grid grid-cols-2 gap-4 mb-12">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <Truck className="w-6 h-6 text-gray-600" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Free Delivery</h4>
                  <p className="text-xs text-gray-500">Over ₹1000 orders</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-gray-600" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">5-Year Warranty</h4>
                  <p className="text-xs text-gray-500">Guaranteed quality</p>
                </div>
              </div>
            </div>

            {/* Admin Specifications Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-[#111111] mb-6">Product Specifications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                
                {product.material && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Package className="w-3 h-3" /> Material</span>
                    <span className="text-[#111111] font-medium text-[15px]">{product.material}</span>
                  </div>
                )}

                {product.dimensions && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Ruler className="w-3 h-3" /> Dimensions</span>
                    <span className="text-[#111111] font-medium text-[15px]">{product.dimensions}</span>
                  </div>
                )}

                {product.weight && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Scale className="w-3 h-3" /> Weight</span>
                    <span className="text-[#111111] font-medium text-[15px]">{product.weight} lbs</span>
                  </div>
                )}

                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Wrench className="w-3 h-3" /> Assembly</span>
                  <span className="text-[#111111] font-medium text-[15px]">{product.assemblyRequired ? 'Assembly Required' : 'Fully Assembled'}</span>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
