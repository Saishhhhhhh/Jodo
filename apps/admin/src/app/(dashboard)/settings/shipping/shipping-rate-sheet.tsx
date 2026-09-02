'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const generateId = () => Math.random().toString(36).substr(2, 9);

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

const rateSchema = z.object({
  name: z.string().min(1, 'Rate name is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  condition: z.string().optional(),
});

type RateFormValues = z.infer<typeof rateSchema>;

interface ShippingRateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rate: any | null;
  zoneId: string | null;
  onSave: (zoneId: string, rateData: any) => void;
}

export function ShippingRateSheet({ open, onOpenChange, rate, zoneId, onSave }: ShippingRateSheetProps) {
  const isEditing = !!rate;

  const form = useForm<RateFormValues>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      name: '',
      price: 0,
      condition: 'None',
    },
  });

  useEffect(() => {
    if (rate && open) {
      form.reset({
        name: rate.name,
        price: rate.price,
        condition: rate.condition || 'None',
      });
    } else if (open && !rate) {
      form.reset({
        name: '',
        price: 0,
        condition: 'None',
      });
    }
  }, [rate, open, form]);

  function onSubmit(data: RateFormValues) {
    if (!zoneId) return;
    const payload = {
      id: rate ? rate.id : generateId(),
      name: data.name,
      price: data.price,
      condition: data.condition || 'None',
    };
    onSave(zoneId, payload);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Rate' : 'Add Rate'}</SheetTitle>
          <SheetDescription>
            Customers will see this at checkout.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Standard Shipping" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Orders over $50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Save Rate' : 'Add Rate'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
