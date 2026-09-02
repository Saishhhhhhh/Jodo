'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Globe, Percent, Plus, Edit2, Trash2, Save, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { storeApi } from '@/lib/api-client';
import { TaxRegionSheet } from './tax-region-sheet';

const taxCalculationSchema = z.object({
  includeTaxInPrices: z.boolean(),
  chargeTaxOnShipping: z.boolean(),
});

type TaxCalculationFormValues = z.infer<typeof taxCalculationSchema>;

export default function SettingsTaxesPage() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<any | null>(null);

  const form = useForm<TaxCalculationFormValues>({
    resolver: zodResolver(taxCalculationSchema),
    defaultValues: {
      includeTaxInPrices: false,
      chargeTaxOnShipping: false,
    },
  });

  // Fetch store settings
  const { data: store, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const response = await storeApi.get();
      const storeData = response.data.data;
      
      form.reset({
        includeTaxInPrices: storeData.settings?.taxes?.includeTaxInPrices ?? false,
        chargeTaxOnShipping: storeData.settings?.taxes?.chargeTaxOnShipping ?? false,
      });

      return storeData;
    },
  });

  const taxSettings = store?.settings?.taxes || {};
  const taxRegions: any[] = taxSettings.taxRegions || [];

  // Mutation to update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedTaxes: any) => {
      const newSettings = {
        ...(store?.settings || {}),
        taxes: {
          ...(store?.settings?.taxes || {}),
          ...updatedTaxes,
        },
      };
      const response = await storeApi.update({ settings: newSettings });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['store-settings'], data);
      toast.success('Tax settings updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update tax settings.');
    },
  });

  // Save base settings (toggles)
  const onSubmitCalculations = (values: TaxCalculationFormValues) => {
    updateSettingsMutation.mutate({
      includeTaxInPrices: values.includeTaxInPrices,
      chargeTaxOnShipping: values.chargeTaxOnShipping,
    });
  };

  // Add/Edit tax region
  const handleSaveRegion = (regionData: any) => {
    let updatedRegions = [...taxRegions];
    
    if (selectedRegion) {
      // Edit existing
      updatedRegions = updatedRegions.map((r) =>
        r.countryCode === regionData.countryCode ? regionData : r
      );
    } else {
      // Add new
      updatedRegions.push(regionData);
    }

    updateSettingsMutation.mutate({
      taxRegions: updatedRegions,
    });
  };

  // Delete tax region
  const handleDeleteRegion = (countryCode: string) => {
    const updatedRegions = taxRegions.filter((r) => r.countryCode !== countryCode);
    updateSettingsMutation.mutate({
      taxRegions: updatedRegions,
    });
  };

  const openAddSheet = () => {
    setSelectedRegion(null);
    setSheetOpen(true);
  };

  const openEditSheet = (region: any) => {
    setSelectedRegion(region);
    setSheetOpen(true);
  };

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
        <h1 className="text-2xl font-bold tracking-tight">Taxes and Duties</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage how your store calculates and collects taxes on products and shipping.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: descriptions */}
        <div className="md:col-span-1 space-y-4">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" /> Tax Calculations
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Determine how tax is displayed and charged to customers at checkout.
            </p>
          </div>
        </div>

        {/* Right column: Form */}
        <div className="md:col-span-2 space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitCalculations)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Calculation Settings</CardTitle>
                  <CardDescription>Configure global store tax calculation behaviors.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="includeTaxInPrices"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">All prices include tax</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            When enabled, catalog and checkout prices already represent the tax inclusive price.
                          </p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chargeTaxOnShipping"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">Charge tax on shipping rates</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Calculate and add tax to selected shipping methods at checkout.
                          </p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="border-t px-6 py-4 flex justify-end">
                  <Button type="submit" disabled={updateSettingsMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: descriptions */}
        <div className="md:col-span-1 space-y-4">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Tax Regions
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Configure rates for countries and regions where you operate and need to collect sales taxes.
            </p>
          </div>
        </div>

        {/* Right column: Regions List */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-semibold">Configured Regions</CardTitle>
                <CardDescription>Specify base rates and regional overrides.</CardDescription>
              </div>
              <Button onClick={openAddSheet} size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Country
              </Button>
            </CardHeader>
            <CardContent>
              {taxRegions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country/Region</TableHead>
                      <TableHead>Country Code</TableHead>
                      <TableHead>Base Rate</TableHead>
                      <TableHead>Overrides</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxRegions.map((region) => (
                      <TableRow key={region.countryCode}>
                        <TableCell className="font-medium">{region.countryName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{region.countryCode}</Badge>
                        </TableCell>
                        <TableCell>{region.rate}%</TableCell>
                        <TableCell>
                          {region.subRegions?.length > 0 ? (
                            <Badge variant="outline" className="border-primary/30 text-primary">
                              {region.subRegions.length} override{region.subRegions.length > 1 ? 's' : ''}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditSheet(region)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteRegion(region.countryCode)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg text-center bg-muted/20">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/60 mb-3" />
                  <h4 className="text-sm font-semibold">No tax regions configured</h4>
                  <p className="text-xs text-muted-foreground max-w-[280px] mt-1">
                    Add regions where you want to collect taxes at checkout.
                  </p>
                  <Button onClick={openAddSheet} variant="outline" size="sm" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Configure First Region
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <TaxRegionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        region={selectedRegion}
        existingRegions={taxRegions}
        onSave={handleSaveRegion}
      />
    </div>
  );
}
