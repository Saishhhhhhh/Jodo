'use client';

import React, { useState } from 'react';
import { useCustomerStore } from '../../store/useCustomerStore';
import { Eye, EyeOff } from 'lucide-react';

export default function AccountProfilePage() {
  const { customer, token, setCustomer } = useCustomerStore();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    phone: customer?.phone || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  if (!customer) return null;

  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileMessage('');
    try {
      const res = await fetch('http://localhost:4000/api/storefront/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.data.customer, token!);
        setProfileMessage('Profile updated successfully.');
        setIsEditingProfile(false);
      } else {
        setProfileMessage(data.message || 'Failed to update profile.');
      }
    } catch {
      setProfileMessage('A network error occurred.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    setPasswordMessage({ type: '', text: '' });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/storefront/auth/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
        setIsChangingPassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMessage({ type: 'error', text: data.message || 'Failed to change password.' });
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'A network error occurred.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h2>
        <p className="text-gray-500 text-sm">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Personal Details */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Personal Details</h3>
            
            {profileMessage && (
              <div className={`text-sm p-3 rounded-lg mb-4 ${profileMessage.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {profileMessage}
              </div>
            )}

            {!isEditingProfile ? (
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
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="mt-6 text-[#B65A45] text-sm font-semibold hover:underline"
                >
                  Edit Details
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input 
                    type="text" 
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={customer.email}
                    disabled
                    className="w-full px-3 py-2 rounded border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={handleProfileSave}
                    disabled={profileLoading}
                    className="px-4 py-2 bg-[#B65A45] text-white text-sm font-bold rounded-lg hover:bg-[#a04e3b] transition-colors disabled:opacity-70"
                  >
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileForm({ firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone || '' });
                      setProfileMessage('');
                    }}
                    disabled={profileLoading}
                    className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-bold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-70"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security / Password */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Security</h3>
            
            {passwordMessage.text && (
              <div className={`text-sm p-3 rounded-lg mb-4 ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {passwordMessage.text}
              </div>
            )}

            {!isChangingPassword ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Password</label>
                  <p className="text-gray-900 font-medium">••••••••</p>
                </div>
                <button 
                  onClick={() => setIsChangingPassword(true)}
                  className="mt-6 text-[#B65A45] text-sm font-semibold hover:underline"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? 'text' : 'password'} 
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? 'text' : 'password'} 
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={handlePasswordSave}
                    disabled={passwordLoading}
                    className="px-4 py-2 bg-[#B65A45] text-white text-sm font-bold rounded-lg hover:bg-[#a04e3b] transition-colors disabled:opacity-70"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button 
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordMessage({ type: '', text: '' });
                    }}
                    disabled={passwordLoading}
                    className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-bold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-70"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
