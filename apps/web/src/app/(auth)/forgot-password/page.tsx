'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  KeyRound,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Multi-step flow: 'request' | 'reset' | 'success'
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');

  // Form values
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 60-second cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle single OTP digit input
  const handleDigitChange = (index: number, value: string) => {
    setError('');
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }
    const singleDigit = cleaned.slice(-1);
    const next = [...otpDigits];
    next[index] = singleDigit;
    setOtpDigits(next);
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    setOtpDigits(next);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/storefront/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (data.success) {
        setMaskedEmail(data.data?.maskedEmail || email);
        setStep('reset');
        setResendCooldown(60);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 150);
      } else {
        setError(data.message || 'Failed to send verification code. Please check your email.');
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setError('');
    setIsResending(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/storefront/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (data.success) {
        setResendCooldown(60);
        setSuccessMessage('A fresh verification code has been dispatched to your email.');
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(data.message || 'Failed to resend code.');
      }
    } catch {
      setError('Network error while resending verification code.');
    } finally {
      setIsResending(false);
    }
  };

  // Step 2: Submit Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const completeOtp = otpDigits.join('');
    if (completeOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/storefront/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: completeOtp,
          newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStep('success');
      } else {
        setError(data.message || 'Failed to reset password. Please verify the code and try again.');
      }
    } catch {
      setError('Network error while resetting password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center bg-gray-50 px-4 font-sans py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
        {/* Step 3: Success Celebration State */}
        {step === 'success' && (
          <div className="text-center py-4 space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/70">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Password Reset Successfully!
            </h2>

            <p className="text-sm text-gray-600 max-w-xs mx-auto">
              Your password has been updated. You can now sign in to your Jodo account with your new credentials.
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full py-3.5 bg-[#B65A45] hover:bg-[#a04e3b] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Sign In With New Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Request OTP */}
        {step === 'request' && (
          <>
            <div className="w-12 h-12 bg-[#FAF6F4] text-[#B65A45] rounded-xl flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
              Forgot Your Password?
            </h1>

            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Enter your registered email address and we will dispatch a 6-digit verification code to reset your password.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-xl mb-5 border border-red-100 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45] focus:border-transparent text-sm transition-all"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3.5 bg-[#B65A45] text-white font-bold rounded-xl hover:bg-[#a04e3b] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-gray-500">
              Remember your password?{' '}
              <Link href="/login" className="text-[#B65A45] font-bold hover:underline">
                Back to Sign In
              </Link>
            </div>
          </>
        )}

        {/* Step 2: Enter OTP and Set New Password */}
        {step === 'reset' && (
          <>
            <button
              type="button"
              onClick={() => setStep('request')}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Email</span>
            </button>

            <div className="w-12 h-12 bg-[#FAF6F4] text-[#B65A45] rounded-xl flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
              Reset Your Password
            </h1>

            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              We&apos;ve sent a 6-digit code to{' '}
              <span className="font-semibold text-gray-800">{maskedEmail || email}</span> from{' '}
              <span className="font-medium text-gray-700">kaverivalve51@gmail.com</span>.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-xl mb-5 border border-red-100 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {successMessage && !error && (
              <div className="bg-emerald-50 text-emerald-700 text-xs p-3.5 rounded-xl mb-5 border border-emerald-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>{successMessage}</div>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* 6 OTP Boxes */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2.5 text-center">
                  Enter 6-Digit Code
                </label>
                <div className="flex items-center justify-between gap-2">
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
                      className="w-12 h-13 sm:w-13 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#B65A45] focus:border-transparent transition-all shadow-2xs disabled:opacity-50"
                    />
                  ))}
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45] text-sm pr-11 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B65A45] text-sm pr-11 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading || otpDigits.join('').length !== 6 || !newPassword || !confirmPassword}
                className="w-full py-3.5 bg-[#B65A45] text-white font-bold rounded-xl hover:bg-[#a04e3b] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Resend Code Section */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col items-center justify-center gap-2 text-xs text-gray-500">
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
          </>
        )}
      </div>
    </div>
  );
}
