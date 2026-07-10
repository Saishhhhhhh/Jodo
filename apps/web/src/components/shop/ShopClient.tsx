'use client';

import React, { useState, useMemo } from 'react';
import ProductCard from '../ProductCard';
import { Filter, X, ChevronDown, Check } from 'lucide-react';

interface ProductData {
  _id: string;
  title: string;
  vendor: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;
  inventoryQuantity: number;
  productDetails?: Record<string, string>;
  [key: string]: unknown;
}

interface ShopClientProps {
  initialProducts: ProductData[];
}

const PRICE_RANGES = [
  { label: 'Under ₹20,000', min: 0, max: 20000 },
  { label: '₹20,000 - ₹50,000', min: 20000, max: 50000 },
  { label: 'Over ₹50,000', min: 50000, max: Infinity },
];

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [assemblyRequired, setAssemblyRequired] = useState<boolean | null>(null);

  const fallbackProducts: ProductData[] = [
    {
      _id: '6a438dfe74b049d5bc53d522',
      title: 'Mid-Century TV Stand',
      vendor: 'RetroHome',
      price: 399,
      compareAtPrice: 599,
      imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 15,
      productDetails: { 'Room Type': 'Living Room' }
    },
    {
      _id: '6a438dfe74b049d5bc53d51f',
      title: 'Industrial Bookshelf',
      vendor: 'IronCraft',
      price: 349,
      compareAtPrice: 499,
      imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 8,
      productDetails: { 'Room Type': 'Study & Office' }
    },
    {
      _id: '6a438dfe74b049d5bc53d51b',
      title: 'Ergonomic Office Chair',
      vendor: 'ErgoMates',
      price: 199.5,
      compareAtPrice: 299,
      imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 24,
      productDetails: { 'Room Type': 'Study & Office' }
    },
    {
      _id: '6a438dfe74b049d5bc53d51e',
      title: 'Queen Size Platform Bed',
      vendor: 'SleepWell',
      price: 599,
      compareAtPrice: 899,
      imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 5,
      productDetails: { 'Room Type': 'Bedroom' }
    },
    {
      _id: '6a438dfe74b049d5bc53d51d',
      title: 'Minimalist Nightstand',
      vendor: 'Jodo Living',
      price: 145,
      compareAtPrice: 199,
      imageUrl: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 12,
      productDetails: { 'Room Type': 'Bedroom' }
    },
    {
      _id: '6a438dfe74b049d5bc53d51c',
      title: 'Velvet Accent Sofa',
      vendor: 'Plush Designs',
      price: 1450,
      compareAtPrice: 1950,
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 4,
      productDetails: { 'Room Type': 'Living Room' }
    },
    {
      _id: '6a438dfe74b049d5bc53d51a',
      title: 'Modern Oak Dining Table',
      vendor: 'Jodo Living',
      price: 899,
      compareAtPrice: 1299,
      imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 7,
      productDetails: { 'Room Type': 'Dining' }
    },
    {
      _id: '6a438dfe74b049d5bc53d521',
      title: 'Glass Top Coffee Table',
      vendor: 'ClearView',
      price: 249,
      compareAtPrice: 349,
      imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 10,
      productDetails: { 'Room Type': 'Living Room' }
    },
    {
      _id: '6a438dfe74b049d5bc53d523',
      title: 'Luxury Marble Dining Table',
      vendor: 'Jodo Premium',
      price: 2499,
      compareAtPrice: 3199,
      imageUrl: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 3,
      productDetails: { 'Room Type': 'Dining' }
    },
    {
      _id: 'furn-out-01',
      title: 'Outdoor Teak Lounge Chair',
      vendor: 'Jodo Outdoors',
      price: 499,
      compareAtPrice: 699,
      imageUrl: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop&q=80',
      ],
      inventoryQuantity: 9,
      productDetails: { 'Room Type': 'Outdoor' }
    }
  ];

  const displayProducts = initialProducts.length > 0 ? initialProducts : fallbackProducts;

  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    displayProducts.forEach(p => {
      const roomType = p.productDetails?.['Room Type'];
      if (roomType) {
        cats.add(roomType);
      } else if (p.category) {
        cats.add(p.category as string);
      }
    });
    if (cats.size === 0) return ['Furniture'];
    return Array.from(cats).sort();
  }, [displayProducts]);

  const dynamicVendors = useMemo(() => {
    const vendors = new Set<string>();
    displayProducts.forEach(p => {
      if (p.vendor) vendors.add(p.vendor);
    });
    return Array.from(vendors).sort();
  }, [displayProducts]);

  const dynamicMaterials = useMemo(() => {
    const materials = new Set<string>();
    displayProducts.forEach(p => {
      const mat = p.material || p.productDetails?.['Material'];
      if (mat) materials.add(mat as string);
    });
    return Array.from(materials).sort();
  }, [displayProducts]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleVendor = (v: string) => {
    setSelectedVendors(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const toggleMaterial = (m: string) => {
    setSelectedMaterials(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const filteredProducts = useMemo(() => {
    return displayProducts.filter(p => {
      // Stock Filter
      if (inStockOnly && p.inventoryQuantity <= 0) return false;

      // Price Filter
      if (selectedPriceRange) {
        const range = PRICE_RANGES.find(r => r.label === selectedPriceRange);
        if (range) {
          if (p.price < range.min || p.price > range.max) return false;
        }
      }

      // Vendor Filter
      if (selectedVendors.length > 0) {
        if (!p.vendor || !selectedVendors.includes(p.vendor)) return false;
      }

      // Material Filter
      if (selectedMaterials.length > 0) {
        const mat = p.material || p.productDetails?.['Material'];
        if (!mat || !selectedMaterials.includes(mat as string)) return false;
      }

      // Assembly Filter
      if (assemblyRequired !== null) {
        const requires = p.assemblyRequired || p.productDetails?.['Assembly Required'] === 'Yes';
        if (requires !== assemblyRequired) return false;
      }

      // Category Filter (Using Room Type from product details, or title fallback)
      if (selectedCategories.length > 0) {
        const roomType = p.productDetails?.['Room Type'];
        const matchesCategory = selectedCategories.some(cat => {
          if (roomType && roomType.toLowerCase().includes(cat.toLowerCase())) return true;
          if (p.title.toLowerCase().includes(cat.toLowerCase())) return true;
          return false;
        });
        if (!matchesCategory) return false;
      }

      return true;
    });
  }, [displayProducts, selectedCategories, selectedPriceRange, inStockOnly]);

  return (
    <div className="flex flex-col relative w-full">
      
      {/* Filter Toggle & Info Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsFiltersOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta/90 transition-colors text-white rounded-lg font-medium text-sm shadow-sm"
          >
            <Filter size={18} /> Filter Collection
          </button>
          <span className="font-medium text-gray-800 text-sm hidden sm:block">Showing {filteredProducts.length} Products</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer hover:text-terracotta">
          Sort by: <span className="text-gray-900 hidden sm:inline">Recommended</span> <ChevronDown size={16} />
        </div>
      </div>

      {/* Overlay Filters Drawer */}
      <aside className={`
        fixed inset-0 z-50 bg-black/40 backdrop-blur-sm
        transition-opacity duration-300
        ${isFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        <div 
          className="absolute inset-0" 
          onClick={() => setIsFiltersOpen(false)}
        />
        <div className={`
          absolute right-0 top-0 bottom-0 w-full max-w-[360px] bg-white
          transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          overflow-y-auto shadow-2xl flex flex-col
          ${isFiltersOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-10">
            <h2 className="text-2xl font-bold font-heading text-jodo-dark">Filters</h2>
            <button onClick={() => setIsFiltersOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 transition-colors rounded-full text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-8 p-6 flex-1">
            {/* Category Filter */}
            <div className="bg-white lg:p-6 lg:rounded-2xl lg:shadow-sm lg:border border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center justify-between">
                Categories
              </h3>
              <div className="space-y-3">
                {dynamicCategories.map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={selectedCategories.includes(cat)} 
                      onChange={() => toggleCategory(cat)} 
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                      ${selectedCategories.includes(cat) ? 'bg-terracotta border-terracotta' : 'border-gray-300 group-hover:border-terracotta'}
                    `}>
                      {selectedCategories.includes(cat) && <Check size={14} className="text-white" />}
                    </div>
                    <span className="text-gray-700 font-medium group-hover:text-terracotta transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white lg:p-6 lg:rounded-2xl lg:shadow-sm lg:border border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Price</h3>
              <div className="space-y-3">
                {PRICE_RANGES.map(range => (
                  <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                      <div className={`w-2.5 h-2.5 rounded-full transition-colors ${selectedPriceRange === range.label ? 'bg-terracotta' : 'bg-transparent'}`} />
                    </div>
                    <input 
                      type="radio" 
                      name="priceRange" 
                      className="hidden" 
                      checked={selectedPriceRange === range.label}
                      onChange={() => setSelectedPriceRange(selectedPriceRange === range.label ? null : range.label)}
                    />
                    <span className="text-gray-700 font-medium group-hover:text-terracotta transition-colors">{range.label}</span>
                  </label>
                ))}
                {selectedPriceRange && (
                  <button 
                    onClick={() => setSelectedPriceRange(null)}
                    className="text-sm text-terracotta font-semibold mt-2 hover:underline"
                  >
                    Clear Price Filter
                  </button>
                )}
              </div>
            </div>

            {/* Vendor Filter */}
            {dynamicVendors.length > 0 && (
              <div className="bg-white lg:p-6 lg:rounded-2xl lg:shadow-sm lg:border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center justify-between">
                  Brands
                </h3>
                <div className="space-y-3">
                  {dynamicVendors.map(vendor => (
                    <label key={vendor} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={selectedVendors.includes(vendor)} 
                        onChange={() => toggleVendor(vendor)} 
                      />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                        ${selectedVendors.includes(vendor) ? 'bg-terracotta border-terracotta' : 'border-gray-300 group-hover:border-terracotta'}
                      `}>
                        {selectedVendors.includes(vendor) && <Check size={14} className="text-white" />}
                      </div>
                      <span className="text-gray-700 font-medium group-hover:text-terracotta transition-colors">{vendor}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Material Filter */}
            {dynamicMaterials.length > 0 && (
              <div className="bg-white lg:p-6 lg:rounded-2xl lg:shadow-sm lg:border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center justify-between">
                  Materials
                </h3>
                <div className="space-y-3">
                  {dynamicMaterials.map(mat => (
                    <label key={mat} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={selectedMaterials.includes(mat)} 
                        onChange={() => toggleMaterial(mat)} 
                      />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                        ${selectedMaterials.includes(mat) ? 'bg-terracotta border-terracotta' : 'border-gray-300 group-hover:border-terracotta'}
                      `}>
                        {selectedMaterials.includes(mat) && <Check size={14} className="text-white" />}
                      </div>
                      <span className="text-gray-700 font-medium group-hover:text-terracotta transition-colors">{mat}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Assembly Filter */}
            <div className="bg-white lg:p-6 lg:rounded-2xl lg:shadow-sm lg:border border-gray-100">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-lg text-gray-900">Assembly Required</span>
                <div className={`relative w-11 h-6 rounded-full transition-colors ${assemblyRequired === true ? 'bg-terracotta' : 'bg-gray-300'}`}>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={assemblyRequired === true} 
                    onChange={() => setAssemblyRequired(assemblyRequired === true ? null : true)} 
                  />
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${assemblyRequired === true ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </label>
              {assemblyRequired === true && (
                <button 
                  onClick={() => setAssemblyRequired(null)}
                  className="text-sm text-terracotta font-semibold mt-2 hover:underline block"
                >
                  Clear Assembly Filter
                </button>
              )}
            </div>


            {/* Availability Filter */}
            <div className="bg-white lg:p-6 lg:rounded-2xl lg:shadow-sm lg:border border-gray-100">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-lg text-gray-900">In Stock Only</span>
                <div className={`relative w-11 h-6 rounded-full transition-colors ${inStockOnly ? 'bg-terracotta' : 'bg-gray-300'}`}>
                  <input type="checkbox" className="hidden" checked={inStockOnly} onChange={() => setInStockOnly(!inStockOnly)} />
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${inStockOnly ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </label>
            </div>
          </div>
          
          {/* Apply button at bottom of drawer */}
          <div className="p-6 border-t border-gray-100 sticky bottom-0 bg-white/95 backdrop-blur">
             <button 
                onClick={() => setIsFiltersOpen(false)}
                className="w-full py-3.5 bg-jodo-dark text-white rounded-xl font-semibold hover:bg-terracotta transition-colors shadow-lg"
             >
                Apply Filters
             </button>
          </div>
        </div>
      </aside>

      {/* Main Product Grid */}
      <main className="flex-1 w-full">

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <Filter size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">We couldn&apos;t find any products matching your current filters. Try adjusting your selections to see more results.</p>
            <button 
              onClick={() => {
                setSelectedCategories([]);
                setSelectedPriceRange(null);
                setInStockOnly(false);
              }}
              className="px-6 py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-terracotta transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => {
              // Convert ProductData to ProductCard's expected type
              const mappedProduct = {
                id: product._id,
                brand: product.productDetails?.['Brand'] || product.vendor || 'Premium',
                title: product.title,
                rating: parseFloat((product.productDetails as Record<string, string>)?.['Product Rating'] || '4.5'),
                reviews: 120, // Static mock reviews to prevent hydration mismatch
                price: product.price,
                imageUrl: product.imageUrl || `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80`
              };
              
              return <ProductCard key={mappedProduct.id} product={mappedProduct} />;
            })}
          </div>
        )}
      </main>
    </div>
  );
}
