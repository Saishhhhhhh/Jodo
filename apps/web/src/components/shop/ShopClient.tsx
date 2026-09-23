'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
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
  category?: string;
  material?: string;
  tags?: string[];
  assemblyRequired?: boolean;
  productDetails?: Record<string, string>;
  [key: string]: unknown;
}

interface ShopClientProps {
  initialProducts: ProductData[];
  initialCategory?: string;
}

const PRICE_RANGES = [
  { label: 'Under ₹20,000', min: 0, max: 20000 },
  { label: '₹20,000 - ₹50,000', min: 20000, max: 50000 },
  { label: 'Over ₹50,000', min: 50000, max: Infinity },
];

export default function ShopClient({ initialProducts, initialCategory }: ShopClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [assemblyRequired, setAssemblyRequired] = useState<boolean | null>(null);

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Recommended');

  const SORT_OPTIONS = [
    'Recommended',
    'Price: Low to High',
    'Price: High to Low',
    'Newest Arrivals'
  ];

  const fallbackProducts: ProductData[] = [
    {
      _id: 'furn-dt-01',
      title: 'Modern Oak Dining Table',
      vendor: 'Jodo Living',
      price: 899,
      compareAtPrice: 1299,
      category: 'Dining Room',
      imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 24,
      productDetails: { 'Room Type': 'Dining Room' }
    },
    {
      _id: 'furn-dt-02',
      title: 'Luxury Marble Dining Table',
      vendor: 'Jodo Premium',
      price: 2499,
      compareAtPrice: 3199,
      category: 'Dining Room',
      imageUrl: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 10,
      productDetails: { 'Room Type': 'Dining Room' }
    },
    {
      _id: 'furn-sofa-01',
      title: 'Velvet Accent Sofa',
      vendor: 'Plush Designs',
      price: 1450,
      compareAtPrice: 1950,
      category: 'Living Room',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 14,
      productDetails: { 'Room Type': 'Living Room' }
    },
    {
      _id: 'furn-tv-01',
      title: 'Mid-Century TV Stand',
      vendor: 'RetroHome',
      price: 399,
      compareAtPrice: 599,
      category: 'Living Room',
      imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 40,
      productDetails: { 'Room Type': 'Living Room' }
    },
    {
      _id: 'furn-bs-01',
      title: 'Industrial Bookshelf',
      vendor: 'IronCraft',
      price: 349,
      compareAtPrice: 499,
      category: 'Living Room',
      imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 30,
      productDetails: { 'Room Type': 'Living Room' }
    },
    {
      _id: 'furn-ct-01',
      title: 'Glass Top Coffee Table',
      vendor: 'ClearView',
      price: 249,
      compareAtPrice: 349,
      category: 'Living Room',
      imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 55,
      productDetails: { 'Room Type': 'Living Room' }
    },
    {
      _id: 'furn-bed-01',
      title: 'Queen Size Platform Bed',
      vendor: 'SleepWell',
      price: 599,
      compareAtPrice: 899,
      category: 'Bedroom',
      imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 18,
      productDetails: { 'Room Type': 'Bedroom' }
    },
    {
      _id: 'furn-ns-01',
      title: 'Minimalist Nightstand',
      vendor: 'Jodo Living',
      price: 145,
      compareAtPrice: 199,
      category: 'Bedroom',
      imageUrl: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 45,
      productDetails: { 'Room Type': 'Bedroom' }
    },
    {
      _id: 'furn-oc-01',
      title: 'Ergonomic Office Chair',
      vendor: 'ErgoMates',
      price: 199.5,
      compareAtPrice: 299,
      category: 'Office',
      imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80',
      inventoryQuantity: 85,
      productDetails: { 'Room Type': 'Office' }
    },
    {
      _id: 'furn-out-01',
      title: 'Outdoor Teak Lounge Chair',
      vendor: 'Jodo Outdoors',
      price: 499,
      compareAtPrice: 699,
      category: 'Outdoor',
      imageUrl: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=800&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop&q=80',
      ],
      inventoryQuantity: 20,
      productDetails: { 'Room Type': 'Outdoor' }
    }
  ];

  const displayProducts = initialProducts.length > 0 ? initialProducts : fallbackProducts;

  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    displayProducts.forEach(p => {
      if (p.category && typeof p.category === 'string') {
        cats.add(p.category.trim());
      }
      const roomType = p.productDetails?.['Room Type'];
      if (roomType && typeof roomType === 'string') {
        cats.add(roomType.trim());
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

  // Sync with URL query parameter ?category=...
  const queryCategory = searchParams.get('category') || initialCategory || '';

  useEffect(() => {
    if (!queryCategory || queryCategory.toLowerCase() === 'all' || queryCategory.toLowerCase() === 'furniture') {
      setSelectedCategories([]);
      return;
    }

    const q = queryCategory.toLowerCase().trim();

    if (q === 'mattresses' || q === 'mattress') {
      const match = dynamicCategories.find(c => c.toLowerCase().includes('mattress')) || 'Mattresses';
      setSelectedCategories([match]);
      return;
    }
    if (q === 'sofas' || q === 'sofa' || q === 'seating') {
      const match = dynamicCategories.find(c => c.toLowerCase().includes('sofa') || c.toLowerCase().includes('living')) || 'Living Room';
      setSelectedCategories([match]);
      return;
    }
    if (q === 'kitchen' || q === 'dining' || q === 'dining-room' || q === 'kitchen-dining' || q === 'kitchen-and-dining') {
      const match = dynamicCategories.find(c => c.toLowerCase().includes('dining') || c.toLowerCase().includes('kitchen')) || 'Dining Room';
      setSelectedCategories([match]);
      return;
    }
    if (q === 'bedroom') {
      const match = dynamicCategories.find(c => c.toLowerCase() === 'bedroom') || 'Bedroom';
      setSelectedCategories([match]);
      return;
    }
    if (q === 'living-room' || q === 'living') {
      const match = dynamicCategories.find(c => c.toLowerCase().includes('living')) || 'Living Room';
      setSelectedCategories([match]);
      return;
    }
    if (q === 'office' || q === 'study' || q === 'study-office' || q === 'study-and-office' || q === 'study-workspace') {
      const match = dynamicCategories.find(c => c.toLowerCase().includes('office') || c.toLowerCase().includes('study')) || 'Office';
      setSelectedCategories([match]);
      return;
    }
    if (q === 'outdoor') {
      const match = dynamicCategories.find(c => c.toLowerCase().includes('outdoor')) || 'Outdoor';
      setSelectedCategories([match]);
      return;
    }
    if (q === 'decor' || q === 'home-decor' || q === 'home decor') {
      const match = dynamicCategories.find(c => c.toLowerCase().includes('decor')) || 'Home Decor';
      setSelectedCategories([match]);
      return;
    }
    if (q === 'lighting' || q === 'lamps' || q === 'lamps-lighting') {
      const match = dynamicCategories.find(c => c.toLowerCase().includes('light') || c.toLowerCase().includes('lamp')) || 'Lamps & Lighting';
      setSelectedCategories([match]);
      return;
    }

    // Direct match against dynamicCategories
    const directMatch = dynamicCategories.find(
      c => c.toLowerCase() === q || c.toLowerCase().replace(/\s+/g, '-') === q
    );
    if (directMatch) {
      setSelectedCategories([directMatch]);
    } else {
      setSelectedCategories([queryCategory]);
    }
  }, [queryCategory, dynamicCategories]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => {
      const updated = prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat];
      
      const params = new URLSearchParams(searchParams.toString());
      if (updated.length === 1) {
        params.set('category', updated[0].toLowerCase().replace(/\s+/g, '-'));
      } else {
        params.delete('category');
      }
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl, { scroll: false });

      return updated;
    });
  };

  const toggleVendor = (v: string) => {
    setSelectedVendors(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const toggleMaterial = (m: string) => {
    setSelectedMaterials(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedVendors([]);
    setSelectedMaterials([]);
    setSelectedPriceRange(null);
    setInStockOnly(false);
    setAssemblyRequired(null);
    router.replace(pathname, { scroll: false });
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

      // Category Filter
      if (selectedCategories.length > 0) {
        const matchesCategory = selectedCategories.some(selectedCat => {
          const sCat = selectedCat.toLowerCase().trim();
          const pCat = (p.category as string || '').toLowerCase().trim();
          const roomType = (p.productDetails?.['Room Type'] || '').toLowerCase().trim();
          const title = (p.title || '').toLowerCase().trim();
          const tags = Array.isArray(p.tags) ? p.tags.map(t => String(t).toLowerCase()) : [];

          // Exact or substring match on Category
          if (pCat && (pCat === sCat || pCat.includes(sCat) || sCat.includes(pCat))) return true;

          // Match on Room Type
          if (roomType && (roomType === sCat || roomType.includes(sCat) || sCat.includes(roomType))) return true;

          // Mattress specific semantic matching
          if (sCat.includes('mattress')) {
            if (pCat.includes('mattress') || title.includes('mattress')) return true;
            return false;
          }

          // Sofa / Seating specific semantic matching
          if (sCat.includes('sofa') || sCat.includes('seating')) {
            if (title.includes('sofa') || title.includes('couch') || title.includes('lounge') || pCat.includes('sofa') || pCat.includes('seating')) return true;
            return false;
          }

          // Kitchen & Dining specific semantic matching
          if (sCat.includes('dining') || sCat.includes('kitchen')) {
            if (pCat.includes('dining') || roomType.includes('dining') || title.includes('dining') || title.includes('kitchen')) return true;
            return false;
          }

          // Home Decor specific semantic matching
          if (sCat.includes('decor')) {
            if (pCat.includes('decor') || roomType.includes('decor') || title.includes('rug') || title.includes('mirror') || title.includes('decor') || title.includes('vase')) return true;
            return false;
          }

          // Lamps & Lighting specific semantic matching
          if (sCat.includes('light') || sCat.includes('lamp')) {
            if (pCat.includes('light') || pCat.includes('lamp') || title.includes('lamp') || title.includes('light')) return true;
            return false;
          }

          // Direct title or tag match
          if (title.includes(sCat)) return true;
          if (tags.some(t => t.includes(sCat) || sCat.includes(t))) return true;

          return false;
        });

        if (!matchesCategory) return false;
      }

      return true;
    });
  }, [displayProducts, selectedCategories, selectedPriceRange, inStockOnly, selectedVendors, selectedMaterials, assemblyRequired]);

  const sortedProducts = useMemo(() => {
    const result = [...filteredProducts];
    switch (sortBy) {
      case 'Price: Low to High':
        return result.sort((a, b) => a.price - b.price);
      case 'Price: High to Low':
        return result.sort((a, b) => b.price - a.price);
      case 'Newest Arrivals':
        return result.reverse();
      case 'Recommended':
      default:
        return result;
    }
  }, [filteredProducts, sortBy]);

  const filterContent = (
    <div className="flex flex-col w-full h-full">
      {/* Category Filter */}
      <div className="py-5 border-b border-gray-100">
        <h3 className="font-bold text-[15px] text-black mb-4">Products Type</h3>
        <div className="space-y-4">
          {dynamicCategories.map(cat => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="hidden"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              <div className={`relative w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center border rounded-sm transition-colors ${
                selectedCategories.includes(cat) ? 'border-black bg-black' : 'border-gray-300 bg-white group-hover:border-gray-400'
              }`}>
                {selectedCategories.includes(cat) && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
              <span className={`text-[15px] flex-1 ${selectedCategories.includes(cat) ? 'font-semibold text-black' : 'text-gray-700'}`}>
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="py-5 border-b border-gray-100">
        <h3 className="font-bold text-[15px] text-black mb-4">Price</h3>
        <div className="space-y-4">
          {PRICE_RANGES.map(range => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center border border-gray-300 rounded-full bg-white">
                {selectedPriceRange === range.label && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
              </div>
              <input
                type="radio"
                name="priceRange"
                className="hidden"
                checked={selectedPriceRange === range.label}
                onChange={() => setSelectedPriceRange(selectedPriceRange === range.label ? null : range.label)}
              />
              <span className="text-[15px] text-black flex-1">{range.label}</span>
            </label>
          ))}
          {selectedPriceRange && (
            <button
              onClick={() => setSelectedPriceRange(null)}
              className="text-sm text-gray-500 font-medium mt-2 hover:underline"
            >
              Clear Price Filter
            </button>
          )}
        </div>
      </div>

      {/* Vendor Filter */}
      {dynamicVendors.length > 0 && (
        <div className="py-5 border-b border-gray-100">
          <h3 className="font-bold text-[15px] text-black mb-4">Manufacturer</h3>
          <div className="space-y-4">
            {dynamicVendors.map(vendor => (
              <label key={vendor} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedVendors.includes(vendor)}
                  onChange={() => toggleVendor(vendor)}
                />
                <div className={`relative w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center border rounded-sm transition-colors ${
                  selectedVendors.includes(vendor) ? 'border-black bg-black' : 'border-gray-300 bg-white group-hover:border-gray-400'
                }`}>
                  {selectedVendors.includes(vendor) && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-[15px] text-black flex-1">{vendor}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Material Filter */}
      {dynamicMaterials.length > 0 && (
        <div className="py-5 border-b border-gray-100">
          <h3 className="font-bold text-[15px] text-black mb-4">Material</h3>
          <div className="space-y-4">
            {dynamicMaterials.map(mat => (
              <label key={mat} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedMaterials.includes(mat)}
                  onChange={() => toggleMaterial(mat)}
                />
                <div className={`relative w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center border rounded-sm transition-colors ${
                  selectedMaterials.includes(mat) ? 'border-black bg-black' : 'border-gray-300 bg-white group-hover:border-gray-400'
                }`}>
                  {selectedMaterials.includes(mat) && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-[15px] text-black flex-1">{mat}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Assembly Filter */}
      <div className="py-5 border-b border-gray-100">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="font-bold text-[15px] text-black">Assembly Required</span>
          <div className={`relative w-11 h-6 rounded-full transition-colors ${assemblyRequired === true ? 'bg-black' : 'bg-gray-200'}`}>
            <input
              type="checkbox"
              className="hidden"
              checked={assemblyRequired === true}
              onChange={() => setAssemblyRequired(assemblyRequired === true ? null : true)}
            />
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${assemblyRequired === true ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </label>
      </div>

      {/* Availability Filter */}
      <div className="py-5 pb-8">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="font-bold text-[15px] text-black">In Stock Only</span>
          <div className={`relative w-11 h-6 rounded-full transition-colors ${inStockOnly ? 'bg-black' : 'bg-gray-200'}`}>
            <input type="checkbox" className="hidden" checked={inStockOnly} onChange={() => setInStockOnly(!inStockOnly)} />
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${inStockOnly ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row relative w-full gap-8 lg:gap-12 items-start mt-8 md:mt-12">

      {/* Desktop Inline Sidebar (Left) */}
      <aside className="hidden md:flex flex-col w-[240px] lg:w-[260px] flex-shrink-0 sticky top-40">
        <div className="flex-1 px-2 pb-6 hide-scrollbar">
          {filterContent}
          <div className="py-6">
            <button
              onClick={clearAllFilters}
              className="w-full py-3.5 bg-gray-50 text-gray-800 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Right on Desktop) */}
      <div className="flex-1 flex flex-col min-w-0 w-full">

        {/* Desktop Info & Sort Bar */}
        <div className="hidden md:flex items-center justify-between bg-transparent pb-6 mb-6 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-medium text-gray-500 text-sm">Showing {filteredProducts.length} Products</span>
            {selectedCategories.length > 0 && (
              <div className="flex items-center gap-2">
                {selectedCategories.map(cat => (
                  <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                    Category: {cat}
                    <button onClick={() => toggleCategory(cat)} className="hover:text-black transition-colors" aria-label={`Remove ${cat} filter`}>
                      <X size={13} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-terracotta hover:underline font-medium ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <div
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer hover:text-black transition-colors group"
            >
              Sort by: <span className="text-black font-semibold group-hover:text-black">{sortBy}</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Desktop Sort Dropdown */}
            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 py-2 z-50">
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setIsSortOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[15px] hover:bg-gray-50 flex items-center justify-between transition-colors"
                    >
                      <span className={`${sortBy === option ? 'font-semibold text-black' : 'text-gray-600'}`}>
                        {option}
                      </span>
                      {sortBy === option && <Check size={16} className="text-black" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Active Filter Bar */}
        {selectedCategories.length > 0 && (
          <div className="md:hidden flex items-center gap-2 flex-wrap mb-4 px-1">
            {selectedCategories.map(cat => (
              <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                {cat}
                <button onClick={() => toggleCategory(cat)} className="hover:text-black">
                  <X size={13} />
                </button>
              </span>
            ))}
            <button onClick={clearAllFilters} className="text-xs text-terracotta hover:underline font-medium">
              Clear
            </button>
          </div>
        )}

        {/* Mobile Sticky Filter/Sort Bar */}
        <div className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-[320px] z-40 bg-white rounded-full flex items-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden">
          <button
            onClick={() => setIsSortOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-gray-900 border-r border-gray-100 active:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 4 4 4-4" /><path d="M7 20V4" /><path d="m21 8-4-4-4 4" /><path d="M17 4v16" /></svg>
            Sort
          </button>
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-gray-900 active:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" /><line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" /><line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" /><line x1="2" x2="6" y1="14" y2="14" /><line x1="10" x2="14" y1="8" y2="8" /><line x1="18" x2="22" y1="16" y2="16" /></svg>
            Filter {selectedCategories.length > 0 && `(${selectedCategories.length})`}
          </button>
        </div>

        {/* Overlay Sort Drawer (Mobile Only) */}
        <aside className={`
          md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end items-end
          transition-opacity duration-300
          ${isSortOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
          <div
            className="absolute inset-0"
            onClick={() => setIsSortOpen(false)}
          />
          <div className={`
            relative w-full bg-white rounded-t-3xl
            transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            flex flex-col shadow-2xl
            ${isSortOpen ? 'translate-y-0' : 'translate-y-full'}
          `}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white">
              <h2 className="text-[17px] font-bold text-black">Sort by</h2>
              <button onClick={() => setIsSortOpen(false)} className="text-black hover:text-gray-600 transition-colors">
                <X strokeWidth={1.5} size={24} />
              </button>
            </div>
            <div className="flex-1 px-6 py-2 pb-safe">
              <div className="py-2">
                <div className="space-y-2">
                  {SORT_OPTIONS.map(option => (
                    <label key={option} className="flex items-center justify-between py-3 cursor-pointer group border-b border-gray-50 last:border-0">
                      <span className={`text-[15px] ${sortBy === option ? 'font-bold text-black' : 'text-gray-600'}`}>
                        {option}
                      </span>
                      <div className="relative w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-white">
                        {sortBy === option && <Check size={18} className="text-black" strokeWidth={3} />}
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        checked={sortBy === option}
                        onChange={() => {
                          setSortBy(option);
                          setIsSortOpen(false);
                        }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay Filters Drawer */}
        <aside className={`
          md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end items-end
          transition-opacity duration-300
          ${isFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
          <div
            className="absolute inset-0"
            onClick={() => setIsFiltersOpen(false)}
          />
          <div className={`
            relative w-full h-[90dvh] bg-white rounded-t-3xl
            transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            flex flex-col shadow-2xl
            ${isFiltersOpen ? 'translate-y-0' : 'translate-y-full'}
          `}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white">
              <h2 className="text-[17px] font-bold text-black">Filters</h2>
              <button onClick={() => setIsFiltersOpen(false)} className="text-black hover:text-gray-600 transition-colors">
                <X strokeWidth={1.5} size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2">
              {filterContent}
            </div>

            {/* Apply button at bottom of mobile drawer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white pb-safe flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-3.5 bg-gray-100 text-gray-800 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="flex-1 py-3.5 bg-[#1a1a1a] text-white rounded-xl font-medium hover:bg-black transition-colors text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Main Product Grid */}
        <main className="w-full">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-transparent rounded-2xl border border-gray-100 border-dashed text-center px-4 mt-8">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Filter size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">We couldn&apos;t find any products matching your current filters. Try adjusting your selections to see more results.</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {sortedProducts.map((product) => {
                const mappedProduct = {
                  id: product._id,
                  brand: (product.productDetails as Record<string, string>)?.['Brand'] || product.vendor || 'JODO',
                  title: product.title,
                  rating: parseFloat((product.productDetails as Record<string, string>)?.['Product Rating'] || '4.5'),
                  reviews: 120,
                  price: product.price,
                  imageUrl: product.imageUrl || `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80`
                };

                return <ProductCard key={mappedProduct.id} product={mappedProduct} />;
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
