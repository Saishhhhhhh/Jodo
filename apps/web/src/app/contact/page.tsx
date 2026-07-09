'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, Phone, Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white"> {/* White background for the entire page */}
      {/* Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[3.5rem] md:text-[5rem] lg:text-[7.5rem] leading-[0.9] tracking-tighter text-jodo-dark font-medium"
          >
            Get In Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-6 mx-auto max-w-2xl text-taupe-dark text-lg md:text-xl"
          >
            Whether you have a question about our collections, need design advice, or just want to say hello — we're ready to help.
          </motion.p>
        </div>

        {/* 3-Column Info Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Location */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="group relative bg-[#FCF6F4] p-10 rounded-[32px] flex flex-col items-center text-center border border-transparent hover:border-terracotta/20 hover:bg-white hover:-translate-y-2 hover:shadow-xl hover:shadow-terracotta/5 transition-all duration-500"
          >
            <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-8 text-terracotta group-hover:bg-terracotta group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              <MapPin className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-xl text-jodo-dark font-bold tracking-tight mb-3">Headquarters</h3>
            <p className="text-gray-500 text-lg leading-relaxed">
              Jodo HQ, Andheri West<br />
              Mumbai, Maharashtra 400053
            </p>
          </motion.div>

          {/* Card 2: Email */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="group relative bg-[#FCF6F4] p-10 rounded-[32px] flex flex-col items-center text-center border border-transparent hover:border-terracotta/20 hover:bg-white hover:-translate-y-2 hover:shadow-xl hover:shadow-terracotta/5 transition-all duration-500"
          >
            <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-8 text-terracotta group-hover:bg-terracotta group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
              <Mail className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-xl text-jodo-dark font-bold tracking-tight mb-3">Email Us</h3>
            <div className="flex flex-col gap-2">
              <a href="mailto:hello@jodo.com" className="text-gray-500 text-lg hover:text-terracotta transition-colors">hello@jodo.com</a>
              <a href="mailto:support@jodo.com" className="text-gray-500 text-lg hover:text-terracotta transition-colors">support@jodo.com</a>
            </div>
          </motion.div>

          {/* Card 3: Phone */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="group relative bg-[#FCF6F4] p-10 rounded-[32px] flex flex-col items-center text-center border border-transparent hover:border-terracotta/20 hover:bg-white hover:-translate-y-2 hover:shadow-xl hover:shadow-terracotta/5 transition-all duration-500"
          >
            <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-8 text-terracotta group-hover:bg-terracotta group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              <Phone className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-xl text-jodo-dark font-bold tracking-tight mb-3">Call Us</h3>
            <div className="flex flex-col gap-2">
              <a href="tel:+919876543210" className="text-gray-500 text-lg hover:text-terracotta transition-colors">+91 98765 43210</a>
              <a href="tel:+919876543211" className="text-gray-500 text-lg hover:text-terracotta transition-colors">+91 98765 43211</a>
            </div>
          </motion.div>
        </div>

        {/* 2-Column Grid: Form & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[700px]">
          
          {/* Left Side: The Form */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="bg-white rounded-[40px] p-10 md:p-14 lg:p-16 shadow-[0_2px_20px_rgba(0,0,0,0.03)] h-full flex flex-col justify-center relative overflow-hidden"
          >
            {/* Soft background decor inside form card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cream opacity-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <h2 className="text-3xl md:text-4xl text-jodo-dark mb-10 font-medium relative z-10">Send a Message</h2>
            
            <form className="space-y-8 flex-1 relative z-10" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative group">
                  <input 
                    type="text" 
                    id="firstName"
                    placeholder=" "
                    className="block w-full bg-transparent border-b border-taupe-light py-4 text-lg text-jodo-dark focus:outline-none focus:border-terracotta transition-colors peer"
                  />
                  <label htmlFor="firstName" className="absolute left-0 top-4 text-taupe-dark text-lg transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-terracotta peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs cursor-text">First Name</label>
                </div>
                <div className="relative group">
                  <input 
                    type="text" 
                    id="lastName"
                    placeholder=" "
                    className="block w-full bg-transparent border-b border-taupe-light py-4 text-lg text-jodo-dark focus:outline-none focus:border-terracotta transition-colors peer"
                  />
                  <label htmlFor="lastName" className="absolute left-0 top-4 text-taupe-dark text-lg transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-terracotta peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs cursor-text">Last Name</label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative group">
                  <input 
                    type="email" 
                    id="email"
                    placeholder=" "
                    className="block w-full bg-transparent border-b border-taupe-light py-4 text-lg text-jodo-dark focus:outline-none focus:border-terracotta transition-colors peer"
                  />
                  <label htmlFor="email" className="absolute left-0 top-4 text-taupe-dark text-lg transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-terracotta peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs cursor-text">Email Address</label>
                </div>
                <div className="relative group">
                  <input 
                    type="tel" 
                    id="phone"
                    placeholder=" "
                    className="block w-full bg-transparent border-b border-taupe-light py-4 text-lg text-jodo-dark focus:outline-none focus:border-terracotta transition-colors peer"
                  />
                  <label htmlFor="phone" className="absolute left-0 top-4 text-taupe-dark text-lg transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-terracotta peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs cursor-text">Phone Number</label>
                </div>
              </div>

              <div className="relative group pt-4">
                <textarea 
                  id="message"
                  placeholder=" "
                  rows={4}
                  className="block w-full bg-transparent border-b border-taupe-light py-4 text-lg text-jodo-dark focus:outline-none focus:border-terracotta transition-colors peer resize-none"
                />
                <label htmlFor="message" className="absolute left-0 top-8 text-taupe-dark text-lg transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-terracotta peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs cursor-text">How can we help you today?</label>
              </div>

              <button 
                type="submit"
                className="mt-10 bg-terracotta text-white rounded-[16px] pl-6 pr-2 py-2 text-lg font-bold hover:bg-[#C25135] transition-colors duration-300 flex items-center justify-center gap-4 group w-fit"
              >
                <span>Send Message</span>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-terracotta shrink-0">
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </div>
              </button>
            </form>
          </motion.div>

          {/* Right Side: The Interactive Map */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="w-full h-[400px] lg:h-full rounded-[40px] overflow-hidden relative shadow-[0_2px_20px_rgba(0,0,0,0.03)] group"
          >
            <iframe 
              src="https://maps.google.com/maps?q=Mumbai,%20Maharashtra&t=m&z=12&output=embed&iwloc=near" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale-[0.6] group-hover:grayscale-0 transition-all duration-1000 object-cover"
            />
            {/* Subtle overlay pointer event none so map remains interactive */}
            <div className="absolute inset-0 pointer-events-none rounded-[40px] border border-black/5" />
          </motion.div>
          
        </div>

        {/* Full-width Image CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-20 md:mt-24 relative rounded-[40px] overflow-hidden min-h-[400px] flex items-center justify-center group shadow-[0_2px_20px_rgba(0,0,0,0.03)]"
        >
          <img 
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80" 
            alt="Crafting Excellence"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500"></div>
          
          <div className="relative z-10 text-center px-6 py-16 max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl text-white font-medium mb-6 tracking-tight leading-tight">
              Experience our craftsmanship in person.
            </h2>
            <p className="text-lg text-white/90 mb-10 max-w-2xl leading-relaxed">
              Visit our Mumbai showroom to feel the textures, see the finishes, and meet our design consultants. Let's build something beautiful together.
            </p>
            <button className="bg-white text-jodo-dark rounded-full px-10 py-4 text-lg font-bold hover:-translate-y-1 hover:bg-terracotta hover:text-white transition-all duration-300 shadow-lg flex items-center gap-4">
              Book a Showroom Visit
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
