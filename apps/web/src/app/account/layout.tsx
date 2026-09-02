'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCustomerStore } from '../../store/useCustomerStore';
import { User, Package, MapPin, LogOut } from 'lucide-react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { customer, isAuthenticated, logout } = useCustomerStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not authenticated, force redirect to login
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated() || !customer) {
    return null; // Don't render until redirected
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { name: 'My Profile', href: '/account', icon: User },
    { name: 'Order History', href: '/account/orders', icon: Package },
    { name: 'Addresses', href: '/account/addresses', icon: MapPin },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 font-sans">
      <div className="flex flex-col md:flex-row gap-10">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {customer.firstName}!</p>
          </div>
          
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-[#B65A45]/10 text-[#B65A45]' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#B65A45]' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-4"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 md:p-10 shadow-sm min-h-[500px]">
          {children}
        </main>

      </div>
    </div>
  );
}
