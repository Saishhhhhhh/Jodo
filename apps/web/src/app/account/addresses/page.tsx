'use client';

import React, { useState } from 'react';
import { useCustomerStore } from '../../../store/useCustomerStore';
import { MapPin } from 'lucide-react';

export default function AccountAddressesPage() {
  const { customer, token, setCustomer } = useCustomerStore();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: customer?.defaultShippingAddress?.firstName || '',
    lastName: customer?.defaultShippingAddress?.lastName || '',
    address1: customer?.defaultShippingAddress?.address1 || '',
    address2: customer?.defaultShippingAddress?.address2 || '',
    city: customer?.defaultShippingAddress?.city || '',
    state: customer?.defaultShippingAddress?.state || '',
    zip: customer?.defaultShippingAddress?.zip || '',
    country: customer?.defaultShippingAddress?.country || 'India',
    phone: customer?.defaultShippingAddress?.phone || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!customer) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ defaultShippingAddress: form }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.data.customer, token!);
        setMessage({ type: 'success', text: 'Address updated successfully.' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update address.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'A network error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  const hasAddress = !!customer.defaultShippingAddress?.address1;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Addresses</h2>
        <p className="text-gray-500 text-sm">Manage your default shipping address.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-gray-50 p-6 sm:p-8 rounded-xl border border-gray-100">
        {!isEditing ? (
          <div>
            {hasAddress ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#B65A45]" />
                  <h3 className="font-semibold text-gray-900">Default Shipping Address</h3>
                </div>
                <address className="not-italic text-gray-600 space-y-1 ml-7">
                  <p className="font-medium text-gray-900">{customer.defaultShippingAddress?.firstName} {customer.defaultShippingAddress?.lastName}</p>
                  <p>{customer.defaultShippingAddress?.address1}</p>
                  {customer.defaultShippingAddress?.address2 && <p>{customer.defaultShippingAddress?.address2}</p>}
                  <p>{customer.defaultShippingAddress?.city}, {customer.defaultShippingAddress?.state} {customer.defaultShippingAddress?.zip}</p>
                  <p>{customer.defaultShippingAddress?.country}</p>
                  {customer.defaultShippingAddress?.phone && <p className="pt-2">{customer.defaultShippingAddress?.phone}</p>}
                </address>
                
                <button 
                  onClick={() => setIsEditing(true)}
                  className="mt-6 ml-7 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit Address
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No Address Saved</h3>
                <p className="text-gray-500 text-sm mb-6">Add a default address to checkout faster next time.</p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-[#B65A45] text-white text-sm font-bold rounded-xl hover:bg-[#a04e3b] transition-colors"
                >
                  Add New Address
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="font-semibold text-gray-900 mb-4">{hasAddress ? 'Edit Address' : 'Add New Address'}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input 
                  type="text" 
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input 
                  type="text" 
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <input 
                type="text" 
                required
                value={form.address1}
                onChange={(e) => setForm({ ...form, address1: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
              <input 
                type="text" 
                value={form.address2}
                onChange={(e) => setForm({ ...form, address2: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input 
                  type="text" 
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input 
                  type="text" 
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal</label>
                <input 
                  type="text" 
                  required
                  value={form.zip}
                  onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select 
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45] bg-white"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button 
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-[#B65A45] text-white font-bold rounded-lg hover:bg-[#a04e3b] transition-colors disabled:opacity-70"
              >
                {isLoading ? 'Saving...' : 'Save Address'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setMessage({ type: '', text: '' });
                }}
                disabled={isLoading}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
