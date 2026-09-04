'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Store, Save } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const storeSettingsSchema = z.object({
  name: z.string().min(2, { message: 'Store name must be at least 2 characters.' }),
  description: z.string().max(200, { message: 'Description cannot exceed 200 characters.' }).optional(),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().optional(),
  address: z.string().min(5, { message: 'Address is required.' }),
  city: z.string().min(2, { message: 'City is required.' }),
  state: z.string().min(2, { message: 'State is required.' }),
  zip: z.string().min(3, { message: 'ZIP code is required.' }),
  country: z.string().min(2, { message: 'Country is required.' }),
  currency: z.string(),
  timezone: z.string(),
});

type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>;

const defaultValues: Partial<StoreSettingsFormValues> = {
  name: 'Jodo Store',
  description: 'The best commerce store powered by Jodo OS.',
  email: 'hello@jodo.com',
  phone: '+1 555-0199',
  address: '123 Commerce St',
  city: 'San Francisco',
  state: 'CA',
  zip: '94105',
  currency: 'INR',
  timezone: 'America/Los_Angeles',
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '@/lib/api-client';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  
  const form = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      name: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      currency: '',
      timezone: '',
    },
  });

  const { isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const response = await storeApi.get();
      const store = response.data.data;
      
      const formValues: Partial<StoreSettingsFormValues> = {
        name: store.name || '',
        currency: store.defaultCurrency || '',
        country: store.defaultCountry || '',
        timezone: store.timezone || '',
        description: store.settings?.description || '',
        email: store.settings?.email || '',
        phone: store.settings?.phone || '',
        address: store.settings?.address || '',
        city: store.settings?.city || '',
        state: store.settings?.state || '',
        zip: store.settings?.zip || '',
      };
      
      form.reset(formValues);
      return store;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: StoreSettingsFormValues) => {
      const payload = {
        name: values.name,
        defaultCurrency: values.currency,
        defaultCountry: values.country,
        timezone: values.timezone,
        settings: {
          description: values.description,
          email: values.email,
          phone: values.phone,
          address: values.address,
          city: values.city,
          state: values.state,
          zip: values.zip,
        },
      };
      const response = await storeApi.update(payload);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['store-settings'], data);
      form.reset(form.getValues()); // resets isDirty state
      toast.success('Store settings updated!', {
        description: 'Your store configuration has been saved successfully.',
      });
    },
    onError: () => {
      toast.error('Failed to update store settings.', {
        description: 'Please try again later.',
      });
    },
  });

  function onSubmit(data: StoreSettingsFormValues) {
    mutation.mutate(data);
  }

  if (isLoading) {
    return (
      <div className="p-6 w-full flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Store Details</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your store's profile, contact information, and formatting.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
              <h3 className="text-lg font-medium">Profile</h3>
              <p className="text-sm text-muted-foreground">
                Your store's name and description. This is visible to your customers.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. My Awesome Store" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description about your store..." 
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum 200 characters. Used for SEO and storefront meta.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <p className="text-sm text-muted-foreground">
                How Jodo and your customers can contact you.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Email</FormLabel>
                          <FormControl>
                            <Input placeholder="store@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
              <h3 className="text-lg font-medium">Store Address</h3>
              <p className="text-sm text-muted-foreground">
                The physical location of your store. Used for shipping and tax calculations.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="San Francisco" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State / Province</FormLabel>
                          <FormControl>
                            <Input placeholder="CA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal / ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="94105" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="GB">United Kingdom</SelectItem>
                              <SelectItem value="IN">India</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
              <h3 className="text-lg font-medium">Standards and Formats</h3>
              <p className="text-sm text-muted-foreground">
                Standards used to calculate product prices, shipping weights, and order times.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select timezone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="America/Los_Angeles">(GMT-08:00) Pacific Time (US & Canada)</SelectItem>
                              <SelectItem value="America/New_York">(GMT-05:00) Eastern Time (US & Canada)</SelectItem>
                              <SelectItem value="Europe/London">(GMT+00:00) London</SelectItem>
                              <SelectItem value="Asia/Kolkata">(GMT+05:30) India Standard Time</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INR">INR (₹)</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="CAD">CAD</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="sticky bottom-4 z-10 flex justify-end gap-4 mt-8 p-4 rounded-xl border bg-background/95 backdrop-blur-sm shadow-sm">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Discard changes
            </Button>
            <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
