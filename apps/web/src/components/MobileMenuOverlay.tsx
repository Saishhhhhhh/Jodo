'use client';

import { X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: { label: string; url: string }[];
}

export default function MobileMenuOverlay({ isOpen, onClose, menuItems }: MobileMenuOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full-Screen Menu */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 bg-white z-[200] flex flex-col"
          >
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
              <Link href="/" onClick={onClose} className="flex items-center h-[38px]">
                <Image
                  src="/logo.png"
                  alt="Jodo"
                  width={120}
                  height={38}
                  className="h-[36px] w-auto object-contain"
                  priority
                />
              </Link>
              <button 
                onClick={onClose}
                className="p-1 -mr-1 text-gray-400 hover:text-gray-900 transition-colors z-10 relative"
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <nav className="flex flex-col gap-2">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
                  >
                    <Link
                      href={item.url}
                      onClick={onClose}
                      className="flex items-center justify-between py-2.5 group"
                    >
                      <span className="text-[16px] font-medium text-gray-900 group-hover:text-terracotta transition-colors">
                        {item.label}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-terracotta group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Footer Area */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="px-8 py-6 border-t border-gray-100 flex flex-row items-center justify-between mt-auto bg-gray-50/30"
            >
              <Link 
                href="/account"
                onClick={onClose}
                className="text-sm font-semibold text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors"
              >
                My Account
              </Link>
              <Link 
                href="/wishlist"
                onClick={onClose}
                className="text-sm font-semibold text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors"
              >
                Wishlist
              </Link>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
