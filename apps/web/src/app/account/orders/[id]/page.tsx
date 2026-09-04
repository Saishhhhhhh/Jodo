'use client';

import React, { useEffect, useState } from 'react';
import { useCustomerStore } from '../../../../store/useCustomerStore';
import { PackageOpen, ArrowLeft, X, CheckCircle, AlertCircle, UploadCloud, Loader2 } from 'lucide-react';
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issueType, setIssueType] = useState('return');
  const [issueNotes, setIssueNotes] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/auth/me/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            base64Data,
          })
        });
        const data = await res.json();
        if (data.success && data.data?.url) {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          setUploadedImages(prev => [...prev, `${apiBase}${data.data.url}`]);
        }
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setIsUploading(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setSubmitMessage('Please select at least one item.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      const itemsToReturn = selectedItems.map(idx => {
        const item = order!.items[idx];
        return {
          productId: item.productId?._id,
          sku: item.sku,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          reason: issueType === 'damaged' ? 'defective' : 'other',
        };
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/auth/me/orders/${params.id}/returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: itemsToReturn,
          type: issueType,
          notes: issueNotes,
          images: uploadedImages,
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitMessage('Request submitted successfully! Our team will review it shortly.');
        setTimeout(() => setIsModalOpen(false), 3000);
      } else {
        setSubmitMessage(data.message || 'Failed to submit request.');
      }
    } catch (err) {
      setSubmitMessage('An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleItemSelection = (idx: number) => {
    setSelectedItems(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  return (
    <div className="space-y-8 animate-fade-in h-full flex flex-col relative">
      <div className="flex items-start md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-4">
          <Link href="/account/orders" className="mt-1 md:mt-0 p-2 bg-gray-50 hover:bg-terracotta/10 hover:text-terracotta rounded-full transition-colors text-gray-500">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-3xl font-medium text-jodo-dark mb-1 tracking-tight">Order Details</h2>
            <p className="text-taupe-dark">View details for order {order?.orderNumber ? `#${order.orderNumber}` : ''}</p>
          </div>
        </div>
        {order && (
          <button 
            onClick={() => {
              setIsModalOpen(true);
              setSubmitMessage('');
              setSelectedItems([]);
              setIssueNotes('');
              setUploadedImages([]);
            }}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors shrink-0 shadow-sm"
          >
            File Return / Issue
          </button>
        )}
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

      {/* Return/Complaint Modal */}
      {isModalOpen && order && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-[10vh] overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 mb-[10vh] shrink-0">
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">File a Return or Issue</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 md:p-6 overflow-y-auto">
              {submitMessage && submitMessage.includes('successfully') ? (
                <div className="text-center py-10 space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Request Received</h4>
                  <p className="text-gray-600 max-w-sm mx-auto">{submitMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleIssueSubmit} className="space-y-6">
                  {/* Select Items */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">1. Select Items having issues *</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50">
                      {order.items.map((item, idx) => (
                        <label key={idx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedItems.includes(idx) ? 'bg-white border-gray-900 shadow-sm' : 'bg-transparent border-transparent hover:bg-gray-100'}`}>
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 text-gray-900 rounded border-gray-300 focus:ring-gray-900 cursor-pointer"
                            checked={selectedItems.includes(idx)}
                            onChange={() => toggleItemSelection(idx)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">{item.title}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Select Type */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">2. What is the issue? *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { id: 'return', label: 'Standard Return' },
                        { id: 'exchange', label: 'Exchange Item' },
                        { id: 'damaged', label: 'Arrived Damaged' },
                        { id: 'complaint', label: 'Quality Complaint' },
                        { id: 'warranty', label: 'Warranty Claim' }
                      ].map(type => (
                        <label key={type.id} className={`flex items-center justify-center text-center p-3 rounded-xl border text-sm font-medium cursor-pointer transition-colors ${issueType === type.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                          <input 
                            type="radio" 
                            name="issueType"
                            value={type.id}
                            className="sr-only"
                            checked={issueType === type.id}
                            onChange={(e) => setIssueType(e.target.value)}
                          />
                          {type.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">3. Proof of Issue (Optional)</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 md:p-6 text-center hover:bg-gray-50 transition-colors relative cursor-pointer group">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className="flex flex-col items-center gap-2">
                        {isUploading ? (
                          <>
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                            <p className="text-sm font-medium text-gray-900">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            <p className="text-sm font-medium text-gray-900">Click to upload photos</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                    {uploadedImages.length > 0 && (
                      <div className="flex gap-3 flex-wrap mt-3">
                        {uploadedImages.map((url, i) => (
                          <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">4. Additional Details</label>
                    <textarea 
                      value={issueNotes}
                      onChange={(e) => setIssueNotes(e.target.value)}
                      placeholder="Please describe the issue in detail..."
                      className="w-full min-h-[100px] px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 outline-none transition-all text-sm resize-y"
                    />
                  </div>

                  {submitMessage && !submitMessage.includes('successfully') && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>{submitMessage}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting || selectedItems.length === 0}
                      className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
