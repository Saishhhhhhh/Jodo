'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, Phone, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { storefrontApi } from '@/lib/api-client';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email) {
      setStatus('error');
      setErrorMessage('First name and email are required');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${apiUrl}/storefront/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit form');
      }

      setStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
      
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-0">
        
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#1C1A17] mb-4"
          >
            So, what’s on your mind?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-3 md:mt-4 mx-auto max-w-2xl text-gray-600 text-base md:text-lg px-2 md:px-0 leading-relaxed font-normal"
          >
            Whether you have a question about our collections, need help with assembly, or just want to say hello we’re here.
          </motion.p>
        </div>

        {/* 4.2 Contact Information Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Headquarters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="group relative bg-[#FCF6F4] p-6 md:p-10 rounded-[32px] flex flex-col items-center text-center border border-transparent hover:border-terracotta/20 hover:bg-white hover:-translate-y-1.5 hover:shadow-xl hover:shadow-terracotta/5 transition-all duration-500"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-6 md:mb-8 text-terracotta group-hover:bg-terracotta group-hover:text-white transition-all duration-500 group-hover:scale-105">
              <MapPin className="w-6 h-6 md:w-7 md:h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-lg md:text-xl text-[#1C1A17] font-bold tracking-tight mb-2 md:mb-3">Headquarters</h3>
            <p className="text-gray-600 text-[15px] md:text-base leading-relaxed">
              JODO HQ, Andheri West<br />
              Mumbai, Maharashtra 400053
            </p>
          </motion.div>

          {/* Card 2: Write to us */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="group relative bg-[#FCF6F4] p-6 md:p-10 rounded-[32px] flex flex-col items-center text-center border border-transparent hover:border-terracotta/20 hover:bg-white hover:-translate-y-1.5 hover:shadow-xl hover:shadow-terracotta/5 transition-all duration-500"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-6 md:mb-8 text-terracotta group-hover:bg-terracotta group-hover:text-white transition-all duration-500 group-hover:scale-105">
              <Mail className="w-6 h-6 md:w-7 md:h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-lg md:text-xl text-[#1C1A17] font-bold tracking-tight mb-2 md:mb-3">Write to us</h3>
            <div className="flex flex-col gap-1.5 text-[15px] md:text-base">
              <p className="text-gray-600">
                <span className="font-semibold text-[#1C1A17]">General:</span>{' '}
                <a href="mailto:hello@jodoshop.com" className="hover:text-terracotta transition-colors underline-offset-2 hover:underline">
                  hello@jodoshop.com
                </a>
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-[#1C1A17]">Support:</span>{' '}
                <a href="mailto:support@jodoshop.com" className="hover:text-terracotta transition-colors underline-offset-2 hover:underline">
                  support@jodoshop.com
                </a>
              </p>
            </div>
          </motion.div>

          {/* Card 3: Call us */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="group relative bg-[#FCF6F4] p-6 md:p-10 rounded-[32px] flex flex-col items-center text-center border border-transparent hover:border-terracotta/20 hover:bg-white hover:-translate-y-1.5 hover:shadow-xl hover:shadow-terracotta/5 transition-all duration-500"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-6 md:mb-8 text-terracotta group-hover:bg-terracotta group-hover:text-white transition-all duration-500 group-hover:scale-105">
              <Phone className="w-6 h-6 md:w-7 md:h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-lg md:text-xl text-[#1C1A17] font-bold tracking-tight mb-2 md:mb-3">Call us</h3>
            <div className="flex flex-col gap-1.5 text-[15px] md:text-base">
              <p className="text-gray-600">
                <span className="font-semibold text-[#1C1A17]">Primary:</span>{' '}
                <a href="tel:+919004380874" className="hover:text-terracotta transition-colors underline-offset-2 hover:underline font-medium">
                  +91 9004380874
                </a>
              </p>
            </div>
          </motion.div>
        </div>

        {/* 4.3 Contact Form & Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[700px]">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white rounded-[40px] p-6 sm:p-10 md:p-14 lg:p-16 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-gray-100 h-full flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-cream opacity-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <h2 className="text-2xl md:text-3xl text-[#1C1A17] mb-8 font-bold relative z-10 tracking-tight">
              Send a Message
            </h2>
            
            <form className="space-y-6 md:space-y-7 flex-1 relative z-10" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    First Name *
                  </label>
                  <input 
                    type="text" 
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full bg-[#FCF6F4] border border-transparent rounded-xl px-4 py-3.5 text-base text-[#1C1A17] placeholder-gray-400 focus:outline-none focus:border-terracotta focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Last Name
                  </label>
                  <input 
                    type="text" 
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full bg-[#FCF6F4] border border-transparent rounded-xl px-4 py-3.5 text-base text-[#1C1A17] placeholder-gray-400 focus:outline-none focus:border-terracotta focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Email Address *
                  </label>
                  <input 
                    type="email" 
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full bg-[#FCF6F4] border border-transparent rounded-xl px-4 py-3.5 text-base text-[#1C1A17] placeholder-gray-400 focus:outline-none focus:border-terracotta focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full bg-[#FCF6F4] border border-transparent rounded-xl px-4 py-3.5 text-base text-[#1C1A17] placeholder-gray-400 focus:outline-none focus:border-terracotta focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Message
                </label>
                <textarea 
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your space, your way, where do we start?"
                  rows={4}
                  className="w-full bg-[#FCF6F4] border border-transparent rounded-xl p-4 text-base text-[#1C1A17] placeholder-gray-400 focus:outline-none focus:border-terracotta focus:bg-white transition-all resize-none"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
              )}

              {status === 'success' ? (
                <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-xl border border-green-100">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium text-[15px]">Message sent! We'll get back to you shortly.</span>
                </div>
              ) : (
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="mt-4 bg-terracotta text-white rounded-full px-8 py-4 text-base font-bold hover:bg-[#b0482c] transition-all duration-300 flex items-center justify-center gap-3 group shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span>{status === 'loading' ? 'Sending...' : 'Send Message →'}</span>
                </button>
              )}
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="w-full h-[400px] lg:h-full rounded-[40px] overflow-hidden relative shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-gray-100 group"
          >
            <iframe 
              src="https://maps.google.com/maps?q=Mumbai,%20Maharashtra&t=m&z=12&output=embed&iwloc=near" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 object-cover"
            />
            <div className="absolute inset-0 pointer-events-none rounded-[40px] border border-black/5" />
          </motion.div>
          
        </div>

        {/* 4.4 Full-width Image CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 md:mt-24 relative rounded-[24px] md:rounded-[40px] overflow-hidden min-h-[340px] md:min-h-[440px] flex items-center justify-center group shadow-xl mb-16"
        >
          <img 
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80" 
            alt="Experience JODO"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors duration-500"></div>
          
          <div className="relative z-10 text-center px-5 md:px-8 py-12 md:py-20 max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl md:text-5xl text-white font-bold mb-3 md:mb-5 tracking-tight leading-tight">
              Let’s get your space together, come experience JODO
            </h2>
            <p className="text-[15px] md:text-lg text-white/90 mb-6 md:mb-10 max-w-2xl leading-relaxed">
              Visit our Mumbai experience centre, assemble a piece yourself and see how JODO comes together. No sales pressure just the joy of it.
            </p>
            <a 
              href="https://maps.google.com/maps?q=Mumbai,%20Maharashtra"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#1C1A17] rounded-full px-8 py-3.5 md:px-10 md:py-4 text-base md:text-lg font-bold hover:bg-terracotta hover:text-white transition-all duration-300 shadow-xl flex items-center gap-2 active:scale-95"
            >
              Drop in →
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
