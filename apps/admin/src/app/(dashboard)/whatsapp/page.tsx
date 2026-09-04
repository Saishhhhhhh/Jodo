'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { MessageSquare, Save, CheckCircle2, Shield, Smartphone, Zap, Store } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { storeApi } from '@/lib/api-client';

const whatsappSchema = z.object({
  enabled: z.boolean().default(false),
  apiKey: z.string().optional(),
  orderPlacedTemplate: z.string().optional(),
  orderShippedTemplate: z.string().optional(),
});

type WhatsAppFormValues = z.infer<typeof whatsappSchema>;

export default function WhatsAppDashboard() {
  const queryClient = useQueryClient();
  const [activePreview, setActivePreview] = useState<'placed' | 'shipped'>('placed');
  
  const form = useForm<WhatsAppFormValues>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      enabled: false,
      apiKey: '',
      orderPlacedTemplate: '',
      orderShippedTemplate: '',
    },
  });

  const { isLoading, data: store } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const response = await storeApi.get();
      const data = response.data.data;
      
      form.reset({
        enabled: data.settings?.notifications?.interakt?.enabled || false,
        apiKey: data.settings?.notifications?.interakt?.apiKey || '',
        orderPlacedTemplate: data.settings?.notifications?.interakt?.orderPlacedTemplate || '',
        orderShippedTemplate: data.settings?.notifications?.interakt?.orderShippedTemplate || '',
      });
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: WhatsAppFormValues) => {
      if (!store) throw new Error("Store not loaded");
      
      const payload = {
        settings: {
          ...store.settings,
          notifications: {
            ...store.settings?.notifications,
            interakt: {
              enabled: values.enabled,
              apiKey: values.apiKey,
              orderPlacedTemplate: values.orderPlacedTemplate,
              orderShippedTemplate: values.orderShippedTemplate,
            }
          }
        },
      };
      const response = await storeApi.update(payload);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['store-settings'], data);
      form.reset(form.getValues()); 
      toast.success('WhatsApp configuration saved!', {
        description: 'Your template triggers have been updated.',
      });
    },
    onError: () => {
      toast.error('Failed to save settings.');
    },
  });

  function onSubmit(data: WhatsAppFormValues) {
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
    <div className="p-6 w-full space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-xl">
              <MessageSquare className="w-7 h-7 text-green-600" />
            </div>
            WhatsApp Automation
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Connect Interakt to automate order confirmations and shipping updates directly to your customers' phones.
          </p>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={!form.formState.isDirty || mutation.isPending}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="w-5 h-5 mr-2" />
          {mutation.isPending ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      <Form {...form}>
        <form className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Settings */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Connection Card */}
              <Card className="border-green-100 shadow-sm overflow-hidden">
                <div className="h-2 w-full bg-green-500"></div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Interakt Connection
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Enable the integration and securely link your Interakt API key.
                      </CardDescription>
                    </div>
                    <FormField
                      control={form.control}
                      name="enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-green-600"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium mb-0">
                            {field.value ? 'Active' : 'Disabled'}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-muted-foreground leading-relaxed">
                      Your API key is securely encrypted. We only use this key to dispatch transactional templates (like Order Placed) on your behalf.
                    </p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base64 API Key</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="e.g. d2p4MW..." className="font-mono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Templates Card */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Message Templates</CardTitle>
                  <CardDescription>
                    Map your Interakt template names to Jodo's automated triggers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="p-5 border rounded-xl hover:border-primary/50 transition-colors cursor-pointer bg-card" onClick={() => setActivePreview('placed')}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${activePreview === 'placed' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-base">Order Placed Trigger</h4>
                          <p className="text-sm text-muted-foreground">Fires immediately after successful checkout.</p>
                        </div>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="orderPlacedTemplate"
                      render={({ field }) => (
                        <FormItem onClick={e => e.stopPropagation()}>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. order_confirmation_v2" className="bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="p-5 border rounded-xl hover:border-primary/50 transition-colors cursor-pointer bg-card" onClick={() => setActivePreview('shipped')}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${activePreview === 'shipped' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-base">Order Shipped Trigger</h4>
                          <p className="text-sm text-muted-foreground">Fires when you fulfill an order and generate an AWB.</p>
                        </div>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="orderShippedTemplate"
                      render={({ field }) => (
                        <FormItem onClick={e => e.stopPropagation()}>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. order_shipped" className="bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                </CardContent>
              </Card>

            </div>

            {/* Right Column: Visual Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-medium">Live Preview</h3>
                </div>
                
                {/* iPhone Mockup */}
                <div className="relative mx-auto w-[300px] h-[600px] bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden border-[8px] border-slate-900 ring-1 ring-slate-800">
                  {/* Notch */}
                  <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-xl w-32 mx-auto z-20"></div>
                  
                  {/* WhatsApp Header */}
                  <div className="bg-[#075e54] text-white p-4 pt-8 flex items-center gap-3 relative z-10 shadow-md">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{store?.name || 'Your Store'}</p>
                      <p className="text-xs text-white/80">Official Business Account</p>
                    </div>
                  </div>

                  {/* Chat Background */}
                  <div className="absolute inset-0 bg-[#e5ddd5] z-0" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', opacity: 0.4 }}></div>

                  {/* Chat Messages */}
                  <div className="relative z-10 p-4 h-[calc(100%-80px)] overflow-y-auto flex flex-col gap-3">
                    
                    {/* Timestamp */}
                    <div className="flex justify-center">
                      <span className="bg-[#d4eaf4] text-[#1f2937] text-[10px] px-2 py-1 rounded-md uppercase font-medium shadow-sm">
                        Today
                      </span>
                    </div>

                    {/* Dynamic Message Bubble */}
                    <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[85%] animate-in slide-in-from-left-4 fade-in duration-300">
                      {activePreview === 'placed' ? (
                        <>
                          <div className="font-bold text-sm mb-1 text-slate-800">Order Confirmed! 🎉</div>
                          <p className="text-sm text-slate-700 leading-snug">
                            Hi John,<br/><br/>
                            Thank you for shopping with {store?.name || 'us'}!<br/><br/>
                            Your order <strong>#ORD-123456</strong> for <strong>₹1,499</strong> has been successfully placed.<br/><br/>
                            We will notify you once it ships.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="font-bold text-sm mb-1 text-slate-800">Your order is on the way! 🚚</div>
                          <p className="text-sm text-slate-700 leading-snug">
                            Hi John,<br/><br/>
                            Good news! Your order <strong>#ORD-123456</strong> has been shipped via <strong>ShipRocket</strong>.<br/><br/>
                            Track your package here:<br/>
                            <a href="#" className="text-blue-500 hover:underline">https://shiprocket.co/track/AWB999</a>
                          </p>
                        </>
                      )}
                      
                      <div className="flex justify-end mt-1">
                        <span className="text-[10px] text-slate-400">Just now</span>
                      </div>
                    </div>

                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  * Note: Actual text depends on your Interakt templates.
                </p>
              </div>
            </div>

          </div>
        </form>
      </Form>
    </div>
  );
}

// Need to import Truck icon which was missing above
import { Truck } from 'lucide-react';
