import { useEffect, useRef } from 'react';
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
      <div className="w-full bg-white px-4 md:px-8 py-6 border-b border-gray-100 flex items-center gap-4">
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-black p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>

        <div className="flex-1 flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-terracotta focus-within:shadow-sm transition-all p-1.5">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for mattress, beds, or sofas..."
            className="flex-1 bg-transparent px-4 py-2 md:py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none text-lg md:text-xl font-medium"
          />
          <button className="bg-terracotta p-3 rounded-lg text-white hover:opacity-90 transition-opacity flex items-center justify-center shadow-sm">
            <Search className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Main Content - 2 Columns */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT COLUMN: Trending & Popular Products */}
        <div className="flex-1 w-full lg:w-[60%] overflow-y-auto px-6 md:px-12 py-10 custom-scrollbar">
          
          {/* Trending Searches */}
          <div className="mb-12 animate-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Trending Searches</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {TRENDING_SEARCHES.map((term) => (
                <button
                  key={term}
                  className="px-4 py-2.5 rounded-md bg-terracotta/5 border border-terracotta/20 text-terracotta font-semibold text-[15px] flex items-center gap-2 hover:bg-terracotta/10 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" strokeWidth={2} />
                  {term}
                </button>
              ))}
            </div>
            <button className="text-terracotta font-semibold hover:underline text-[15px]">
              Show More...
            </button>
          </div>

          {/* Popular Products */}
          <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Popular Products</h3>
            <div className="flex flex-col gap-4">
              {POPULAR_PRODUCTS.map((product) => (
                <Link 
                  href={`/products/${product.id}`} 
                  key={product.id} 
                  className="group flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-terracotta/30 hover:shadow-md transition-all bg-white"
                >
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 pr-4">
                    <h4 className="text-[15px] font-medium text-gray-800 leading-snug line-clamp-2">{product.name}</h4>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-terracotta text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-right">
              <button className="text-terracotta font-semibold hover:underline text-[15px]">
                Show More
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Popular Categories */}
        <div className="w-full lg:w-[40%] bg-[#F8F5F2] overflow-y-auto px-6 md:px-12 py-10 border-l border-gray-200 custom-scrollbar">
          <h3 className="text-xl font-bold text-gray-900 mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
            Popular Categories
          </h3>
          
          <div className="flex flex-col gap-10">
            {POPULAR_CATEGORIES.map((category, idx) => (
              <div 
                key={category.title} 
                className="animate-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: `${400 + (idx * 100)}ms` }}
              >
                <h4 className="text-[17px] font-bold text-gray-900 mb-4">{category.title}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {category.items.map((item, index) => (
                    <Link href="/shop" key={index} className="group flex flex-col gap-2">
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100 group-hover:shadow-md transition-shadow">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <p className="text-[13px] text-gray-600 font-medium text-center leading-tight group-hover:text-terracotta transition-colors px-1">
                        {item.name}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
