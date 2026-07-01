import { useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRENDING_SEARCHES = [
  'Nike Air Max',
  'Adidas Ultraboost',
  'Puma RS-X',
  'Oversized T-Shirts',
  'Summer Collection'
];

const SUGGESTED_PRODUCTS = [
  {
    id: 1,
    name: 'Nike Dunk Low Retro',
    brand: 'Nike',
    price: '$110',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Adidas Samba OG',
    brand: 'Adidas',
    price: '$100',
    image: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'New Balance 550',
    brand: 'New Balance',
    price: '$120',
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 4,
    name: 'Nike Air Force 1',
    brand: 'Nike',
    price: '$115',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop'
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
    <div className="fixed inset-0 z-[100] flex flex-col bg-white/95 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 lg:top-10 lg:right-10 p-2 text-gray-500 hover:text-black hover:rotate-90 transition-all duration-300"
        aria-label="Close search"
      >
        <X className="w-8 h-8" strokeWidth={1.5} />
      </button>

      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-20 lg:py-32 overflow-y-auto">
        {/* Search Input Area */}
        <div className="relative w-full group animate-in slide-in-from-top-4 duration-500 delay-100 fill-mode-both">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 text-gray-400 group-focus-within:text-terracotta transition-colors" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for products, brands..."
            className="w-full bg-transparent border-b-2 border-gray-200 py-6 pl-12 lg:pl-16 text-3xl lg:text-5xl font-light text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-terracotta transition-colors"
          />
        </div>

        {/* Content Area */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Trending Searches */}
          <div className="lg:col-span-4 animate-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-terracotta" strokeWidth={2} />
              <h3 className="text-lg font-medium text-gray-900 uppercase tracking-wider">Trending Searches</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {TRENDING_SEARCHES.map((term) => (
                <button
                  key={term}
                  className="px-5 py-2.5 rounded-full bg-gray-100 text-sm font-medium text-gray-700 hover:bg-terracotta hover:text-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Products */}
          <div className="lg:col-span-8 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
            <h3 className="text-lg font-medium text-gray-900 uppercase tracking-wider mb-6">Suggested Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {SUGGESTED_PRODUCTS.map((product) => (
                <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
                  <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-terracotta tracking-wider uppercase">{product.brand}</p>
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-terracotta transition-colors">{product.name}</h4>
                    <p className="text-sm text-gray-500">{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
