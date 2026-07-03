'use client';

import React, { useEffect, useState } from 'react';
import { useCustomerStore } from '../../../store/useCustomerStore';
import { PackageOpen } from 'lucide-react';
import Link from 'next/link';

export default function AccountOrdersPage() {
  const { customer } = useCustomerStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch orders for this customer from the backend
    // e.g., fetch('/api/storefront/customer/orders')
    
    // For now, we mock an empty state
    const timer = setTimeout(() => {
      setOrders([]);
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, []);

  if (!customer) return null;

  return (
    <div className="space-y-8 animate-fade-in h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Order History</h2>
        <p className="text-gray-500 text-sm">View and track all your recent orders.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
        {isLoading ? (
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="w-full space-y-4">
            {/* Map orders here */}
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <PackageOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 text-sm mb-8">
              Looks like you haven't made any purchases yet. Start shopping to see your orders here.
            </p>
            <Link 
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#B65A45] text-white font-semibold rounded-lg hover:bg-[#a04e3b] transition-all"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
