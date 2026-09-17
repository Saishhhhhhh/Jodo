'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { customersApi } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Eye, EyeOff, Sparkles, Copy, Check, ShieldCheck, Lock } from 'lucide-react';

interface ResetPasswordDialogProps {
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({ customer, open, onOpenChange }: ResetPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword('');
      setShowPassword(false);
      setCopied(false);
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!customer) return;
      return customersApi.resetPassword(customer._id, { password });
    },
    onSuccess: () => {
      toast.success(`Password updated for ${customer?.firstName} ${customer?.lastName}`);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update customer password');
    },
  });

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let generated = '';
    // Ensure at least 1 uppercase, 1 lowercase, 1 number, 1 symbol
    generated += 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)];
    generated += 'abcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 24)];
    generated += '23456789'[Math.floor(Math.random() * 8)];
    generated += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    for (let i = 0; i < 8; i++) {
      generated += chars[Math.floor(Math.random() * chars.length)];
    }
    // Shuffle
    const shuffled = generated.split('').sort(() => 0.5 - Math.random()).join('');
    setPassword(shuffled);
    setShowPassword(true);
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success('Password copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Unable to copy to clipboard');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    mutation.mutate();
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] border-zinc-800 bg-background shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2.5 text-amber-500">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <KeyRound className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-bold tracking-tight">
                Reset Customer Password
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Set a new storefront login password for{' '}
              <span className="font-semibold text-foreground">
                {customer.firstName} {customer.lastName}
              </span>{' '}
              (<span className="text-zinc-400 font-mono text-[11px]">{customer.email}</span>).
            </DialogDescription>
          </DialogHeader>

          {/* Password Input Section */}
          <div className="space-y-3 py-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-password" className="text-xs font-semibold text-zinc-300">
                New Password
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGeneratePassword}
                className="h-7 px-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Generate
              </Button>
            </div>

            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-4 w-4 text-zinc-500 pointer-events-none" />
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password (min. 6 chars)"
                className="pl-9 pr-20 font-mono text-sm tracking-wide bg-zinc-900/60 border-zinc-800 focus:border-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                minLength={6}
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                {password && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyPassword}
                    className="h-7 w-7 text-zinc-400 hover:text-zinc-200"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-7 w-7 text-zinc-400 hover:text-zinc-200"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Helper Notice */}
            <div className="rounded-lg bg-zinc-900/70 border border-zinc-800/80 p-3 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-[11px] text-zinc-400 leading-snug">
                The password will be securely hashed with bcrypt. The customer can immediately use this new password to sign into the storefront account.
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-zinc-800/80 pt-4 flex sm:justify-between items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={mutation.isPending || !password || password.length < 6}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm transition-all"
            >
              {mutation.isPending ? 'Updating Password...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
