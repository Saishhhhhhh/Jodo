'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const giftCardSchema = z.object({
  code: z.string().optional().default(''),
  initialValue: z.coerce.number().min(1, 'Value must be at least ₹1'),
  balance: z.coerce.number().min(0, 'Balance cannot be negative').optional(),
  expiryDate: z.string().optional().default(''),
  recipientEmail: z.string().email('Please enter a valid email').or(z.literal('')).optional().default(''),
  note: z.string().optional().default(''),
  status: z.enum(['active', 'disabled', 'expired']).default('active'),
});

type GiftCardFormValues = z.infer<typeof giftCardSchema>;

interface GiftCardSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftCard: any | null; // null if adding
  onSave: (values: any) => void;
  isLoading?: boolean;
}

export function GiftCardSheet({
  open,
  onOpenChange,
  giftCard,
  onSave,
  isLoading,
}: GiftCardSheetProps) {
  const isEditing = !!giftCard;

  const form = useForm<GiftCardFormValues>({
    resolver: zodResolver(giftCardSchema),
    defaultValues: {
      code: '',
      initialValue: 1000,
      balance: 1000,
      expiryDate: '',
      recipientEmail: '',
      note: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (open) {
      if (giftCard) {
        form.reset({
          code: giftCard.code || '',
          initialValue: giftCard.initialValue || 0,
          balance: giftCard.balance ?? giftCard.initialValue,
          expiryDate: giftCard.expiryDate ? new Date(giftCard.expiryDate).toISOString().split('T')[0] : '',
          recipientEmail: giftCard.recipientEmail || '',
          note: giftCard.note || '',
          status: giftCard.status || 'active',
        });
      } else {
        form.reset({
          code: '',
          initialValue: 1000,
          balance: 1000,
          expiryDate: '',
          recipientEmail: '',
          note: '',
          status: 'active',
        });
      }
    }
  }, [open, giftCard, form]);

  function onSubmit(values: GiftCardFormValues) {
    onSave(values);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Gift Card' : 'Issue Gift Card'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the balance, status, or notes of this gift card.'
              : 'Create a new gift card with a custom or auto-generated code.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {!isEditing ? (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gift Card Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SUMMER-GIFT-500 (Leave blank to auto-generate)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Codes are automatically converted to uppercase.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-muted-foreground">Gift Card Code</label>
                <div className="font-mono font-bold bg-muted p-2 rounded text-sm tracking-wider">
                  {giftCard?.code}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="initialValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Value (INR)</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditing && (
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Balance (INR)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name="recipientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="customer@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                        <option value="expired">Expired</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add notes for internal reference..." className="h-16" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Issue Card'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
