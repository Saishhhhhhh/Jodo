'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Box, Smartphone, X, ChevronRight, Info, Plus } from 'lucide-react';
import ProductActions from '@/components/ProductActions';

interface ProductPageClientProps {
  product: any;
  localIp: string;
}

export default function ProductPageClient({ product, localIp }: ProductPageClientProps) {
  const [showModal, setShowModal] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const resolveImgUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('/')) return `http://localhost:4000${url}`;
    return url;
  };

  const images = (product.galleryImages && product.galleryImages.length > 0 
    ? product.galleryImages 
    : [product.imageUrl]).map(resolveImgUrl);

  const [showQRModal, setShowQRModal] = useState(false);

  const handleARClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setShowQRModal(true);
    } else {
      setShow3D(true);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* ── Sticky Top Nav (Appears on scroll) ── */}
      <div className={`fixed top-0 left-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300 transform ${isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-gray-900 hidden md:block">{product.title}</h2>
            <span className="text-lg font-medium text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex-shrink-0 scale-90 md:scale-100 origin-right">
            <ProductActions product={{ id: product._id, title: product.title, price: product.price, imageUrl: product.imageUrl, brand: product.vendor }} />
          </div>
        </div>
      </div>

      {/* ── Minimal Top Nav ── */}
      <div className="absolute top-0 left-0 w-full z-30 p-6 flex justify-between items-center mix-blend-difference text-white">
        <Link href="/" className="inline-flex items-center text-sm font-medium hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Shop
        </Link>
      </div>

      {/* ── 1. Massive Hero Image ── */}
      <div className="relative w-full h-[85vh] md:h-[95vh] bg-[#f7f5f2]">
        {show3D ? (
          <div className="w-full h-full relative">
            <model-viewer
              src={product.model3dUrl || '/vr/public/models/thermos-hydration-bottle.glb'}
              alt={`3D model`}
              ar
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: '100%', height: '100%' }}
            ></model-viewer>
            <button onClick={() => setShow3D(false)} className="absolute top-8 right-8 z-50 bg-black/50 text-white backdrop-blur-md p-3 rounded-full hover:bg-black">
              <X className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <Image src={images[0]} alt={product.title} fill className="object-cover" unoptimized priority />
        )}
      </div>

      {/* ── 2. Clean Centered Buy Section ── */}
      <div className="max-w-[800px] mx-auto px-5 py-24 flex flex-col items-center text-center">
        <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">{product.vendor}</span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-gray-900 leading-tight tracking-tight mb-6">
          {product.title}
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed font-light">
          {product.shortDescription || 'Experience a new level of sophistication and comfort, crafted specifically for your space.'}
        </p>
        
        <div className="flex items-center gap-6 mb-12">
          <span className="text-4xl font-medium text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          {product.compareAtPrice && (
            <span className="text-xl text-gray-400 line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-8">
          <div className="w-full h-14 [&>div]:h-full [&_button]:h-full [&_button]:rounded-full [&_button]:text-lg">
            <ProductActions product={{ id: product._id, title: product.title, price: product.price, imageUrl: product.imageUrl, brand: product.vendor }} />
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setShow3D(true)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <Box className="w-5 h-5" /> View in 3D
          </button>
          <button onClick={handleARClick} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <Smartphone className="w-5 h-5" /> AR Try-on
          </button>
        </div>

        {/* View Details Trigger */}
        <button 
          onClick={() => setShowModal(true)}
          className="mt-16 flex items-center justify-between w-full max-w-lg border-b border-gray-200 pb-4 text-left group hover:border-gray-900 transition-colors"
        >
          <span className="text-lg font-medium text-gray-900">View detailed specifications</span>
          <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
        </button>
      </div>

      {/* ── 3. Uninterrupted Image Flow ── */}
      <div className="w-full flex flex-col">
        {images.slice(1).map((img: string, idx: number) => (
          <div key={idx} className="relative w-full h-[70vh] md:h-[100vh]">
            <Image src={img} alt={`Lifestyle ${idx + 1}`} fill className="object-cover" unoptimized />
          </div>
        ))}
      </div>

      {/* ── Hidden Details Modal (Drawer style) ── */}
      <div className={`fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${showModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowModal(false)}>
        <div className={`w-full max-w-md h-full bg-white shadow-2xl p-8 md:p-12 flex flex-col overflow-y-auto transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${showModal ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-medium text-gray-900">Details</h3>
            <button onClick={() => setShowModal(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-10">
            {product.productDetails && Object.keys(product.productDetails).length > 0 && (
              <div>
                <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">Overview</h4>
                <div className="flex flex-col gap-4">
                  {Object.entries(product.productDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-gray-100 pb-4">
                      <span className="text-sm text-gray-500">{key}</span>
                      <span className="text-sm font-medium text-gray-900 text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.specifications && product.specifications.length > 0 && (
              <div>
                <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">Materials & Build</h4>
                <div className="flex flex-col gap-4">
                  {product.specifications.map((spec: any, i: number) => (
                    <div key={i} className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                      <span className="text-sm text-gray-500">{spec.key}</span>
                      <span className="text-sm font-medium text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(product.careAndMaintenance || product.warrantyTerms) && (
              <div>
                <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">Care & Warranty</h4>
                {product.careAndMaintenance && (
                  <div className="mb-6">
                    <span className="text-sm font-medium text-gray-900 block mb-2">Care Instructions</span>
                    <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{product.careAndMaintenance}</p>
                  </div>
                )}
                {product.warrantyTerms && (
                  <div>
                    <span className="text-sm font-medium text-gray-900 block mb-2">Warranty</span>
                    <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{product.warrantyTerms}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── AR QR Code Modal for Desktop ── */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${showQRModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowQRModal(false)}>
        <div className={`bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl transform transition-transform duration-300 ${showQRModal ? 'scale-100' : 'scale-95'}`} onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-gray-900">AR Try-on</h3>
            <button onClick={() => setShowQRModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              {typeof window !== 'undefined' && (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`}
                  alt="QR Code" 
                  className="w-48 h-48"
                />
              )}
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Scan with your phone</h4>
            <p className="text-sm text-gray-500 mb-6">
              Open your phone's camera and scan this QR code to view this product in your space using Augmented Reality.
            </p>
            <button 
              onClick={() => setShowQRModal(false)}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
