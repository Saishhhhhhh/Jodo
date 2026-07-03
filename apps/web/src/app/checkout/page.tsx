'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck, Tag } from 'lucide-react';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCartStore();
  const { customer, isAuthenticated } = useCustomerStore();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    try {
      const payload = {
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
        totalAmount: finalTotal, // Use the discounted total
      };

      const res = await fetch('http://localhost:4000/api/storefront/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (data.success) {
        clearCart();
        router.push(`/checkout/success?orderId=${data.data.orderNumber || data.data._id}`);
      } else {
        alert('Failed to place order. Please try again.');
        setIsSubmitting(false);
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
        <p className="text-gray-500 mb-8 text-center max-w-md">Looks like you haven't added any items to your cart yet. Let's get you back to shopping!</p>
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

            {/* Payment (Dummy) */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Secure Checkout Demo</p>
                  <p className="text-sm text-gray-500">This is a demo store. No real payment will be processed. Clicking 'Place Order' will simulate a successful transaction.</p>
                </div>
              </div>
            </section>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 mt-4 bg-[#B65A45] text-white font-bold text-lg rounded-xl hover:bg-[#a04e3b] transition-all duration-300 disabled:opacity-70 flex items-center justify-center shadow-md hover:shadow-lg"
            >
              {isSubmitting ? 'Processing...' : 'Place Order securely'}
            </button>
            
            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              100% Safe and Secure Checkout
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
              {discountApplied && <p className="text-green-600 text-xs mt-1">Discount code '{couponCode.toUpperCase()}' applied!</p>}

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
