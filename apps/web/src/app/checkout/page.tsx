'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck, Tag, CreditCard, Banknote, CheckCircle2, Sparkles } from 'lucide-react';
import { loadRazorpayScript, openRazorpayCheckout } from '../../lib/razorpay';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCartStore();
  const { customer, isAuthenticated } = useCustomerStore();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    setMounted(true);
    
    // Auto-fill form if customer is logged in
    if (isAuthenticated() && customer) {
      setFormData(prev => ({
        ...prev,
        email: customer.email || prev.email,
        firstName: customer.defaultShippingAddress?.firstName || customer.firstName || prev.firstName,
        lastName: customer.defaultShippingAddress?.lastName || customer.lastName || prev.lastName,
        address: customer.defaultShippingAddress?.address1 || prev.address,
        city: customer.defaultShippingAddress?.city || prev.city,
        state: customer.defaultShippingAddress?.state || prev.state,
        pincode: customer.defaultShippingAddress?.zip || prev.pincode,
        phone: customer.defaultShippingAddress?.phone || customer.phone || prev.phone,
      }));
    }
  }, [customer, isAuthenticated]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    
    if (couponCode.toUpperCase() === 'WELCOME10') {
      const discount = cartTotal() * 0.10; // 10% off
      setDiscountAmount(discount);
      setDiscountApplied(true);
    } else {
      setCouponError('Invalid coupon code');
      setDiscountApplied(false);
      setDiscountAmount(0);
    }
  };

  const finalTotal = cartTotal() - discountAmount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
      const basePayload = {
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.pincode,
          country: 'India',
          phone: formData.phone,
        },
        items: items.map(item => ({
          productId: item.id,
          sku: `SKU-${item.id.substring(0, 5)}`,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal: cartTotal(),
        taxTotal: 0,
        shippingTotal: 0,
        totalAmount: finalTotal,
      };

      if (paymentMethod === 'RAZORPAY') {
        // 1. Ensure Razorpay SDK script is loaded
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          alert('Could not load Razorpay payment gateway. Please check your internet connection.');
          setIsSubmitting(false);
          return;
        }

        // 2. Create Razorpay order on backend
        const orderRes = await fetch(`${apiUrl}/api/storefront/razorpay/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalTotal,
            currency: 'INR',
            notes: {
              customerEmail: formData.email,
              customerName: `${formData.firstName} ${formData.lastName}`,
            },
          }),
        });

        const orderData = await orderRes.json();
        if (!orderData.success || !orderData.data?.orderId) {
          alert(orderData.message || 'Failed to initialize Razorpay payment.');
          setIsSubmitting(false);
          return;
        }

        const rzpOrder = orderData.data;

        // 3. Open Razorpay Checkout modal
        openRazorpayCheckout({
          key: rzpOrder.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_ThqAXccEenS0Um',
          amount: rzpOrder.amount,
          currency: rzpOrder.currency || 'INR',
          name: 'Jodo Commerce',
          description: `Payment for ${items.length} item(s)`,
          order_id: rzpOrder.orderId,
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#B65A45', // Jodo Terracotta brand color
          },
          handler: async (response) => {
            try {
              // 4. Submit order to backend with verified payment details
              const checkoutRes = await fetch(`${apiUrl}/api/storefront/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...basePayload,
                  paymentMethod: 'RAZORPAY',
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const checkoutData = await checkoutRes.json();
              if (checkoutData.success) {
                clearCart();
                router.push(`/checkout/success?orderId=${checkoutData.data.orderNumber || checkoutData.data._id}`);
              } else {
                alert('Payment captured, but order creation failed. Please contact support.');
                setIsSubmitting(false);
              }
            } catch (err) {
              console.error('Error completing order after payment:', err);
              alert('Error completing your order. Please contact support with your payment ID: ' + response.razorpay_payment_id);
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
            },
          },
        });
      } else {
        // Cash on Delivery
        const res = await fetch(`${apiUrl}/api/storefront/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...basePayload,
            paymentMethod: 'COD',
          }),
        });

        const data = await res.json();
        if (data.success) {
          clearCart();
          router.push(`/checkout/success?orderId=${data.data.orderNumber || data.data._id}`);
        } else {
          alert('Failed to place order. Please try again.');
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">Looks like you haven&apos;t added any items to your cart yet. Let&apos;s get you back to shopping!</p>
        <Link href="/shop" className="px-8 py-3 bg-[#B65A45] text-white font-bold rounded-lg hover:bg-[#a04e3b] transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] min-h-screen">
        
        {/* Left Side: Forms */}
        <div className="bg-white p-6 lg:p-12 lg:border-r border-gray-200">
          <Link href="/cart" className="inline-flex items-center text-sm font-medium text-terracotta hover:text-[#a04e3b] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cart
          </Link>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-[600px] mx-auto lg:mx-0">
            
            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="flex flex-col gap-4">
                <input 
                  type="email" name="email" required placeholder="Email address"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45] focus:border-transparent transition-all"
                  onChange={handleChange} value={formData.email}
                />
              </div>
            </section>

            {/* Shipping */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" name="firstName" required placeholder="First Name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45] focus:border-transparent transition-all"
                  onChange={handleChange} value={formData.firstName}
                />
                <input 
                  type="text" name="lastName" required placeholder="Last Name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45] focus:border-transparent transition-all"
                  onChange={handleChange} value={formData.lastName}
                />
                <input 
                  type="text" name="address" required placeholder="Address, Apartment, Suite, etc."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45] focus:border-transparent transition-all col-span-2"
                  onChange={handleChange} value={formData.address}
                />
                <input 
                  type="text" name="city" required placeholder="City"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45] focus:border-transparent transition-all"
                  onChange={handleChange} value={formData.city}
                />
                <input 
                  type="text" name="state" required placeholder="State"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45] focus:border-transparent transition-all"
                  onChange={handleChange} value={formData.state}
                />
                <input 
                  type="text" name="pincode" required placeholder="PIN Code"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45] focus:border-transparent transition-all"
                  onChange={handleChange} value={formData.pincode}
                />
                <input 
                  type="tel" name="phone" required placeholder="Phone Number"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45] focus:border-transparent transition-all"
                  onChange={handleChange} value={formData.phone}
                />
              </div>
            </section>

            {/* Payment Options */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3" /> Razorpay Test Mode
                </span>
              </div>

              <div className="space-y-3">
                {/* Razorpay Option */}
                <label
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-[#B65A45] bg-[#B65A45]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="mt-1 text-[#B65A45] focus:ring-[#B65A45]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#B65A45]" />
                        Razorpay Secure Checkout
                      </span>
                      <span className="text-xs font-mono bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded">
                        Cards • UPI • NetBanking
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Pay instantly with UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, or NetBanking. In test mode, you can use any test UPI or test card.
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery Option */}
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'COD'
                      ? 'border-[#B65A45] bg-[#B65A45]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 text-[#B65A45] focus:ring-[#B65A45]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-gray-600" />
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-xs text-gray-500">Pay on arrival</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Pay with cash or UPI directly when your parcel is delivered to your doorstep.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 mt-4 bg-[#B65A45] text-white font-bold text-lg rounded-xl hover:bg-[#a04e3b] transition-all duration-300 disabled:opacity-70 flex items-center justify-center shadow-md hover:shadow-lg gap-2"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : paymentMethod === 'RAZORPAY' ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay with Razorpay • ₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Place Order (COD) • ₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              100% Safe and Encrypted Payment with Razorpay
            </div>
          </form>
        </div>

        {/* Right Side: Order Summary */}
        <div className="p-6 lg:p-12 bg-gray-50 flex flex-col">
          <div className="max-w-[450px] mx-auto lg:mx-0 w-full sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="flex flex-col gap-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0">
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" unoptimized />
                    <span className="absolute -top-2 -right-2 bg-gray-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.brand}</p>
                  </div>
                  <div className="font-bold text-gray-900 text-sm">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 pb-4 flex flex-col gap-3">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={discountApplied}
                    placeholder="Discount code (try WELCOME10)"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#B65A45] focus:border-[#B65A45] disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!couponCode || discountApplied}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
                >
                  Apply
                </button>
              </form>
              
              {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
              {discountApplied && <p className="text-green-600 text-xs mt-1">Discount code &apos;{couponCode.toUpperCase()}&apos; applied!</p>}

              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">₹{cartTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {discountApplied && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="font-bold text-green-600">FREE</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-end">
              <span className="font-bold text-lg text-gray-900">Total</span>
              <div className="text-right">
                <span className="text-xs text-gray-500 mr-2">INR</span>
                <span className="font-bold text-2xl text-gray-900">₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
