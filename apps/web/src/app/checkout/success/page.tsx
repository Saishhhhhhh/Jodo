'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId') || '1000';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white px-4 py-20 font-sans">
      <div className="max-w-[600px] w-full text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border-8 border-green-100/50">
          <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={2.5} />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Thank you for your order!</h1>
        <p className="text-lg text-gray-600 mb-2">
          Your order <span className="font-bold text-gray-900">#{orderId}</span> has been placed successfully.
        </p>
        <p className="text-gray-500 mb-10 max-w-[400px]">
          We've sent an order confirmation with details and tracking info to your email address.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="/shop"
            className="px-8 py-4 bg-[#B65A45] text-white font-bold rounded-xl hover:bg-[#a04e3b] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/account/orders"
            className="px-8 py-4 bg-white text-gray-700 border border-gray-300 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
