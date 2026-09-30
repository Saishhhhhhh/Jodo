'use client';

import React, { useEffect, useState } from 'react';
import { useCustomerStore } from '../../../store/useCustomerStore';
import { PackageOpen, ExternalLink, Lock, LogIn } from 'lucide-react';
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
  returnStatus?: string;
  totalAmount: number;
  currency?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
  };
  items: OrderItem[];
}

export default function AccountOrdersPage() {
  const { customer, token, logout } = useCustomerStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/auth/me/orders`, {
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

  const isSessionExpired = error.toLowerCase().includes('token') || error.toLowerCase().includes('unauthorized');

  return (
    <div className="space-y-8 animate-fade-in h-full flex flex-col font-sans">
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
          isSessionExpired ? (
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-8 text-center max-w-md mx-auto my-8">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-50">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Session Expired</h3>
              <p className="text-sm text-gray-600 mb-6">
                Your login session has expired. Please sign in again to view your order history.
              </p>
              <Link
                href="/login"
                onClick={() => logout()}
                className="inline-flex items-center justify-center gap-2 bg-[#111827] text-white hover:bg-black px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign In Again
              </Link>
            </div>
          ) : (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center py-10">
              {error}
            </div>
          )
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
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2.5">
                      <span>
                        {order.returnStatus === 'approved' ? 'Return Approved' :
                         order.returnStatus === 'requested' ? 'Return Pending Review' :
                         order.returnStatus === 'received' ? 'Returned Package Received' :
                         order.returnStatus === 'refunded' ? 'Refund Completed' :
                         order.returnStatus === 'rejected' ? 'Return Declined' :
                         order.fulfillmentStatus === 'returned' ? 'Return in Progress' :
                         order.fulfillmentStatus === 'fulfilled' ? 'Delivered' : 
                         order.fulfillmentStatus === 'partial' ? 'Partially Delivered' : 
                         'Preparing for Shipment'}
                      </span>
                      {order.returnStatus && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          order.returnStatus === 'approved' ? 'bg-indigo-100 text-indigo-700' :
                          order.returnStatus === 'received' ? 'bg-purple-100 text-purple-700' :
                          order.returnStatus === 'refunded' ? 'bg-emerald-100 text-emerald-700' :
                          order.returnStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          Return {order.returnStatus}
                        </span>
                      )}
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
