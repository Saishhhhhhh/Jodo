import React from 'react';
// Trigger Vercel sync with latest environment variables
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { networkInterfaces } from 'os';
import { Star, ArrowLeft, ShieldCheck, MapPin, Tag, ChevronDown, CheckCircle2, Plus } from 'lucide-react';
import ProductActions from '@/components/ProductActions';
import ProductGallery from '@/components/ProductGallery';
import ProductARCard from '@/components/ProductARCard';

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
}

const fallbackProduct: ProductData = {
  _id: 'mock-premium-01',
  slug: 'miranda-chenille-fabric-3-seater-sofa',
  vendor: 'Woodsworth',
  title: 'Miranda Chenille Fabric 3 Seater Sofa In Charcoal Grey Colour',
  price: 47999,
  compareAtPrice: 61999,
  inventoryQuantity: 40,
  imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
  shortDescription: 'By Woodsworth',
  emiAvailable: true,
  emiStartingFrom: 2305,
  additionalOffers: [
    'Sign-Up & Get Up to ₹1,500 off on Your First Purchase!',
    'Extra Rs.1,000 Off on Purchase Above Rs.12,999!',
    'Get ₹1,750 off on ICICI Bank Credit Card EMI on minimum purchase of ₹15,000',
    'Get 5% off up to ₹10,000 on HDFC Bank Credit/Debit Card EMI'
  ],
  assemblyFee: 1399,
  productDetails: {
    'Brand': 'Woodsworth',
    'Assembly': 'Carpenter Assembly',
    'Collections': 'Miranda',
    'Dimensions (In Centimeters)': 'H 89 x W 202 x D 90',
    'Dimensions (in Inches)': 'H 35 x W 79.7 x D 35.6',
    'Primary Material': 'Fabric',
    'Product Rating': '4.5',
    'Room Type': 'Living Room',
    'Seating Height': '19',
    'Sofa Firmness': 'Medium',
    'Warranty': '36 Months Warranty',
    'Weight': '54 KG',
    'Sku': 'FM1745617-S-WH32456'
  },
  specifications: [
    { key: 'Frame', value: 'Pine Wood & Commercial Grade Plywood' },
    { key: 'Upholstery', value: 'Fabric' },
    { key: 'Thickness', value: '290' },
    { key: 'Seating Mechanism', value: 'S Spring' },
    { key: 'Foam', value: 'PU Foam 32D' },
    { key: 'Legs', value: 'Wooden Legs - Pine Wood; Middle Leg : Plastic' },
    { key: 'Firmness', value: 'Medium' }
  ],
  careAndMaintenance: 'To protect your furniture from fading, avoid keeping your furniture next to windows and other places where it can be exposed to direct sunlight.\n\nTo avoid minor scratches which may hamper the finish of your furniture avoid sliding or passing items placed on your tabletop.\n\nCleaning your furniture items regularly will help you maintain them for a long time, make sure that you clean your furniture gently with a soft lightly damp cloth.',
  warrantyTerms: 'The warranty covers manufacturing/ workmanship and material defects that occur during the warranty period. The warranty applies to furniture used under normal household conditions.\n\nThis limited warranty does not apply to:\n- Normal wear and tear\n- Cuts or scratches, or damage caused by impacts or accidents',
};

