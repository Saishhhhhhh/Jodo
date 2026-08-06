import { useEffect, useRef, useState } from 'react';
import { Search, TrendingUp, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRENDING_SEARCHES = [
  'Wardrobe',
  'Sofa cum bed',
  'Sofa',
  'Office Chair'
];

const POPULAR_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Wakefit Duo Plus Rebonded Mattress',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-2',
    name: 'Sleeping Pillow | Set of 2 | Height Adjustable | Standard Size 27X16 inch | Soft & Fluffy | Free Extra Filling 300 Grms | White & Grey',
    image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-3',
    name: 'Sleeping Pillow | Set of 4 | Height Adjustable | Standard Size 27X16 inch | Soft & Fluffy | Free Extra Filling 600 Gms | White & Grey',
    image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&auto=format&fit=crop&q=80'
  }
];

const POPULAR_CATEGORIES = [
  {
    title: 'Mattress',
    items: [
      { name: 'Wakefit Mattress', image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&auto=format&fit=crop&q=80' },
      { name: 'Wakefit Plus Mattress', image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&auto=format&fit=crop&q=80' },
      { name: 'Mattress Protector', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&auto=format&fit=crop&q=80' },
      { name: 'Dual Comfort Mattress', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&auto=format&fit=crop&q=80' }
    ]
  },
  {
    title: 'Beds',
    items: [
      { name: 'Engineered Wood Bed', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&auto=format&fit=crop&q=80' },
      { name: 'Sheesham Wood Bed', image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=400&auto=format&fit=crop&q=80' },
      { name: 'Teak Bed', image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&auto=format&fit=crop&q=80' },
      { name: 'Metal Bed', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&auto=format&fit=crop&q=80' }
    ]
  },
  {
    title: 'Sofas',
    items: [
      { name: 'Recliners', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=80' },
      { name: 'Leatherette Sofa', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&auto=format&fit=crop&q=80' },
      { name: '3 Seater Sofa', image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400&auto=format&fit=crop&q=80' },
      { name: 'Sofa Cum Bed', image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&auto=format&fit=crop&q=80' }
    ]
  }
];

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 0) {
        setIsLoading(true);
        setHasSearched(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/storefront/search?q=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setResults(data.data);
            }
          })
          .finally(() => setIsLoading(false));
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden animate-in fade-in duration-300">
      
      {/* Top Search Bar */}
      <div className="w-full bg-white px-4 md:px-8 py-3 md:py-5 border-b border-gray-200 flex items-center gap-3 md:gap-4">
        <button 
          onClick={onClose}
          className="text-gray-600 bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="flex-1 max-w-[1440px] mx-auto flex items-center border-2 border-terracotta rounded-lg overflow-hidden bg-white shadow-sm p-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for 'sofas under 15000 rs' or keywords..."
            className="flex-1 bg-transparent px-4 py-2 text-gray-800 placeholder:text-gray-400 focus:outline-none text-[16px] font-medium"
          />
          <button className="bg-terracotta p-2.5 rounded-md text-white hover:bg-terracotta/90 transition-colors flex items-center justify-center">
            <Search className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Main Content - 2 Columns or Search Results */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1500px] mx-auto w-full">
        
        {hasSearched ? (
          <div className="w-full h-full overflow-y-auto px-6 md:px-12 py-10 custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[20px] font-bold text-[#1C1A17]">
                Search Results for <span className="text-terracotta">"{query}"</span>
              </h3>
              {isLoading && <div className="text-sm text-gray-500 animate-pulse">Searching intelligently...</div>}
            </div>

            {results.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <h4 className="text-lg font-bold text-gray-700 mb-2">No products found</h4>
                <p className="text-gray-500 max-w-md">Try searching for broader terms or adjusting your price filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map((product) => (
                  <Link 
                    href={`/products/${product._id}`} 
                    key={product._id} 
                    onClick={onClose}
                    className="group flex flex-col gap-3"
                  >
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 shadow-sm border border-gray-100 group-hover:border-terracotta/40 transition-colors">
                      <Image
                        src={product.imageUrl ? (product.imageUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${product.imageUrl}` : product.imageUrl) : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-terracotta font-bold uppercase tracking-wider mb-1">{product.category}</p>
                      <h4 className="text-[14px] font-bold text-gray-800 leading-tight group-hover:text-terracotta transition-colors line-clamp-2">
                        {product.title}
                      </h4>
                      <p className="text-[15px] font-extrabold text-[#1C1A17] mt-2">₹{product.price.toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* LEFT COLUMN: Trending & Popular Products */}
            <div className="flex-1 w-full lg:w-[60%] overflow-y-auto px-4 py-6 md:px-12 md:py-10 custom-scrollbar">
              
              {/* Trending Searches */}
              <div className="mb-12 animate-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                <h3 className="text-[18px] font-bold text-[#1C1A17] mb-5">Trending Searches</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 rounded-md bg-[#FFF9F7] border border-[#F2C5B6] text-terracotta font-semibold text-[13px] flex items-center gap-2 hover:bg-[#FCECE6] transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                      {term}
                    </button>
                  ))}
                </div>
                <button className="text-terracotta font-bold hover:underline text-[13px]">
                  Show More...
                </button>
              </div>

              {/* Popular Products */}
              <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both hidden md:block">
                <h3 className="text-[18px] font-bold text-[#1C1A17] mb-5">Popular Products</h3>
                <div className="flex flex-col gap-3">
                  {POPULAR_PRODUCTS.map((product) => (
                    <Link 
                      href={`/products/${product.id}`} 
                      key={product.id} 
                      onClick={onClose}
                      className="group flex items-center gap-5 p-3 border border-gray-100 rounded-xl hover:border-terracotta/40 hover:shadow-sm transition-all bg-white"
                    >
                      <div className="relative w-[80px] h-[80px] bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 pr-4">
                        <h4 className="text-[13px] font-medium text-gray-700 leading-snug">{product.name}</h4>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-terracotta text-white flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[#a34c32] transition-colors mr-2">
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <button className="text-terracotta font-bold hover:underline text-[13px]">
                    Show More
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Popular Categories */}
            <div className="hidden lg:block w-full lg:w-[40%] bg-[#F5F5F5] overflow-y-auto px-6 md:px-12 py-10 border-l border-gray-200 custom-scrollbar">
              <h3 className="text-[18px] font-bold text-[#1C1A17] mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
                Popular Categories
              </h3>
              
              <div className="flex flex-col gap-10">
                {POPULAR_CATEGORIES.map((category, idx) => (
                  <div 
                    key={category.title} 
                    className="animate-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                    style={{ animationDelay: `${400 + (idx * 100)}ms` }}
                  >
                    <h4 className="text-[15px] font-bold text-[#1C1A17] mb-4">{category.title}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {category.items.map((item, index) => (
                        <Link href="/shop" key={index} onClick={onClose} className="group flex flex-col gap-2">
                          <div className="relative w-full aspect-[4/5] md:aspect-square rounded-[14px] overflow-hidden bg-white shadow-sm group-hover:shadow-md transition-all">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <p className="text-[12px] text-gray-700 font-semibold text-center leading-tight group-hover:text-terracotta transition-colors px-1 mt-1">
                            {item.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
