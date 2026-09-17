'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { User, Phone, Mail, Tag, KeyRound, Lock } from 'lucide-react';

interface CustomerFormSheetProps {
  customer: any | null; // Null in add mode
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResetPasswordClick?: (customer: any) => void;
}

export function CustomerFormSheet({ customer, open, onOpenChange, onResetPasswordClick }: CustomerFormSheetProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!customer;

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [tagsString, setTagsString] = useState('');

  // Load initial details if editing
  useEffect(() => {
    if (open) {
      if (customer) {
        setFirstName(customer.firstName || '');
        setLastName(customer.lastName || '');
        setEmail(customer.email || '');
        setPhone(customer.phone || '');
        setPassword('');
        setStatus(customer.status || 'active');
        setTagsString(customer.tags ? customer.tags.join(', ') : '');
      } else {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setStatus('active');
        setTagsString('');
      }
    }
  }, [open, customer]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEditMode) {
        return customersApi.update(customer._id, data);
      }
      return customersApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      // Invalidate segments too since tags changed
      queryClient.invalidateQueries({ queryKey: ['segments-list'] });
      toast.success(isEditMode ? 'Customer updated successfully' : 'Customer created successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error('First name, last name, and email are required');
      return;
    }

    if (password && password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Parse comma separated tags
    const tags = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    mutation.mutate({
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      status,
      tags,
      ...(password ? { password } : {}),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto border-l border-zinc-800 bg-background">
        <form onSubmit={handleSubmit} className="space-y-6">
          <SheetHeader className="pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-indigo-400">
              <User className="h-5 w-5" />
              <SheetTitle className="text-xl font-bold tracking-tight">
                {isEditMode ? 'Edit Customer Profile' : 'Add New Customer'}
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              {isEditMode 
                ? 'Update contact info and account status for this customer.' 
                : 'Create a new customer profile for manual order placements.'}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-2">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-zinc-400">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="e.g. John" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold text-zinc-400">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="e.g. Doe" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-zinc-400">Email Address</Label>
              <div className="relative flex">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input 
                  id="email" 
                  type="email"
                  placeholder="john.doe@example.com" 
                  className="pl-9"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-zinc-400">Phone Number (Optional)</Label>
              <div className="relative flex">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input 
                  id="phone" 
                  placeholder="+91 99999 99999" 
                  className="pl-9"
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Password Management */}
            {!isEditMode ? (
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-zinc-400">Initial Storefront Password (Optional)</Label>
                <div className="relative flex">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="Set temporary password (min. 6 chars)" 
                    className="pl-9 font-mono text-sm"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">If provided, the customer can immediately sign in to the storefront.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <KeyRound className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold">Storefront Password</span>
                  </div>
                  {onResetPasswordClick && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        onResetPasswordClick(customer);
                      }}
                      className="h-7 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                    >
                      <KeyRound className="h-3.5 w-3.5 mr-1" /> Reset Password
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">
                  Reset customer's password to generate or enter a new login credential.
                </p>
              </div>
            )}

            {/* Tags Field */}
            <div className="space-y-1.5">
              <Label htmlFor="tags" className="text-xs font-semibold text-zinc-400">Customer Tags (Comma-separated)</Label>
              <div className="relative flex">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input 
                  id="tags" 
                  placeholder="wholesale, vip, local-buyer" 
                  className="pl-9"
                  value={tagsString} 
                  onChange={(e) => setTagsString(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Tags let you manually classify and dynamic-segment customer cohorts.</p>
            </div>

            {/* Status Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400">Account Status</Label>
              <Select 
                value={status} 
                onValueChange={(val: any) => setStatus(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="border-t border-zinc-800 pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {mutation.isPending ? 'Saving...' : 'Save Customer'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
