'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { storeApi } from '@/lib/api-client';

const stripeSchema = z.object({
  isActive: z.boolean(),
  publicKey: z.string().min(1, 'Public key is required'),
  secretKey: z.string().min(1, 'Secret key is required'),
});

const paypalSchema = z.object({
  isActive: z.boolean(),
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
});

const razorpaySchema = z.object({
  isActive: z.boolean(),
  keyId: z.string().min(1, 'Key ID is required'),
  keySecret: z.string().min(1, 'Key Secret is required'),
});

interface PaymentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: 'stripe' | 'paypal' | 'razorpay' | null;
  settings: any;
}

export function PaymentSheet({ open, onOpenChange, provider, settings }: PaymentSheetProps) {
  const queryClient = useQueryClient();

  const schemaMap: any = {
    stripe: stripeSchema,
    paypal: paypalSchema,
    razorpay: razorpaySchema,
  };

  const form = useForm({
    resolver: provider ? zodResolver(schemaMap[provider]) : undefined,
    defaultValues: {
      isActive: false,
      publicKey: '',
      secretKey: '',
      clientId: '',
      clientSecret: '',
      keyId: '',
      keySecret: '',
    },
  });

  useEffect(() => {
    if (provider && open && settings) {
      const providerData = settings.payments?.[provider] || {};
      form.reset({
        isActive: providerData.isActive || false,
        publicKey: providerData.publicKey || '',
        secretKey: providerData.secretKey || '',
        clientId: providerData.clientId || '',
        clientSecret: providerData.clientSecret || '',
        keyId: providerData.keyId || '',
        keySecret: providerData.keySecret || '',
      });
    }
  }, [provider, open, settings, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      // Merge with existing settings
      const newSettings = {
        ...settings,
        payments: {
          ...(settings?.payments || {}),
          [provider!]: values,
        },
      };
      return storeApi.update({ settings: newSettings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success(`${provider} settings saved successfully.`);
      onOpenChange(false);
    },
    onError: () => {
      toast.error(`Failed to save ${provider} settings.`);
    },
  });

  function onSubmit(data: any) {
    let cleanData: any = { isActive: data.isActive };
    if (provider === 'stripe') {
      cleanData.publicKey = data.publicKey;
      cleanData.secretKey = data.secretKey;
    } else if (provider === 'paypal') {
      cleanData.clientId = data.clientId;
      cleanData.clientSecret = data.clientSecret;
    } else if (provider === 'razorpay') {
      cleanData.keyId = data.keyId;
      cleanData.keySecret = data.keySecret;
    }
    updateMutation.mutate(cleanData);
  }

  if (!provider) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle className="capitalize">Set up {provider}</SheetTitle>
          <SheetDescription>
            Enter your API credentials to process payments with {provider}.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable {provider}</FormLabel>
                      <FormDescription>
                        Allow customers to check out using this method.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {provider === 'stripe' && (
                <>
                  <FormField
                    control={form.control}
                    name="publicKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publishable Key</FormLabel>
                        <FormControl>
                          <Input placeholder="pk_test_..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secretKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secret Key</FormLabel>
                        <FormControl>
                          <Input placeholder="sk_test_..." type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {provider === 'paypal' && (
                <>
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client ID</FormLabel>
                        <FormControl>
                          <Input placeholder="AXc..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Secret</FormLabel>
                        <FormControl>
                          <Input placeholder="EHa..." type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {provider === 'razorpay' && (
                <>
                  <FormField
                    control={form.control}
                    name="keyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key ID</FormLabel>
                        <FormControl>
                          <Input placeholder="rzp_test_..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="keySecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Secret</FormLabel>
                        <FormControl>
                          <Input placeholder="..." type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="pt-4 flex justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
