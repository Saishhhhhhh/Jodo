'use client';

import React, { useEffect, useState } from 'react';
import { useCustomerStore } from '../../../../store/useCustomerStore';
import { PackageOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface OrderItem {
  productId?: {
    _id: string;
    imageUrl?: string;
  };
  title: string;
  quantity: number;
  price: number;
  total: number;
  sku: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  subtotal: number;
  taxTotal: number;
  shippingTotal: number;
  totalAmount: number;
  currency?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
  };
  items: OrderItem[];
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { customer, token } = useCustomerStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !params.id) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/auth/me/orders/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setOrder(data.data.order);
        } else {
          setError(data.message || 'Failed to load order.');
        }
      } catch {
        setError('A network error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [token, params.id]);

  if (!customer) return null;

  const formatCurrency = (val: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(val);
  };

  return (
    <div className="space-y-8 animate-fade-in h-full flex flex-col">
      <div className="flex items-start md:items-center gap-4">
        <Link href="/account/orders" className="mt-1 md:mt-0 p-2 bg-gray-50 hover:bg-terracotta/10 hover:text-terracotta rounded-full transition-colors text-gray-500">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h2 className="text-3xl font-medium text-jodo-dark mb-1 tracking-tight">Order Details</h2>
          <p className="text-taupe-dark">View details for order {order?.orderNumber ? `#${order.orderNumber}` : ''}</p>
        </div>
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
        ) : order ? (
          <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
            
            {/* Top Bar: Order Status & Info */}
            <div className="p-6 md:p-8 bg-[#FAFAFA] border-b border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-1.5">Order Date</p>
                  <p className="font-medium text-jodo-dark text-base md:text-lg">{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-1.5">Order Number</p>
                  <p className="font-medium text-jodo-dark text-base md:text-lg">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-1.5">Payment</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.paymentStatus === 'paid' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#EF6C00]'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-1.5">Fulfillment</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.fulfillmentStatus === 'fulfilled' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                    order.fulfillmentStatus === 'partial' ? 'bg-[#E3F2FD] text-[#1565C0]' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {order.fulfillmentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              
              {/* Left Column: Items */}
              <div className="lg:col-span-2 p-6 md:p-8">
                <h3 className="text-lg font-bold text-jodo-dark mb-6">Items ({order.items.length})</h3>
                <div className="space-y-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-6 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="w-full sm:w-28 h-28 bg-gray-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative border border-gray-100">
                        {item.productId?.imageUrl ? (
                          <img src={item.productId.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <PackageOpen className="w-10 h-10 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <h4 className="font-bold text-base md:text-lg text-jodo-dark mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-400">SKU: {item.sku}</p>
                          </div>
                          <p className="font-bold text-lg text-jodo-dark text-left sm:text-right">{formatCurrency(item.total, order.currency)}</p>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 font-medium">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Summary & Address */}
              <div className="p-6 md:p-8 bg-gray-50/50 flex flex-col gap-10">
                {/* Summary */}
                <div>
                  <h3 className="text-lg font-bold text-jodo-dark mb-5">Summary</h3>
                  <div className="space-y-3 text-[15px]">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span className="text-jodo-dark font-medium">{formatCurrency(order.subtotal, order.currency)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Tax</span>
                      <span className="text-jodo-dark font-medium">{formatCurrency(order.taxTotal, order.currency)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      <span className="text-jodo-dark font-medium">{formatCurrency(order.shippingTotal, order.currency)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between font-bold text-lg text-jodo-dark items-center">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalAmount, order.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div>
                    <h3 className="text-lg font-bold text-jodo-dark mb-4">Shipping Address</h3>
                    <div className="text-gray-500 text-[14px] md:text-[15px] space-y-1.5 leading-relaxed bg-white p-5 rounded-xl border border-gray-100">
                      <p className="font-bold text-jodo-dark mb-2">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                      <p>{order.shippingAddress.address1}</p>
                      {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                      <p>{order.shippingAddress.country}</p>
                      {order.shippingAddress.phone && <p className="pt-2 font-medium">{order.shippingAddress.phone}</p>}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">Order not found.</div>
        )}
      </div>
    </div>
  );
}
