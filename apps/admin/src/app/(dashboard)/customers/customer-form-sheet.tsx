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
import { User, Phone, Mail, ShieldAlert } from 'lucide-react';

interface CustomerFormSheetProps {
  customer: any | null; // Null in add mode
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerFormSheet({ customer, open, onOpenChange }: CustomerFormSheetProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!customer;

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Load initial details if editing
  useEffect(() => {
    if (open) {
      if (customer) {
        setFirstName(customer.firstName || '');
        setLastName(customer.lastName || '');
        setEmail(customer.email || '');
        setPhone(customer.phone || '');
        setStatus(customer.status || 'active');
      } else {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setStatus('active');
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

    mutation.mutate({
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      status,
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