async function getProductById(id: string): Promise<ProductData | null> {
  try {
    const res = await fetch(`http://localhost:4000/api/storefront/products/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data as ProductData;
        return {
          ...fallbackProduct,
          ...data,
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

  const rating = parseFloat(product.productDetails?.['Product Rating'] || '4.5');
  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
    : 0;

  return (
    <div className="bg-white min-h-screen pb-20 pt-6 font-sans">
      <div className="max-w-[1250px] mx-auto px-5 md:px-10">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-14 items-start">
          
          {/* LEFT COLUMN: Gallery & Accordions */}
          <div className="flex flex-col gap-10">
            <ProductGallery 
              product={{
                _id: product._id,
                title: product.title,
                imageUrl: product.imageUrl,
                slug: product.slug || ''
              }} 
              localIp={localIp}
            />

            {/* Product Details Grid */}
            <div className="pt-8 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h3>
              <div className="grid grid-cols-2 gap-y-8 gap-x-8">
                {Object.entries(product.productDetails || {}).map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <span className="font-bold text-gray-700 text-[15px]">{key}</span>
                    <span className="text-gray-500 text-[15px]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accordions */}
            <div className="flex flex-col border-t border-gray-200 pt-4">
              {product.specifications && product.specifications.length > 0 && (
                <details className="group border-b border-gray-200" open>
                  <summary className="flex justify-between items-center font-bold cursor-pointer list-none py-5 text-xl text-gray-900">
                    <span>Specifications</span>
                    <span className="transition group-open:rotate-180"><ChevronDown className="w-5 h-5" /></span>
                  </summary>
                  <div className="pb-6 pt-2">
                    <div className="flex flex-col gap-4">
                      {product.specifications.map((spec, i) => (
                        <div key={i} className="text-[15px] text-gray-600">
                          <span className="font-medium text-gray-800">{spec.key} : </span>{spec.value}
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              )}

              {product.careAndMaintenance && (
                <details className="group border-b border-gray-200">
                  <summary className="flex justify-between items-center font-bold cursor-pointer list-none py-5 text-xl text-gray-900">
                    <span>Care & Maintenance</span>
                    <span className="transition group-open:rotate-180"><ChevronDown className="w-5 h-5" /></span>
                  </summary>
                  <div className="pb-6 pt-2 text-[15px] text-gray-600 whitespace-pre-line leading-relaxed">
                    {product.careAndMaintenance}
                  </div>
                </details>
              )}

              {product.warrantyTerms && (
                <details className="group border-b border-gray-200">
                  <summary className="flex justify-between items-center font-bold cursor-pointer list-none py-5 text-xl text-gray-900">
                    <span>Warranty</span>
                    <span className="transition group-open:rotate-180"><ChevronDown className="w-5 h-5" /></span>
                  </summary>
                  <div className="pb-6 pt-2 text-[15px] text-gray-600 whitespace-pre-line leading-relaxed">
                    {product.warrantyTerms}
                  </div>
                </details>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Buy Box (Premium Style) */}
          <div className="flex flex-col">
            
            {/* Title & Brand */}
            <h1 className="text-2xl md:text-[28px] leading-snug font-bold text-gray-900 mb-2">{product.title}</h1>
            <p className="text-sm text-gray-500 mb-3">{product.shortDescription}</p>
            
            {/* Ratings */}
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                {rating} <Star className="w-3 h-3 fill-white" />
              </span>
              <span className="text-xs font-medium text-gray-400">36-Month Warranty</span>
              <span className="text-xs font-bold text-blue-600 ml-2">Jodo assured</span>
            </div>

            {/* Price & EMI */}
            <div className="flex flex-col gap-1 mb-6">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-4xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                {product.compareAtPrice && (
                  <>
                    <div className="flex flex-col items-start pb-1">
                      <span className="text-xs text-gray-400 font-medium">MRP</span>
                      <span className="text-sm text-gray-400 line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="text-sm font-bold text-terracotta pb-1">({discountPercent}% Off)</span>
                  </>
                )}
              </div>
              
              {product.emiAvailable && (
                <div className="flex items-center text-sm bg-gray-50/80 rounded-md p-2 mt-2 w-fit">
                  <span className="text-gray-700 font-medium">EMI starting from <span className="font-bold">₹{product.emiStartingFrom?.toLocaleString('en-IN') || '2,305'}/mo</span></span>
                  <button className="text-blue-600 font-semibold ml-2 hover:underline">View Plans</button>
                </div>
              )}
            </div>

            {/* Additional Offers */}
            {product.additionalOffers && product.additionalOffers.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-terracotta" />
                  <span className="font-bold text-gray-900 text-sm">Additional Offers</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-4 max-h-[160px] overflow-y-auto flex flex-col gap-3">
                  {product.additionalOffers.map((offer, i) => (
                    <div key={i} className="text-xs text-gray-700 flex gap-2 leading-relaxed font-medium">
                      <div className="min-w-[6px] min-h-[6px] w-[6px] h-[6px] rounded-full bg-gray-300 mt-1.5" />
                      {offer}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery & Assembly */}
            <div className="mb-6 border border-gray-200 rounded-md overflow-hidden bg-white">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-sm text-gray-900">
                Delivery & Assembly Details
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-bold text-gray-800">400066, Mumbai</span>
                  </div>
                  <button className="text-terracotta text-sm font-bold uppercase tracking-wider">Change</button>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-bold text-gray-800">Delivery <span className="text-green-600">FREE</span> by Mon, 06 Jul 2026</p>
                  <p className="text-sm text-gray-600 font-medium">Assembly ₹{product.assemblyFee || '1399'} Offered By Jodo</p>
                </div>
              </div>
            </div>

            {/* Protect Your Furniture */}
            <div className="mb-6 border border-[#f5ede5] rounded-md bg-[#fffbfa] p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-terracotta" /> Protect Your Furniture
                </h4>
                <button className="text-blue-600 text-xs font-bold uppercase tracking-wider hover:underline">View Plans</button>
              </div>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed font-medium">
                Get fast, easy protection covering damage and defects outside warranty with instant claim approval
              </p>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> <span className="text-xs text-gray-700 font-medium">Protection from spills & damage</span>
              </div>
              <button className="w-full py-2.5 bg-white border border-terracotta text-terracotta text-sm font-bold rounded-md hover:bg-terracotta hover:text-white transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> ADD PLAN (₹2655)
              </button>
            </div>

            {/* Actions */}
            <ProductActions product={{
              id: product._id,
              title: product.title,
              price: product.price,
              imageUrl: product.imageUrl,
              brand: product.vendor
            }} />

            {/* AR Try-On QR/Button Card */}
            <ProductARCard 
              product={{
                slug: product.slug || '',
                title: product.title
              }} 
              localIp={localIp}
            />

            {/* Stores Near You */}
            <div className="border-t border-gray-200 pt-8">
              <h4 className="font-bold text-lg text-gray-900 mb-5">Stores Near You</h4>
              <div className="flex flex-col gap-5">
                <div className="border-b border-gray-100 pb-5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-[15px] text-gray-800">Jodo Studio Borivali</span>
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> 4 km</span>
                  </div>
                  <p className="text-[13px] text-gray-500 mb-2 font-medium leading-relaxed">Ground Floor, Kabra Rageshree, Himmat Nagar, Borivali West, Mumbai, Maharashtra 400091</p>
                  <p className="text-[13px] font-bold text-terracotta flex items-center gap-1">Call Now: 07941058688</p>
                </div>
                <div className="border-b border-gray-100 pb-5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-[15px] text-gray-800">Jodo Studio Malad</span>
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> 8 km</span>
                  </div>
                  <p className="text-[13px] text-gray-500 mb-2 font-medium leading-relaxed">Shop No.6, Bhagat Grandeur, Malad Link Road, Opp. Infiniti Mall, Malad West, Mumbai, Maharashtra 400064</p>
                  <p className="text-[13px] font-bold text-terracotta flex items-center gap-1">Call Now: 07948060738</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
