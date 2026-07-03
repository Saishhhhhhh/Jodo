'use client';

import React from 'react';
import { useCustomerStore } from '../../store/useCustomerStore';

export default function AccountProfilePage() {
  const { customer } = useCustomerStore();

  if (!customer) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h2>
        <p className="text-gray-500 text-sm">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Personal Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">First Name</label>
                <p className="text-gray-900 font-medium">{customer.firstName}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Last Name</label>
                <p className="text-gray-900 font-medium">{customer.lastName}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email Address</label>
                <p className="text-gray-900 font-medium">{customer.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Phone Number</label>
                <p className="text-gray-900 font-medium">{customer.phone || 'Not provided'}</p>
              </div>
            </div>
            
            <button className="mt-6 text-[#B65A45] text-sm font-semibold hover:underline">
              Edit Details
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Security</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Password</label>
                <p className="text-gray-900 font-medium">••••••••</p>
              </div>
            </div>
            
            <button className="mt-6 text-[#B65A45] text-sm font-semibold hover:underline">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
