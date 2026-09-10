'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Package, Globe, Plus, Pencil, Trash2 } from 'lucide-react';
import { ShippingZoneSheet } from './shipping-zone-sheet';
import { ShippingRateSheet } from './shipping-rate-sheet';

export default function SettingsShippingPage() {
  const queryClient = useQueryClient();
  const [zoneSheetOpen, setZoneSheetOpen] = useState(false);
  const [rateSheetOpen, setRateSheetOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [editingRate, setEditingRate] = useState<any>(null);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

  const { data: storeData, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const response = await storeApi.get();
      return response.data.data;
    },
  });

  const settings = storeData?.settings || {};
  const shipping = settings.shipping || { zones: [] };
  const zones = shipping.zones || [];

  const updateMutation = useMutation({
    mutationFn: async (newZones: any[]) => {
      const newSettings = {
        ...settings,
        shipping: {
          ...shipping,
          zones: newZones,
        },
      };
      return storeApi.update({ settings: newSettings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success('Shipping settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save shipping settings');
    },
  });

  // Handlers for Zones
  const handleSaveZone = (zoneData: any) => {
    let newZones = [...zones];
    const existingIndex = newZones.findIndex((z) => z.id === zoneData.id);
    if (existingIndex >= 0) {
      newZones[existingIndex] = zoneData;
    } else {
      newZones.push(zoneData);
    }
    updateMutation.mutate(newZones);
  };

  const handleDeleteZone = (zoneId: string) => {
    if (!window.confirm('Are you sure you want to delete this zone?')) return;
    const newZones = zones.filter((z: any) => z.id !== zoneId);
    updateMutation.mutate(newZones);
  };

  const openZoneSheet = (zone: any = null) => {
    setEditingZone(zone);
    setZoneSheetOpen(true);
  };

  // Handlers for Rates
  const handleSaveRate = (zoneId: string, rateData: any) => {
    const newZones = [...zones];
    const zoneIndex = newZones.findIndex((z) => z.id === zoneId);
    if (zoneIndex < 0) return;

    let rates = [...(newZones[zoneIndex].rates || [])];
    const existingRateIndex = rates.findIndex((r) => r.id === rateData.id);
    if (existingRateIndex >= 0) {
      rates[existingRateIndex] = rateData;
    } else {
      rates.push(rateData);
    }
    newZones[zoneIndex].rates = rates;
    updateMutation.mutate(newZones);
  };

  const handleDeleteRate = (zoneId: string, rateId: string) => {
    if (!window.confirm('Are you sure you want to delete this rate?')) return;
    const newZones = [...zones];
    const zoneIndex = newZones.findIndex((z) => z.id === zoneId);
    if (zoneIndex < 0) return;

    newZones[zoneIndex].rates = newZones[zoneIndex].rates.filter((r: any) => r.id !== rateId);
    updateMutation.mutate(newZones);
  };

  const openRateSheet = (zoneId: string, rate: any = null) => {
    setActiveZoneId(zoneId);
    setEditingRate(rate);
    setRateSheetOpen(true);
  };

  if (isLoading) {
    return <div className="p-6">Loading shipping settings...</div>;
  }

  return (
    <div className="p-6 w-full space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shipping and delivery</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Choose where you ship and how much you charge for shipping at checkout.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">General Shipping Rates</CardTitle>
                <CardDescription className="mt-1">
                  Rates for all your products. You can create zones and assign rates to them.
                </CardDescription>
              </div>
              <Button onClick={() => openZoneSheet()}>
                <Globe className="w-4 h-4 mr-2" />
                Create Zone
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {zones.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No shipping zones configured yet.</p>
                <Button variant="link" onClick={() => openZoneSheet()} className="mt-2">
                  Create your first zone
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {zones.map((zone: any) => (
                  <div key={zone.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          {zone.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {zone.countries?.length || 0} countries or regions
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openZoneSheet(zone)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteZone(zone.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground text-left">
                            <th className="font-medium p-3 px-4">Rate name</th>
                            <th className="font-medium p-3">Condition</th>
                            <th className="font-medium p-3 text-right">Price</th>
                            <th className="p-3 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(!zone.rates || zone.rates.length === 0) ? (
                            <tr>
                              <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                No rates configured for this zone.
                              </td>
                            </tr>
                          ) : (
                            zone.rates.map((rate: any) => (
                              <tr key={rate.id} className="group hover:bg-muted/50">
                                <td className="p-3 px-4 font-medium">{rate.name}</td>
                                <td className="p-3 text-muted-foreground">{rate.condition || '—'}</td>
                                <td className="p-3 text-right">
                                  {rate.price === 0 ? 'Free' : `$${Number(rate.price).toFixed(2)}`}
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openRateSheet(zone.id, rate)}>
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteRate(zone.id, rate.id)}>
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                      <div className="p-3 px-4 border-t bg-muted/10 rounded-b-lg">
                        <Button variant="ghost" size="sm" onClick={() => openRateSheet(zone.id)}>
                          <Plus className="w-3.5 h-3.5 mr-2" />
                          Add rate
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ShippingZoneSheet
        open={zoneSheetOpen}
        onOpenChange={setZoneSheetOpen}
        zone={editingZone}
        onSave={handleSaveZone}
      />

      <ShippingRateSheet
        open={rateSheetOpen}
        onOpenChange={setRateSheetOpen}
        rate={editingRate}
        zoneId={activeZoneId}
        onSave={handleSaveRate}
      />
    </div>
  );
}
