'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Smartphone, Sparkles } from 'lucide-react';

interface ProductARCardProps {
  product: {
    slug: string;
    title: string;
  };
  localIp: string;
}

export default function ProductARCard({ product, localIp }: ProductARCardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simple mobile detection
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(mobile);
  }, []);

  if (!mounted) return null;

  // Resolve current IP/hostname for the local network redirection
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  const getVRUrl = () => {
    if (process.env.NEXT_PUBLIC_VR_URL) {
      return `${process.env.NEXT_PUBLIC_VR_URL}/?product=${product.slug}&ar=true`;
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const ip = localIp || hostname;
      return `http://${ip}:3000/?product=${product.slug}&ar=true`;
    }
    
    // Fallback to the new working Vercel deployment for the VR app
    return `https://jodo-ar-viewer.vercel.app/?product=${product.slug}&ar=true`;
    return `${window.location.protocol}//${hostname}/vr/?product=${product.slug}&ar=true`;
  };

  const vrUrl = getVRUrl();
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=b65a45&data=${encodeURIComponent(vrUrl)}`;

  return (
    <div className="mb-6 border border-[#e5ebe5] rounded-md bg-[#f5faf5] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-[#B65A45]" />
        <h4 className="font-bold text-sm text-gray-900">AR Product Try-On</h4>
      </div>

      {!isMobile ? (
        // Desktop View: Render QR Code to Scan
        <div className="flex flex-col items-center text-center">
          <p className="text-xs text-gray-600 mb-4 leading-relaxed font-medium">
            Scan this QR code with your mobile camera to instantly place this product in your room using augmented reality.
          </p>
          <div className="relative bg-white p-3 rounded-lg border border-gray-200 shadow-inner mb-4 w-[160px] h-[160px] flex items-center justify-center">
            <img
              src={qrImageUrl}
              alt="Scan to try product in AR"
              width={140}
              height={140}
              className="rounded"
            />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5" />
            Scan to Try in AR
          </div>
        </div>
      ) : (
        // Mobile View: Direct Action Button to VR App
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            Experience this product in your own space! Tap the button below to launch our Augmented Reality viewer.
          </p>
          <a
            href={vrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#B65A45] hover:bg-[#a04e3b] text-white text-sm font-bold rounded-md shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2 active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            TRY IN MY SPACE (AR)
          </a>
        </div>
      )}
    </div>
  );
}
