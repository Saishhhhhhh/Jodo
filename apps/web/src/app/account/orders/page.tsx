'use client';

import React, { useEffect, useState } from 'react';
import { useCustomerStore } from '../../../store/useCustomerStore';
import { PackageOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface OrderItem {
  productId?: {
    _id: string;
    imageUrl?: string;
  };
  title: string;
  quantity: number;
  sku: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  totalAmount: number;
  items: OrderItem[];
}

export default function AccountOrdersPage() {
  const { token } = useCustomerStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/storefront/auth/me/orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.data.orders);
        } else {
          setError(data.message || 'Failed to load orders.');
        }
      } catch {
        setError('A network error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (!customer) return null;

  const formatCurrency = (val: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(val);
  };

  return (
    <div className="space-y-8 animate-fade-in h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Order History</h2>
        <p className="text-gray-500 text-sm">View and track all your recent orders.</p>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center py-10">
            {error}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                
                {/* Order Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order Placed</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total</p>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount, order.currency)}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Ship To</p>
                      <p className="text-sm font-medium text-[#B65A45] hover:underline cursor-pointer">
                        {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500 mb-1">Order # <span className="text-gray-900 font-medium">{order.orderNumber}</span></p>
                    <Link href={`/account/orders/${order._id}`} className="text-sm text-[#B65A45] font-semibold hover:underline flex items-center justify-start sm:justify-end gap-1">
                      View details <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {order.fulfillmentStatus === 'fulfilled' ? 'Delivered' : 
                       order.fulfillmentStatus === 'partial' ? 'Partially Delivered' : 
                       'Preparing for Shipment'}
                    </h3>
                  </div>

                  {order.items.map((item: OrderItem, idx: number) => (
                    <div key={idx} className="flex gap-4 sm:gap-6">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                        {item.productId?.imageUrl ? (
                          <Image src={item.productId.imageUrl} alt={item.title} width={96} height={96} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400"><PackageOpen className="w-8 h-8"/></div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <Link href={`/products/${item.productId?._id || ''}`} className="text-base font-semibold text-gray-900 hover:text-[#B65A45] hover:underline line-clamp-2">
                            {item.title}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                          <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        </div>
                        <div className="text-left sm:text-right sm:w-32">
                          <button className="text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg w-full transition-colors">
                            Buy it again
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <PackageOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 text-sm mb-8">
              Looks like you haven&apos;t made any purchases yet. Start shopping to see your orders here.
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
