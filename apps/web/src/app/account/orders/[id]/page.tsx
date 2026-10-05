'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useCustomerStore } from '../../../../store/useCustomerStore';
import { motion } from 'framer-motion';
import { 
  PackageOpen, 
  ArrowLeft, 
  X, 
  UploadCloud, 
  Check, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  LogIn,
  Clock,
  Package,
  PackageCheck,
  CreditCard,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

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

interface ReturnRequest {
  _id: string;
  orderId?: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  status: 'requested' | 'approved' | 'received' | 'refunded' | 'rejected';
  refundAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: {
    sku: string;
    title: string;
    quantity: number;
    price: number;
  }[];
}

const ISSUE_OPTIONS = [
  'Standard Return',
  'Exchange Item',
  'Arrived Damaged',
  'Quality Complaint',
  'Warranty Claim',
];

const RETURN_STEPS = [
  {
    key: 'requested',
    label: 'Return Requested',
    desc: 'Request submitted',
    icon: Clock,
  },
  {
    key: 'approved',
    label: 'Return Approved',
    desc: 'Accepted by merchant',
    icon: CheckCircle2,
  },
  {
    key: 'received',
    label: 'Package Received',
    desc: 'Inspected at warehouse',
    icon: PackageCheck,
  },
  {
    key: 'refunded',
    label: 'Refund Processed',
    desc: 'Payment returned',
    icon: CreditCard,
  },
];

// ── Floating Celebration Particles for Completed Refund ──
const ConfettiParticles = () => {
  const particles = [
    { color: '#10B981', left: '6%', delay: 0.1, size: 8, dur: 2.3 },
    { color: '#F59E0B', left: '14%', delay: 0.3, size: 10, dur: 2.1 },
    { color: '#6366F1', left: '22%', delay: 0.5, size: 7, dur: 2.5 },
    { color: '#EC4899', left: '30%', delay: 0.2, size: 9, dur: 2.2 },
    { color: '#10B981', left: '38%', delay: 0.7, size: 6, dur: 2.4 },
    { color: '#3B82F6', left: '46%', delay: 0.4, size: 11, dur: 2.3 },
    { color: '#F59E0B', left: '54%', delay: 0.1, size: 8, dur: 2.6 },
    { color: '#10B981', left: '62%', delay: 0.6, size: 7, dur: 2.4 },
    { color: '#6366F1', left: '70%', delay: 0.2, size: 10, dur: 2.2 },
    { color: '#EC4899', left: '78%', delay: 0.5, size: 8, dur: 2.5 },
    { color: '#10B981', left: '86%', delay: 0.3, size: 9, dur: 2.1 },
    { color: '#F59E0B', left: '94%', delay: 0.7, size: 6, dur: 2.5 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, y: -10, rotate: 0 }}
          animate={{ 
            opacity: [1, 1, 0], 
            y: [0, 130], 
            rotate: [0, (i % 2 === 0 ? 1 : -1) * 360],
            x: [(i % 2 === 0 ? 1 : -1) * 15, (i % 2 === 0 ? -1 : 1) * 20]
          }}
          transition={{ 
            duration: p.dur, 
            delay: p.delay, 
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 2.5
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: p.left,
            width: p.size,
            height: (i % 2 === 0) ? p.size : p.size * 1.4,
            backgroundColor: p.color,
            borderRadius: (i % 3 === 0) ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
};

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { customer, token, logout } = useCustomerStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Return / Issue Modal State ──
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<string>('Standard Return');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [modalError, setModalError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setReturnRequest(data.data.returnRequest || null);
          if (data.data.order?.items?.length > 0) {
            setSelectedItems([0]);
          }
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

  const toggleItemSelection = (idx: number) => {
    setSelectedItems((prev) => 
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (order.fulfillmentStatus !== 'fulfilled') {
      setModalError('Return & complaint options only open after you have received your product.');
      return;
    }

    if (selectedItems.length === 0) {
      setModalError('Please select at least one item having issues.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      const itemsToReturn = selectedItems.map((idx) => {
        const it = order.items[idx];
        return {
          productId: it.productId?._id,
          sku: it.sku || 'SKU-6ab37',
          title: it.title,
          quantity: it.quantity,
          price: it.price || it.total || 0,
        };
      });

      // Convert uploaded files to base64
      const base64Images = await Promise.all(
        uploadedFiles.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
          });
        })
      );

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/auth/me/orders/${order._id}/returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: itemsToReturn,
          issueType: selectedIssue,
          details: additionalDetails,
          images: base64Images,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setReturnRequest(data.data.return);
        setOrder({
          ...order,
          fulfillmentStatus: 'returned',
        });
      } else {
        setModalError(data.message || 'Failed to submit return request.');
      }
    } catch {
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setIsReturnModalOpen(false);
    setSubmitSuccess(false);
    setModalError('');
    setAdditionalDetails('');
    setUploadedFiles([]);
    setSelectedIssue('Standard Return');
  };

  const isSessionExpired = error.toLowerCase().includes('token') || error.toLowerCase().includes('unauthorized');

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col font-sans">
      
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/account/orders" 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Order Details</h2>
            <p className="text-gray-400 text-sm">
              View details for order {order?.orderNumber ? `#${order.orderNumber}` : ''}
            </p>
          </div>
        </div>

        {order && (
          returnRequest ? (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border ${
                returnRequest.status === 'approved' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                returnRequest.status === 'received' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                returnRequest.status === 'refunded' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 ring-2 ring-emerald-500/20 shadow-xs' :
                returnRequest.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                {returnRequest.status === 'approved' && <CheckCircle2 className="w-4 h-4" />}
                {returnRequest.status === 'received' && <PackageCheck className="w-4 h-4" />}
                {returnRequest.status === 'refunded' && <Check className="w-4 h-4 stroke-[3]" />}
                {returnRequest.status === 'requested' && <Clock className="w-4 h-4" />}
                {returnRequest.status === 'rejected' && <AlertCircle className="w-4 h-4" />}
                <span>
                  {returnRequest.status === 'requested' ? 'Return Pending Review' :
                   returnRequest.status === 'approved' ? 'Return Approved' :
                   returnRequest.status === 'received' ? 'Package Received' :
                   returnRequest.status === 'refunded' ? 'Refund Completed' : 'Return Declined'}
                </span>
              </span>
            </div>
          ) : order.fulfillmentStatus === 'fulfilled' ? (
            <button
              onClick={() => {
                setSubmitSuccess(false);
                setIsReturnModalOpen(true);
              }}
              className="bg-[#111827] text-white hover:bg-black px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm inline-flex items-center justify-center self-start sm:self-auto cursor-pointer"
            >
              File Return / Issue
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 text-gray-500 text-xs font-medium border border-gray-200/80 self-start sm:self-auto">
              <Package className="w-4 h-4 text-gray-400" />
              <span>Return / complaint option opens once product is delivered &amp; received</span>
            </div>
          )
        )}
      </div>

      {/* ── Content ── */}
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
                Your login session has expired. Please sign in again to view your order details.
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
        ) : order ? (
          <div className="space-y-8">
            
            {/* ── 1. Order Info Card ── */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
              
              {/* Top Bar: Order Date, Number, Payment, Fulfillment / Return Status */}
              <div className="bg-[#FAFAFA] rounded-2xl p-6 md:p-7 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">ORDER DATE</p>
                    <p className="font-medium text-gray-900 text-base md:text-lg">
                      {new Date(order.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">ORDER NUMBER</p>
                    <p className="font-medium text-gray-900 text-base md:text-lg">
                      {order.orderNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">PAYMENT</p>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        returnRequest?.status === 'refunded' || order.paymentStatus === 'refunded' ? 'bg-emerald-100 text-emerald-800' :
                        order.paymentStatus === 'paid' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 
                        'bg-[#FFF3E0] text-[#EF6C00]'
                      }`}>
                        {returnRequest?.status === 'refunded' ? 'refunded' : order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      {returnRequest ? 'RETURN STATUS' : 'FULFILLMENT'}
                    </p>
                    <div>
                      {returnRequest ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          returnRequest.status === 'approved' ? 'bg-indigo-100 text-indigo-700' :
                          returnRequest.status === 'received' ? 'bg-purple-100 text-purple-700' :
                          returnRequest.status === 'refunded' ? 'bg-emerald-100 text-emerald-700' :
                          returnRequest.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {returnRequest.status === 'requested' ? 'Pending Review' :
                           returnRequest.status === 'approved' ? 'Approved' :
                           returnRequest.status === 'received' ? 'Package Received' :
                           returnRequest.status === 'refunded' ? 'Refunded' : 'Rejected'}
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.fulfillmentStatus === 'fulfilled' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                          order.fulfillmentStatus === 'partial' ? 'bg-[#E3F2FD] text-[#1565C0]' :
                          order.fulfillmentStatus === 'returned' ? 'bg-amber-100 text-amber-800' :
                          'bg-[#F1F5F9] text-[#475569]'
                        }`}>
                          {order.fulfillmentStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RETURN STATUS BAR / STEPPER TIMELINE ── */}
              {returnRequest && (
                <div className="border border-gray-100 bg-gray-50/40 rounded-2xl p-6 sm:p-7 mb-8 relative">
                  
                  {/* ── CELEBRATORY REFUND COMPLETED ANIMATION BANNER ── */}
                  {returnRequest.status === 'refunded' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="relative overflow-hidden bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border-2 border-emerald-500/30 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm"
                    >
                      <ConfettiParticles />
                      <div className="flex items-center gap-4 relative z-20">
                        <motion.div 
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 350, damping: 15, delay: 0.2 }}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0 ring-4 ring-emerald-100"
                        >
                          <Sparkles className="w-8 h-8 stroke-[2.2]" />
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[11px] uppercase font-extrabold tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                              Refund Settled
                            </span>
                            <span className="text-xs text-emerald-800 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-md">
                              100% Completed
                            </span>
                          </div>
                          <h4 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">
                            ₹{(returnRequest.refundAmount || order.totalAmount).toLocaleString('en-IN')} has been refunded successfully!
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                            The full refund has been credited back to your original payment method. All return stages have been successfully fulfilled and closed.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Header Strip of Return Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200/70 gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          returnRequest.status === 'approved' ? 'bg-indigo-100 text-indigo-700' :
                          returnRequest.status === 'received' ? 'bg-purple-100 text-purple-700' :
                          returnRequest.status === 'refunded' ? 'bg-emerald-100 text-emerald-700' :
                          returnRequest.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {returnRequest.status === 'requested' ? 'Pending Merchant Review' :
                           returnRequest.status === 'approved' ? 'Return Approved' :
                           returnRequest.status === 'received' ? 'Package Received' :
                           returnRequest.status === 'refunded' ? 'Refund Completed' : 'Return Declined'}
                        </span>
                        <span className="text-xs text-gray-400">
                          Updated {new Date(returnRequest.updatedAt || returnRequest.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Return & Refund Progress</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {returnRequest.status === 'requested' && 'Your return request has been submitted and is currently awaiting approval from the merchant.'}
                        {returnRequest.status === 'approved' && 'Your return request has been accepted by the merchant! Reverse pickup/inspection is in progress.'}
                        {returnRequest.status === 'received' && 'Your returned package has been received and verified at the fulfillment warehouse.'}
                        {returnRequest.status === 'refunded' && `A refund of ${formatCurrency(returnRequest.refundAmount || order.totalAmount, order.currency)} has been successfully issued to your original payment method.`}
                        {returnRequest.status === 'rejected' && 'Your return request was reviewed and could not be approved at this time.'}
                      </p>
                    </div>

                    <div className="shrink-0 bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/80 text-left sm:text-right shadow-xs">
                      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Refund Total</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        {formatCurrency(returnRequest.refundAmount || order.totalAmount, order.currency)}
                      </p>
                    </div>
                  </div>

                  {returnRequest.status === 'rejected' ? (
                    <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-red-900">Return Request Declined</h4>
                        <p className="text-xs text-red-700 mt-1 leading-relaxed">
                          {returnRequest.notes ? `Reason: ${returnRequest.notes}` : 'The merchant declined this return request. If you have questions, please reach out to customer support.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      {/* Desktop Horizontal Stepper */}
                      <div className="hidden md:flex items-center justify-between relative px-4">
                        {/* Background Track Line */}
                        <div className="absolute top-5 left-12 right-12 h-1 bg-gray-200 -z-0" />
                        
                        {/* Progress Fill Line */}
                        <div 
                          className={`absolute top-5 left-12 h-1 transition-all duration-700 -z-0 ${
                            returnRequest.status === 'refunded'
                              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600'
                              : 'bg-[#111827]'
                          }`}
                          style={{ 
                            width: returnRequest.status === 'refunded' ? 'calc(100% - 96px)' :
                                   returnRequest.status === 'received' ? 'calc(66.6% - 64px)' :
                                   returnRequest.status === 'approved' ? 'calc(33.3% - 32px)' : '0%' 
                          }}
                        />

                        {RETURN_STEPS.map((step, idx) => {
                          // When refunded, all 4 steps are complete
                          const isCompleted = 
                            returnRequest.status === 'refunded' ? true :
                            returnRequest.status === 'received' ? idx <= 2 :
                            returnRequest.status === 'approved' ? idx <= 1 :
                            returnRequest.status === 'requested' ? idx <= 0 : false;

                          const isCurrent = 
                            returnRequest.status === 'refunded' ? false :
                            returnRequest.status === 'received' ? idx === 2 :
                            returnRequest.status === 'approved' ? idx === 1 :
                            returnRequest.status === 'requested' ? idx === 0 : false;

                          const Icon = step.icon;

                          return (
                            <div key={step.key} className="flex flex-col items-center text-center relative z-10 w-44">
                              <motion.div 
                                whileHover={{ scale: 1.08 }}
                                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                                  isCompleted
                                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-emerald-600/20'
                                    : isCurrent
                                    ? 'bg-[#111827] text-white ring-4 ring-gray-200'
                                    : 'bg-white border-2 border-gray-200 text-gray-400'
                                }`}
                              >
                                {isCompleted ? (
                                  <Check className="w-5 h-5 stroke-[2.5]" />
                                ) : (
                                  <Icon className="w-5 h-5" />
                                )}
                              </motion.div>

                              <div className="mt-3">
                                <p className={`text-sm font-bold leading-tight ${isCurrent || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {step.label}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 leading-normal">
                                  {step.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mobile Vertical Stepper */}
                      <div className="md:hidden space-y-6 pt-2">
                        {RETURN_STEPS.map((step, idx) => {
                          const isCompleted = 
                            returnRequest.status === 'refunded' ? true :
                            returnRequest.status === 'received' ? idx <= 2 :
                            returnRequest.status === 'approved' ? idx <= 1 :
                            returnRequest.status === 'requested' ? idx <= 0 : false;

                          const isCurrent = 
                            returnRequest.status === 'refunded' ? false :
                            returnRequest.status === 'received' ? idx === 2 :
                            returnRequest.status === 'approved' ? idx === 1 :
                            returnRequest.status === 'requested' ? idx === 0 : false;

                          const Icon = step.icon;

                          return (
                            <div key={step.key} className="flex items-start gap-4 relative">
                              {idx < RETURN_STEPS.length - 1 && (
                                <div 
                                  className={`absolute left-5 top-11 bottom-0 w-0.5 -ml-[1px] ${
                                    isCompleted ? 'bg-emerald-600' : 'bg-gray-200'
                                  }`} 
                                />
                              )}
                              <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                                  isCompleted
                                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-emerald-600/20'
                                    : isCurrent
                                    ? 'bg-[#111827] text-white ring-4 ring-gray-200'
                                    : 'bg-white border-2 border-gray-200 text-gray-400'
                                }`}
                              >
                                {isCompleted ? (
                                  <Check className="w-4 h-4 stroke-[2.5]" />
                                ) : (
                                  <Icon className="w-4 h-4" />
                                )}
                              </div>
                              <div className="pt-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className={`text-sm font-bold ${isCurrent || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step.label}
                                  </p>
                                  {isCompleted && (
                                    <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                      Completed
                                    </span>
                                  )}
                                  {isCurrent && (
                                    <span className="text-[10px] uppercase font-bold bg-[#111827] text-white px-2 py-0.5 rounded-full">
                                      Active Stage
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Main Content Area: Items + Summary/Address */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                {/* Left Column: Items */}
                <div className="lg:col-span-7">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Items ({order.items.length})</h3>
                  <div className="space-y-6">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 sm:gap-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl overflow-hidden shrink-0 relative border border-gray-100 flex items-center justify-center">
                          {item.productId?.imageUrl ? (
                            <img src={item.productId.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <PackageOpen className="w-8 h-8 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base text-gray-900 mb-1 leading-snug">{item.title}</h4>
                          <p className="text-xs text-gray-400 mb-2">SKU: {item.sku || 'SKU-6ab37'}</p>
                          <p className="text-sm text-gray-600 font-medium">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-base sm:text-lg text-gray-900">
                            {formatCurrency(item.total || item.price * item.quantity, order.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Summary & Address */}
                <div className="lg:col-span-5 lg:border-l lg:border-gray-100 lg:pl-10 space-y-8">
                  {/* Summary */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-5">Summary</h3>
                    <div className="space-y-3.5 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span className="text-gray-900 font-medium">{formatCurrency(order.subtotal, order.currency)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Tax</span>
                        <span className="text-gray-900 font-medium">{formatCurrency(order.taxTotal || 0, order.currency)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Shipping</span>
                        <span className="text-gray-900 font-medium">{formatCurrency(order.shippingTotal || 0, order.currency)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-4 mt-2 flex justify-between font-bold text-lg text-gray-900">
                        <span>Total</span>
                        <span>{formatCurrency(order.totalAmount, order.currency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h3>
                      <div className="text-gray-600 text-sm space-y-1 bg-gray-50/60 p-4 rounded-xl border border-gray-100 leading-relaxed">
                        <p className="font-semibold text-gray-900">
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        </p>
                        <p>{order.shippingAddress.address1}</p>
                        {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                        <p>{order.shippingAddress.country}</p>
                        {order.shippingAddress.phone && <p className="pt-1 text-gray-500">{order.shippingAddress.phone}</p>}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">Order not found.</div>
        )}
      </div>

      {/* ── "File a Return or Issue" Modal ── */}
      {isReturnModalOpen && order && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 relative my-8 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-6">
              <h3 className="text-xl font-bold text-gray-900">File a Return or Issue</h3>
              <button 
                onClick={resetModal}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/60">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Return Request Submitted!</h4>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  We have received your return request for order <span className="font-semibold text-gray-900">#{order.orderNumber}</span>. Our customer support team will review your request and get back to you within 24-48 hours.
                </p>
                <button
                  onClick={resetModal}
                  className="w-full py-3 bg-[#111827] text-white hover:bg-black rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer"
                >
                  View Return Progress
                </button>
              </div>
            ) : order.fulfillmentStatus !== 'fulfilled' ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-50">
                  <Package className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Product Not Delivered Yet</h4>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Returns and complaints can only be opened once you have received your product. Your order is currently being processed for delivery.
                </p>
                <button
                  onClick={resetModal}
                  className="w-full py-3 bg-[#111827] text-white hover:bg-black rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReturn} className="space-y-6">
                
                {modalError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs sm:text-sm border border-red-100 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* 1. Select items having issues */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                    1. Select items having issues *
                  </label>
                  <div className="space-y-2.5">
                    {order.items.map((item, idx) => {
                      const isChecked = selectedItems.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleItemSelection(idx)}
                          className={`p-3.5 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all ${
                            isChecked 
                              ? 'border-gray-900 bg-gray-50/50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div 
                            className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                              isChecked ? 'bg-[#2563EB] text-white' : 'border border-gray-300 bg-white'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. What is the issue? */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                    2. What is the issue? *
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {ISSUE_OPTIONS.map((issue) => {
                      const isSelected = selectedIssue === issue;
                      return (
                        <button
                          key={issue}
                          type="button"
                          onClick={() => setSelectedIssue(issue)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-[#111827] text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {issue}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Proof of Issue (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                    3. Proof of Issue (Optional)
                  </label>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    multiple 
                    accept="image/png,image/jpeg" 
                    className="hidden" 
                  />

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-2xl p-6 text-center transition-colors cursor-pointer bg-gray-50/30 flex flex-col items-center justify-center gap-1.5"
                  >
                    <UploadCloud className="w-7 h-7 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Click to upload photos</span>
                    <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {uploadedFiles.map((file, idx) => {
                        const previewUrl = URL.createObjectURL(file);
                        return (
                          <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                            <img 
                              src={previewUrl} 
                              alt={`Preview ${idx + 1}`} 
                              className="w-full h-full object-cover"
                              onLoad={() => URL.revokeObjectURL(previewUrl)} // Clean up memory
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx); }}
                                className="bg-white/20 hover:bg-red-500 hover:text-white text-gray-200 p-1.5 rounded-full backdrop-blur-sm transition-colors"
                                title="Remove Image"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Additional Details */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                    4. Additional Details
                  </label>
                  <textarea
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    placeholder="Please describe the issue in detail..."
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent min-h-[90px] resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#111827] text-white hover:bg-black px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
