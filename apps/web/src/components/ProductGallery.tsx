'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Box, Smartphone, QrCode, X, HelpCircle, AlertCircle } from 'lucide-react';

interface ProductGalleryProps {
  product: {
    _id: string;
    title: string;
    imageUrl: string;
    slug: string;
  };
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

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [activeMedia, setActiveMedia] = useState<'image' | '3d'>('image');
  const [showQRModal, setShowQRModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simple mobile detection
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(mobile);
  }, []);

  const posterUrl = posterMapping[product.slug] || '/vr/public/posters/thermos-hydration-bottle.png';
  // Use the actual thermos bottle model as the interactive 3D model demo for all products
  const glbUrl = '/vr/public/models/thermos-hydration-bottle.glb';

  // Construct mobile VR application URL
  const getVRUrl = () => {
    if (typeof window === 'undefined') return '';
    const hostname = window.location.hostname;
    // The VR Next.js app runs on port 3000
    return `http://${hostname}:3000/?product=${product.slug}&ar=true`;
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=b65a45&data=${encodeURIComponent(getVRUrl())}`;

  if (!mounted) {
    return (
      <div className="relative w-full aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden border border-gray-100 animate-pulse" />
    );
  }

  return (
    <div className="flex flex-col gap-4 relative">
      {/* ── Main Media Viewer ── */}
      <div className="relative w-full aspect-[4/3] bg-[#F9F6F0] rounded-xl overflow-hidden border border-gray-100 shadow-sm">
        {activeMedia === 'image' ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full relative">
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
              {/* Custom AR Button */}
              <button
                type="button"
                slot="ar-button"
                onClick={(e) => {
                  if (!isMobile) {
                    e.preventDefault();
                    setShowQRModal(true);
                  }
                }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full bg-[#B65A45] hover:bg-[#a04e3b] px-5 py-3 text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-95 text-xs sm:text-sm"
              >
                <Smartphone className="h-4 w-4" />
                View in My Room (AR)
              </button>
            </model-viewer>

            {/* Note badge */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
              <AlertCircle className="w-3.5 h-3.5 text-[#B65A45]" />
              <span className="text-[10px] font-bold text-gray-700">Demo Model Loaded</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Thumbnails & Toggles ── */}
      <div className="flex gap-3 items-center">
        {/* Photo Thumbnail */}
        <button
          onClick={() => setActiveMedia('image')}
          className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
            activeMedia === 'image' ? 'border-[#B65A45] scale-95 shadow-sm' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Image
            src={product.imageUrl}
            alt="Product Photo"
            fill
            className="object-cover"
            unoptimized
          />
        </button>

        {/* 3D Model Thumbnail */}
        <button
          onClick={() => setActiveMedia('3d')}
          className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all bg-[#F5EFE6] flex flex-col items-center justify-center gap-1 ${
            activeMedia === '3d' ? 'border-[#B65A45] scale-95 shadow-sm' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Box className={`w-6 h-6 ${activeMedia === '3d' ? 'text-[#B65A45]' : 'text-gray-500'}`} />
          <span className="text-[10px] font-bold tracking-wider uppercase">3D & AR</span>
        </button>
      </div>

      {/* ── Desktop QR Code Modal for AR ── */}
      {showQRModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-[#fcf5f2] flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-[#B65A45]" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Scan to View in Your Room</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              Scan this QR code with your mobile camera to launch the interactive augmented reality try-on experience.
            </p>

            {/* QR Code Container */}
            <div className="relative w-[250px] h-[250px] bg-[#fcf8f5] p-3 rounded-2xl border border-dashed border-[#B65A45]/30 mb-6 flex items-center justify-center">
              <img
                src={qrCodeUrl}
                alt="AR QR Code"
                width={250}
                height={250}
                className="rounded-lg shadow-sm"
              />
            </div>

            {/* Steps */}
            <div className="w-full text-left space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
              <div className="flex gap-2">
                <span className="w-5 h-5 bg-[#B65A45] text-white rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                <p className="text-gray-700 font-medium">Open your smartphone's built-in camera app.</p>
              </div>
              <div className="flex gap-2">
                <span className="w-5 h-5 bg-[#B65A45] text-white rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                <p className="text-gray-700 font-medium">Point your camera at the QR code above.</p>
              </div>
              <div className="flex gap-2">
                <span className="w-5 h-5 bg-[#B65A45] text-white rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                <p className="text-gray-700 font-medium">Tap the link popup to view in 3D & place the item in your space!</p>
              </div>
            </div>

            <p className="mt-4 text-[10px] text-gray-400 font-medium flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              Requires a modern smartphone running Android (ARCore) or iOS (ARKit).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
