'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ShieldCheck, FileText, Save, Sparkles } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { storeApi } from '@/lib/api-client';

const policiesSchema = z.object({
  refundPolicy: z.string().optional().default(''),
  privacyPolicy: z.string().optional().default(''),
  termsOfService: z.string().optional().default(''),
  shippingPolicy: z.string().optional().default(''),
  contactInfo: z.string().optional().default(''),
});

type PoliciesFormValues = z.infer<typeof policiesSchema>;

export default function SettingsPoliciesPage() {
  const queryClient = useQueryClient();

  const form = useForm<PoliciesFormValues>({
    resolver: zodResolver(policiesSchema),
    defaultValues: {
      refundPolicy: '',
      privacyPolicy: '',
      termsOfService: '',
      shippingPolicy: '',
      contactInfo: '',
    },
  });

  // Fetch store settings
  const { data: store, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const response = await storeApi.get();
      const storeData = response.data.data;
      
      const savedPolicies = storeData.settings?.policies || {};
      form.reset({
        refundPolicy: savedPolicies.refundPolicy || '',
        privacyPolicy: savedPolicies.privacyPolicy || '',
        termsOfService: savedPolicies.termsOfService || '',
        shippingPolicy: savedPolicies.shippingPolicy || '',
        contactInfo: savedPolicies.contactInfo || '',
      });

      return storeData;
    },
  });

  // Mutation to update store settings
  const updatePoliciesMutation = useMutation({
    mutationFn: async (values: PoliciesFormValues) => {
      const newSettings = {
        ...(store?.settings || {}),
        policies: values,
      };
      const response = await storeApi.update({ settings: newSettings });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['store-settings'], data);
      form.reset(form.getValues());
      toast.success('Policies saved successfully.');
    },
    onError: () => {
      toast.error('Failed to save policies.');
    },
  });

  function onSubmit(values: PoliciesFormValues) {
    updatePoliciesMutation.mutate(values);
  }

  // --- Templates Generation ---
  const applyTemplate = (fieldName: keyof PoliciesFormValues) => {
    const storeName = store?.name || 'our store';
    const storeEmail = store?.settings?.email || 'support@yourstore.com';
    const storePhone = store?.settings?.phone || '[Store Phone Number]';
    const storeAddress = store?.settings?.address 
      ? `${store.settings.address}, ${store.settings.city || ''}, ${store.settings.state || ''} ${store.settings.zip || ''}`
      : '[Store Physical Address]';

    const templates: Record<keyof PoliciesFormValues, string> = {
      refundPolicy: `Refund Policy\n\nWe have a 30-day return policy, which means you have 30 days after receiving your item to request a return.\n\nTo be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.\n\nTo start a return, you can contact us at ${storeEmail}. If your return is accepted, we’ll send you a return shipping label, as well as instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.`,
      
      privacyPolicy: `Privacy Policy\n\nThis Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from ${storeName}.\n\nPERSONAL INFORMATION WE COLLECT\nWhen you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site.\n\nCONTACT US\nFor more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at ${storeEmail}.`,
      
      termsOfService: `Terms of Service\n\nThis website is operated by ${storeName}. Throughout the site, the terms “we”, “us” and “our” refer to ${storeName}. We offer this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.\n\nBy visiting our site and/ or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and policies referenced herein and/or available by hyperlink.`,
      
      shippingPolicy: `Shipping Policy\n\nThank you for visiting and shopping at ${storeName}. Following are the terms and conditions that constitute our Shipping Policy.\n\nShipment processing time\nAll orders are processed within 1-3 business days. Orders are not shipped or delivered on weekends or holidays.\n\nIf we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery. If there will be a significant delay in shipment of your order, we will contact you via email or telephone.`,
      
      contactInfo: `Contact Information\n\nQuestions about the Terms of Service should be sent to us at ${storeEmail}.\n\nOur contact details:\nStore Name: ${storeName}\nSupport Email: ${storeEmail}\nPhone: ${storePhone}\nAddress: ${storeAddress}`,
    };

    form.setValue(fieldName, templates[fieldName], { shouldDirty: true });
    toast.info('Template applied successfully.', {
      description: 'Review and customize the text before saving.',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 w-full flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full space-y-6 animate-fade-in pb-16">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-row items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Store Policies</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Configure your store's legal pages, refund policies, and terms of service.
              </p>
            </div>
            <Button type="submit" disabled={updatePoliciesMutation.isPending || !form.formState.isDirty}>
              <Save className="mr-2 h-4 w-4" /> Save Policies
            </Button>
          </div>

          <Separator />

          {/* Refund Policy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Refund Policy
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Define the refund rules, return window, and eligibility criteria for your customers.
              </p>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="refundPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel>Refund Document</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary h-7 px-2 hover:bg-primary/5"
                            onClick={() => applyTemplate('refundPolicy')}
                          >
                            <Sparkles className="mr-1 h-3.5 w-3.5" /> Create from template
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your return and refund policy details..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Privacy Policy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Privacy Policy
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Disclose how customer details are gathered, handled, and processed.
              </p>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="privacyPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel>Privacy Document</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary h-7 px-2 hover:bg-primary/5"
                            onClick={() => applyTemplate('privacyPolicy')}
                          >
                            <Sparkles className="mr-1 h-3.5 w-3.5" /> Create from template
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your privacy policy details..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Terms of Service */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Terms of Service
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Establish the usage rules, code of conduct, and legal agreements for store visitors.
              </p>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="termsOfService"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel>Terms Document</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary h-7 px-2 hover:bg-primary/5"
                            onClick={() => applyTemplate('termsOfService')}
                          >
                            <Sparkles className="mr-1 h-3.5 w-3.5" /> Create from template
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your terms of service..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Shipping Policy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Shipping Policy
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Detail package dispatch times, rates, tracking, and courier details.
              </p>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="shippingPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel>Shipping Document</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary h-7 px-2 hover:bg-primary/5"
                            onClick={() => applyTemplate('shippingPolicy')}
                          >
                            <Sparkles className="mr-1 h-3.5 w-3.5" /> Create from template
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Enter shipping timelines and terms..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Contact Information
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Provide legal business address details, phone numbers, and official emails.
              </p>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="contactInfo"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel>Contact Details Document</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary h-7 px-2 hover:bg-primary/5"
                            onClick={() => applyTemplate('contactInfo')}
                          >
                            <Sparkles className="mr-1 h-3.5 w-3.5" /> Create from template
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Enter business contact details..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
