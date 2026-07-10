'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Box, Smartphone, QrCode, X, HelpCircle, AlertCircle } from 'lucide-react';

interface ProductGalleryProps {
  product: {
    _id: string;
    title: string;
    imageUrl: string;
    galleryImages?: string[];
    slug: string;
  };
  localIp: string;
}

// Map product slugs to corresponding posters in the VR public folder
const posterMapping: Record<string, string> = {
  'velvet-accent-sofa': '/vr/public/posters/designer-sofa.png',
  'modern-oak-dining-table': '/vr/public/posters/modern-coffee-table.png',
  'ergonomic-office-chair': '/vr/public/posters/premium-oak-chair.png',
  'industrial-bookshelf': '/vr/public/posters/luxury-bookshelf.png',
  'minimalist-nightstand': '/vr/public/posters/modern-coffee-table.png',
  'queen-size-platform-bed': '/vr/public/posters/designer-sofa.png',
  'outdoor-teak-lounge-chair': '/vr/public/posters/premium-oak-chair.png',
  'mid-century-tv-stand': '/vr/public/posters/modern-coffee-table.png',
  'luxury-marble-dining-table': '/vr/public/posters/ceramic-vase-set.png',
};

export default function ProductGallery({ product, localIp }: ProductGalleryProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(mobile);
  }, []);

  const posterUrl = posterMapping[product.slug] || '/vr/public/posters/thermos-hydration-bottle.png';
  const glbUrl = '/vr/public/models/thermos-hydration-bottle.glb';

  const resolveImgUrl = (url: string) => {
    if (url.startsWith('/')) {
      return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${url}`;
    }
    return url;
  };

  // Fallback to array with just the main image if galleryImages is not provided
  const images = (product.galleryImages && product.galleryImages.length > 0 
    ? product.galleryImages 
    : [product.imageUrl]).map(resolveImgUrl);

  // Construct mobile VR application URL
  const getVRUrl = () => {
    if (typeof window === 'undefined') return '';
    const hostname = window.location.hostname;
    if (process.env.NEXT_PUBLIC_VR_URL) {
      return `${process.env.NEXT_PUBLIC_VR_URL}/?product=${product.slug}&ar=true`;
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const ip = localIp || hostname;
      return `http://${ip}:3000/?product=${product.slug}&ar=true`;
    }
    return `https://jodo-ar-viewer.vercel.app/?product=${product.slug}&ar=true`;
  };

  const vrUrl = getVRUrl();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=000000&data=${encodeURIComponent(vrUrl)}`;

  const handleARClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isMobile) {
      window.open(vrUrl, '_blank');
    } else {
      setShowQRModal(true);
    }
  };

  if (!mounted) {
    return (
      <div className="relative w-full aspect-[3/4] md:aspect-square bg-gray-50 rounded-2xl overflow-hidden animate-pulse" />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Main Media Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((img, idx) => {
          const isFirst = idx === 0;
          return (
            <div 
              key={idx} 
              className={`relative bg-[#F9F6F0] rounded-2xl overflow-hidden group ${
                isFirst ? 'md:col-span-2 aspect-[4/5] md:aspect-[16/10]' : 'aspect-[4/5]'
              }`}
            >
              {isFirst && show3D ? (
                <div className="w-full h-full relative bg-white">
                  <model-viewer
                    src={glbUrl}
                    poster={posterUrl}
                    alt={`3D model of ${product.title}`}
                    ar
                    ar-scale="auto"
                    ar-modes="webxr scene-viewer quick-look"
                    camera-controls
                    auto-rotate
                    shadow-intensity="1"
                    exposure="1"
                    environment-image="neutral"
                    shadow-softness="0.5"
                    style={{ width: '100%', height: '100%', background: 'transparent' }}
                  >
                    <div slot="progress-bar" className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </model-viewer>
                  
                  {/* Close 3D Button */}
                  <button 
                    onClick={() => setShow3D(false)}
                    className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-sm hover:bg-black hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
                    <AlertCircle className="w-4 h-4 text-black" />
                    <span className="text-xs font-bold text-gray-900">Interactive 3D Demo</span>
                  </div>
                </div>
              ) : (
                <>
                  <Image
                    src={img}
                    alt={`${product.title} - Image ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                  {/* Overlay Gradient for better button visibility on first image */}
                  {isFirst && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}
                  
                  {/* Action Buttons on first image */}
                  {isFirst && (
                    <div className="absolute bottom-8 w-full flex flex-col sm:flex-row justify-center items-center gap-4 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-500 translate-y-4 sm:group-hover:translate-y-0 px-4">
                      <button 
                        onClick={() => setShow3D(true)} 
                        className="w-full sm:w-auto bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-full font-semibold text-sm shadow-lg hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 text-gray-900"
                      >
                        <Box className="w-4 h-4" /> View in 3D
                      </button>
                      <button 
                        onClick={handleARClick} 
                        className="w-full sm:w-auto bg-black/90 backdrop-blur-md px-6 py-3.5 rounded-full font-semibold text-sm shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-white"
                      >
                        <Smartphone className="w-4 h-4" /> Try in AR
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Desktop QR Code Modal for AR ── */}
      {showQRModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 flex flex-col items-center text-center">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-6">
              <QrCode className="w-6 h-6 text-black" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">View in your space</h3>
            <p className="text-gray-500 text-[15px] mb-8 leading-relaxed">
              Scan this QR code with your phone's camera to see how this item looks in your room.
            </p>

            <div className="relative p-4 bg-white rounded-2xl border border-gray-200 mb-8 shadow-sm">
              <img
                src={qrCodeUrl}
                alt="AR QR Code"
                width={200}
                height={200}
                className="rounded-xl"
              />
            </div>

            <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              Works on iOS (ARKit) and Android (ARCore)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
