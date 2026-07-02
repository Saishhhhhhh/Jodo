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

const CATEGORIES = ['Living Room', 'Bedroom', 'Dining', 'Study & Office', 'Outdoor'];
const PRICE_RANGES = [
  { label: 'Under ₹20,000', min: 0, max: 20000 },
  { label: '₹20,000 - ₹50,000', min: 20000, max: 50000 },
  { label: 'Over ₹50,000', min: 50000, max: Infinity },
];

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Derive products from the mock if DB is empty, for a good initial experience
  const fallbackProducts: ProductData[] = Array(8).fill(null).map((_, i) => ({
    _id: `mock-${i}`,
    title: `Premium Fabric Sofa ${i + 1}`,
    vendor: 'Woodsworth',
    price: 47999,
    compareAtPrice: 61999,
    imageUrl: `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80`,
    inventoryQuantity: 10,
    productDetails: {
      'Room Type': 'Living Room'
    }
  }));

  const displayProducts = initialProducts.length > 0 ? initialProducts : fallbackProducts;

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
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
    <div className="flex flex-col lg:flex-row gap-8 relative">
      
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
        <span className="font-medium text-gray-800">{filteredProducts.length} Products</span>
        <button 
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#B65A45] text-white rounded-md font-medium text-sm"
        >
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Sidebar Filters */}
      <aside className={`
        fixed inset-0 z-50 bg-black/50 lg:bg-transparent lg:static lg:block
        transition-opacity duration-300 lg:w-[280px] shrink-0
        ${isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}
      `}>
        <div className={`
          absolute right-0 top-0 bottom-0 w-[300px] bg-white lg:bg-transparent lg:w-full lg:static
          transform transition-transform duration-300 ease-in-out p-6 lg:p-0
          overflow-y-auto lg:overflow-visible
          ${isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between lg:hidden mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-8 lg:sticky lg:top-28">
            {/* Category Filter */}
            <div className="bg-white lg:p-6 lg:rounded-2xl lg:shadow-sm lg:border border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center justify-between">
                Categories
              </h3>
              <div className="space-y-3">
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={selectedCategories.includes(cat)} 
                      onChange={() => toggleCategory(cat)} 
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                      ${selectedCategories.includes(cat) ? 'bg-[#B65A45] border-[#B65A45]' : 'border-gray-300 group-hover:border-[#B65A45]'}
                    `}>
                      {selectedCategories.includes(cat) && <Check size={14} className="text-white" />}
                    </div>
                    <span className="text-gray-700 font-medium group-hover:text-[#B65A45] transition-colors">{cat}</span>
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
                      <div className={`w-2.5 h-2.5 rounded-full transition-colors ${selectedPriceRange === range.label ? 'bg-[#B65A45]' : 'bg-transparent'}`} />
                    </div>
                    <input 
                      type="radio" 
                      name="priceRange" 
                      className="hidden" 
                      checked={selectedPriceRange === range.label}
                      onChange={() => setSelectedPriceRange(selectedPriceRange === range.label ? null : range.label)}
                    />
                    <span className="text-gray-700 font-medium group-hover:text-[#B65A45] transition-colors">{range.label}</span>
                  </label>
                ))}
                {selectedPriceRange && (
                  <button 
                    onClick={() => setSelectedPriceRange(null)}
                    className="text-sm text-[#B65A45] font-semibold mt-2 hover:underline"
                  >
                    Clear Price Filter
                  </button>
                )}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="bg-white lg:p-6 lg:rounded-2xl lg:shadow-sm lg:border border-gray-100">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-lg text-gray-900">In Stock Only</span>
                <div className={`relative w-11 h-6 rounded-full transition-colors ${inStockOnly ? 'bg-[#B65A45]' : 'bg-gray-300'}`}>
                  <input type="checkbox" className="hidden" checked={inStockOnly} onChange={() => setInStockOnly(!inStockOnly)} />
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${inStockOnly ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Product Grid */}
      <main className="flex-1">
        <div className="hidden lg:flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <span className="font-medium text-gray-600">Showing <strong className="text-gray-900">{filteredProducts.length}</strong> Products</span>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer hover:text-[#B65A45]">
            Sort by: <span className="text-gray-900">Recommended</span> <ChevronDown size={16} />
          </div>
        </div>

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
              className="px-6 py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-[#B65A45] transition-colors"
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
                rating: parseFloat((product.productDetails as any)?.['Product Rating'] || '4.5'),
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
