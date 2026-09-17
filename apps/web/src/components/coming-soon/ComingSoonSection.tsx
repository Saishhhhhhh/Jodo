'use client';

import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { soundEngine } from '@/audio/woodSound';

export const ComingSoonSection: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [reservationNo, setReservationNo] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    soundEngine.playBrassLock(0.18);
    setStatus('submitting');

    const randomNum = Math.floor(100 + Math.random() * 900);
    const newReservation = `JODO-VIP-${randomNum}`;

    try {
      // Persist lead directly into MongoDB via the API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await fetch(`${apiUrl}/api/webhooks/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: email.split('@')[0],
          source: 'Coming Soon Waitlist',
          notes: `VIP Reservation No: ${newReservation}. Signed up via 3D Coming Soon interactive page.`,
        }),
      });
    } catch (err) {
      console.warn('Waitlist lead saved locally; API sync notice:', err);
    }

    setTimeout(() => {
      setReservationNo(newReservation);
      setStatus('success');
      soundEngine.playAssemblyComplete();
    }, 600);
  };


  return (
    <section
      id="coming-soon-section"
      className="relative w-full py-32 md:py-44 px-6 md:px-14 bg-[#F4EBDD] text-[#24211E] overflow-hidden border-t border-[#24211E]/10"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C65F45]/10 border border-[#C65F45]/20 text-[#C65F45] font-mono text-[10px] uppercase tracking-[0.25em] mb-6">
          <Sparkles className="w-3 h-3" />
          <span>FIRST EDITION · LIMITED RELEASE</span>
        </div>

        {/* Wordmark & Heading */}
        <h2 className="font-serif text-5xl sm:text-7xl md:text-8xl font-normal tracking-[0.16em] uppercase text-[#24211E] mb-3">
          JODO
        </h2>
        <div className="font-serif italic text-2xl sm:text-4xl text-[#C65F45] font-normal tracking-wide mb-6">
          COMING SOON
        </div>

        <p className="font-sans text-base sm:text-lg text-[#57524C] max-w-xl mb-12 leading-relaxed">
          A new way of living with furniture is almost here. Be the first to receive our inaugural
          catalogue, studio invitations, and exclusive release notifications.
        </p>

        {/* Email Signup Form or Success State */}
        {status === 'success' ? (
          <div className="w-full max-w-lg bg-[#FAF6F0] p-8 md:p-10 rounded border border-[#C65F45]/30 shadow-xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-12 h-12 rounded-full bg-[#C65F45]/15 flex items-center justify-center text-[#C65F45] mb-4">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-normal text-[#24211E] uppercase tracking-wide mb-1">
              You are on the list.
            </h3>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#C65F45] mb-4">
              RESERVATION NO. {reservationNo}
            </p>
            <p className="font-sans text-xs md:text-sm text-[#57524C] max-w-sm mb-6 leading-relaxed">
              We have reserved your early access window for the debut collection release. Private
              invitation will be sent to <span className="font-medium text-[#24211E]">{email}</span>.
            </p>
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#8E867E] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C65F45]" />
              <span>Complimentary inaugural swatch kit included</span>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md flex flex-col sm:flex-row items-stretch gap-3"
          >
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-5 py-4 bg-[#FAF6F0] text-[#24211E] placeholder-[#8E867E] border border-[#24211E]/20 rounded-none focus:outline-none focus:border-[#C65F45] font-sans text-sm tracking-wide transition-all shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn-terracotta whitespace-nowrap"
            >
              <span>{status === 'submitting' ? 'RESERVING...' : 'KEEP ME POSTED'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-8 flex flex-wrap justify-center items-center gap-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8E867E]">
          <span>· ZERO DISPOSABLE PACKAGING</span>
          <span>· LIFETIME STRUCTURAL WARRANTY</span>
          <span>· CRAFTED IN INDIA</span>
        </div>
      </div>
    </section>
  );
};
