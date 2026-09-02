'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { CreditCard, Banknote, Landmark, Settings2 } from 'lucide-react';
import { PaymentSheet } from './payment-sheet';

type Provider = 'stripe' | 'paypal' | 'razorpay';

export default function SettingsPaymentsPage() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);

  const { data: storeData, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const response = await storeApi.get();
      return response.data.data;
    },
  });

  const settings = storeData?.settings || {};
  const payments = settings.payments || {};

  const manualMutation = useMutation({
    mutationFn: async (manualSettings: any) => {
      const newSettings = {
        ...settings,
        payments: {
          ...payments,
          manual: {
            ...(payments.manual || {}),
            ...manualSettings,
          },
        },
      };
      return storeApi.update({ settings: newSettings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success('Manual payment settings updated');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  const handleManualToggle = (type: string, checked: boolean) => {
    manualMutation.mutate({ [type]: checked });
  };

  const openSheet = (provider: Provider) => {
    setActiveProvider(provider);
    setSheetOpen(true);
  };

  if (isLoading) {
    return <div className="p-6">Loading payments...</div>;
  }

  return (
    <div className="p-6 w-full space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Enable and manage your store's payment providers to accept customer payments.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Supported Providers</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Stripe Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CreditCard className="h-6 w-6 text-indigo-500" />
                  <Badge variant={payments.stripe?.isActive ? 'success' : 'secondary'}>
                    {payments.stripe?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-2">Stripe</CardTitle>
                <CardDescription>
                  Accept credit cards, Apple Pay, and Google Pay.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => openSheet('stripe')}>
                  <Settings2 className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </CardFooter>
            </Card>

            {/* PayPal Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CreditCard className="h-6 w-6 text-blue-500" />
                  <Badge variant={payments.paypal?.isActive ? 'success' : 'secondary'}>
                    {payments.paypal?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-2">PayPal</CardTitle>
                <CardDescription>
                  A fast, safe way to process international payments.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => openSheet('paypal')}>
                  <Settings2 className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </CardFooter>
            </Card>

            {/* Razorpay Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CreditCard className="h-6 w-6 text-sky-600" />
                  <Badge variant={payments.razorpay?.isActive ? 'success' : 'secondary'}>
                    {payments.razorpay?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-2">Razorpay</CardTitle>
                <CardDescription>
                  Accept UPI, credit/debit cards, and net banking in India.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => openSheet('razorpay')}>
                  <Settings2 className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="pt-6 border-t">
          <h2 className="text-lg font-semibold mb-4">Manual Payments</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="flex items-center justify-between p-4 sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Banknote className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Cash on Delivery (COD)</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Allow customers to pay in cash when their order is delivered.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={payments.manual?.cod || false}
                    onCheckedChange={(checked: boolean) => handleManualToggle('cod', checked)}
                    disabled={manualMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between p-4 sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Landmark className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Bank Transfer</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Customers will receive your bank details with their order confirmation.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={payments.manual?.bankTransfer || false}
                    onCheckedChange={(checked: boolean) => handleManualToggle('bankTransfer', checked)}
                    disabled={manualMutation.isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        provider={activeProvider}
        settings={settings}
      />
    </div>
  );
}
