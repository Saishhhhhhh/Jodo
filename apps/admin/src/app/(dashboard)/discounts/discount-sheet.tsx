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
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const discountSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters'),
  type: z.enum(['percentage', 'fixed_amount', 'free_shipping']),
  value: z.coerce.number().min(0, 'Value cannot be negative'),
  status: z.enum(['active', 'scheduled', 'expired']),
});

export type DiscountFormValues = z.infer<typeof discountSchema>;

type Discount = {
  _id: string;
  code: string;
  type: string;
  value: number;
  status: string;
  usageCount: number;
};

interface DiscountSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  discount?: Discount | null;
  onSubmit: (data: DiscountFormValues) => void;
  isLoading?: boolean;
}

export function DiscountSheet({
  isOpen,
  onOpenChange,
  discount,
  onSubmit,
  isLoading,
}: DiscountSheetProps) {
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: '',
      type: 'percentage',
      value: 0,
      status: 'active',
    },
  });

  useEffect(() => {
    if (discount) {
      form.reset({
        code: discount.code,
        type: discount.type as 'percentage' | 'fixed_amount' | 'free_shipping',
        value: discount.value,
        status: discount.status as 'active' | 'scheduled' | 'expired',
      });
    } else {
      form.reset({
        code: '',
        type: 'percentage',
        value: 0,
        status: 'active',
      });
    }
  }, [discount, form, isOpen]);

  const handleSubmit = (values: DiscountFormValues) => {
    onSubmit(values);
  };

  const type = form.watch('type');

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle>{discount ? 'Edit Discount' : 'Create Discount'}</SheetTitle>
          <SheetDescription>
            {discount ? 'Update the details for this discount code.' : 'Add a new discount code for your store.'}
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SUMMER24" {...field} className="uppercase" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                        <SelectItem value="free_shipping">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {type !== 'free_shipping' && (
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount'}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Discount'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
