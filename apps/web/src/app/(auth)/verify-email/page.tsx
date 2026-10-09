'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomerStore } from '../../../store/useCustomerStore';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Lock,
} from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setCustomer = useCustomerStore((state) => state.setCustomer);

  // Email state
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  // 6 OTP boxes state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // 30-second resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);

  // Resolve email on load
  useEffect(() => {
    const queryEmail = searchParams.get('email');
    const storedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('jodo_verify_email') : null;
    const storedMasked = typeof window !== 'undefined' ? sessionStorage.getItem('jodo_masked_email') : null;

    const resolvedEmail = queryEmail || storedEmail || '';
    setEmail(resolvedEmail);

    if (storedMasked) {
      setMaskedEmail(storedMasked);
    } else if (resolvedEmail) {
      const [name, domain] = resolvedEmail.split('@');
      if (name && domain) {
        const masked = name.length <= 2 ? `${name[0]}*@${domain}` : `${name.slice(0, 2)}${'*'.repeat(Math.max(2, name.length - 2))}@${domain}`;
        setMaskedEmail(masked);
      }
    }

    // Auto-focus first input box
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, [searchParams]);

  // Cooldown countdown interval
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle single digit input
  const handleDigitChange = (index: number, value: string) => {
    setError('');

    // Only allow numbers
    const cleaned = value.replace(/\D/g, '');

    if (!cleaned) {
      // User deleted character
      const nextDigits = [...otpDigits];
      nextDigits[index] = '';
      setOtpDigits(nextDigits);
      return;
    }

    // Take only the last character if multiple were typed
    const singleDigit = cleaned.slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = singleDigit;
    setOtpDigits(nextDigits);

    // Auto-advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste full OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const nextDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(nextDigits);

    // Focus last filled index or next empty
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // Submit OTP Verification
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const completeOtp = otpDigits.join('');
    if (completeOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    if (!email) {
      setError('Email address is missing. Please re-enter your email below.');
      return;
    }

    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const res = await fetch(`${apiUrl}/api/storefront/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: completeOtp }),
      });

      const data = await res.json();

      if (data.success && data.data?.token) {
        setIsVerified(true);
        setSuccessMessage('Email verified successfully! Preparing your account...');

        // Update Zustand customer auth store
        setCustomer(data.data.customer, data.data.token);

        // Clear session storage
        sessionStorage.removeItem('jodo_verify_email');
        sessionStorage.removeItem('jodo_masked_email');

        // Redirect after short celebration
        setTimeout(() => {
          router.push('/account');
        }, 1500);
      } else {
        setError(data.message || 'Invalid or expired verification code.');
      }
    } catch {
      setError('A network error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setError('');

    if (!email) {
      setError('Please provide your email address to request a new code.');
      return;
    }

    try {
      setIsResending(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const res = await fetch(`${apiUrl}/api/storefront/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (data.success) {
        setResendCooldown(30);
        setSuccessMessage('A fresh verification code has been dispatched to your email.');
        // Clear entered digits and focus first
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      } else {
        setError(data.message || 'Failed to resend code. Please try again.');
      }
    } catch {
      setError('Network error while resending verification code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center bg-gray-50 px-4 font-sans py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
        {/* Verification Success State */}
        {isVerified ? (
          <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/70">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Email Verified Successfully!
            </h2>

            <p className="text-sm text-gray-600 max-w-xs mx-auto">
              Your Jodo account is now fully active. Redirecting you to your account dashboard...
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#B65A45]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Redirecting...</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header Icon */}
            <div className="w-12 h-12 bg-[#FAF6F4] text-[#B65A45] rounded-xl flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
              Verify Your Email
            </h1>

            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              We&apos;ve sent a 6-digit verification code to{' '}
              <span className="font-semibold text-gray-800">
                {maskedEmail || email || 'your email address'}
              </span>{' '}
              from <span className="font-medium text-gray-700">kaverivalve51@gmail.com</span>.
            </p>

            {/* Error Message Alert */}
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-xl mb-5 border border-red-100 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {/* Success Message Banner */}
            {successMessage && !error && (
              <div className="bg-emerald-50 text-emerald-700 text-xs p-3.5 rounded-xl mb-5 border border-emerald-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>{successMessage}</div>
              </div>
            )}

            {/* Manual Email Input if email is missing */}
            {!email && (
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B65A45]"
                />
              </div>
            )}

            {/* 6 OTP Input Boxes Form */}
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2.5 text-center">
                  Enter 6-Digit Code
                </label>
                <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      disabled={isLoading}
                      className="w-12 h-14 sm:w-13 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#B65A45] focus:border-transparent transition-all shadow-2xs disabled:opacity-50"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 text-center mt-2.5">
                  Code expires in 10 minutes.
                </p>
              </div>

              {/* Verify CTA */}
              <button
                type="submit"
                disabled={isLoading || otpDigits.join('').length !== 6}
                className="w-full py-3.5 bg-[#B65A45] text-white font-bold rounded-xl hover:bg-[#a04e3b] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Resend Code Section */}
            <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col items-center justify-center gap-2 text-xs text-gray-500">
              <div>Didn&apos;t receive the code?</div>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isResending || isLoading}
                className="font-bold text-[#B65A45] hover:underline disabled:text-gray-400 disabled:no-underline transition-colors flex items-center gap-1.5"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending code...</span>
                  </>
                ) : resendCooldown > 0 ? (
                  <span>Resend Code in {resendCooldown}s</span>
                ) : (
                  <span>Resend Code</span>
                )}
              </button>
            </div>

            {/* Back to Sign In Link */}
            <div className="mt-5 text-center">
              <Link
                href="/login"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
          <RefreshCw className="w-6 h-6 animate-spin text-[#B65A45]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
