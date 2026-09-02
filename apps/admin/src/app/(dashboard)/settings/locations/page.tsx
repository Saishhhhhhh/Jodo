'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MapPin, Plus, Edit2, Trash2, Home, Package, Activity, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { storeApi } from '@/lib/api-client';
import { LocationSheet } from './location-sheet';

export default function SettingsLocationsPage() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);

  // Fetch store settings
  const { data: store, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const response = await storeApi.get();
      return response.data.data;
    },
  });

  const locations: any[] = store?.settings?.locations || [];

  // Fallback default location if empty to match Shopify
  const getDisplayLocations = () => {
    if (locations.length > 0) return locations;
    if (!store) return [];
    
    // Create a default primary location using store details
    return [
      {
        id: 'loc-default',
        name: store.name || 'Primary Location',
        address: store.settings?.address || '123 Commerce St',
        city: store.settings?.city || 'San Francisco',
        state: store.settings?.state || 'CA',
        zip: store.settings?.zip || '94105',
        country: store.defaultCountry || 'US',
        phone: store.settings?.phone || '',
        isActive: true,
        fulfillOnline: true,
        isPrimary: true,
      },
    ];
  };

  const displayLocations = getDisplayLocations();

  // Mutation to update store settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedLocations: any[]) => {
      const newSettings = {
        ...(store?.settings || {}),
        locations: updatedLocations,
      };
      const response = await storeApi.update({ settings: newSettings });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['store-settings'], data);
      toast.success('Location settings updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update location settings.');
    },
  });

  // Save location (Add/Edit)
  const handleSaveLocation = (locationData: any) => {
    let updatedLocations = [...locations];
    
    // If locations list is empty, default the first one as primary
    if (updatedLocations.length === 0) {
      // In case we are initializing, copy default if adding a second one
      updatedLocations = getDisplayLocations();
    }

    if (locationData.isPrimary) {
      // Unset primary from all other locations
      updatedLocations = updatedLocations.map((l) => ({ ...l, isPrimary: false }));
    }

    if (selectedLocation) {
      // Editing existing
      const existingId = selectedLocation.id;
      updatedLocations = updatedLocations.map((l) =>
        l.id === existingId ? { ...locationData, id: existingId } : l
      );
    } else {
      // Adding new
      const newLocation = {
        ...locationData,
        id: `loc-${Date.now()}`,
      };
      updatedLocations.push(newLocation);
    }

    // Ensure at least one primary location exists
    const hasPrimary = updatedLocations.some((l) => l.isPrimary);
    if (!hasPrimary && updatedLocations.length > 0) {
      updatedLocations[0].isPrimary = true;
    }

    updateSettingsMutation.mutate(updatedLocations);
  };

  // Delete location
  const handleDeleteLocation = (id: string) => {
    const locToDelete = displayLocations.find((l) => l.id === id);
    if (locToDelete?.isPrimary) {
      toast.error('Cannot delete the primary location.', {
        description: 'Set another location as primary first before deleting this one.',
      });
      return;
    }

    const updatedLocations = displayLocations.filter((l) => l.id !== id);
    
    // Ensure primary location exists
    if (updatedLocations.length > 0 && !updatedLocations.some((l) => l.isPrimary)) {
      updatedLocations[0].isPrimary = true;
    }

    updateSettingsMutation.mutate(updatedLocations);
  };

  const openAddSheet = () => {
    setSelectedLocation(null);
    setSheetOpen(true);
  };

  const openEditSheet = (loc: any) => {
    setSelectedLocation(loc);
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
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage the places where you track inventory, ship orders, and sell products.
          </p>
        </div>
        <Button onClick={openAddSheet}>
          <Plus className="mr-2 h-4 w-4" /> Add Location
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" /> Primary Location
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                Your primary location determines the default shipping origin profile, tax rates, and inventory allocation if not otherwise specified.
              </p>
              <div className="pt-2">
                <Badge variant="outline" className="border-primary/20 text-primary">
                  {displayLocations.find((l) => l.isPrimary)?.name || 'None'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Location List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location Details</TableHead>
                    <TableHead>Fulfillment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayLocations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="max-w-[240px]">
                        <div>
                          <div className="flex items-center gap-1.5 font-medium text-sm">
                            {loc.name}
                            {loc.isPrimary && (
                              <Badge className="h-5 text-[10px] bg-primary hover:bg-primary/95 text-primary-foreground">
                                Primary
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {loc.address}, {loc.city}, {loc.state} {loc.zip}, {loc.country}
                            </span>
                          </div>
                          {loc.phone && (
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              Phone: {loc.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {loc.fulfillOnline ? (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit text-[10px] bg-purple-500/10 text-purple-600 border-none">
                            <Package className="h-3 w-3" /> Fulfills Online
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Off</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {loc.isActive ? (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit text-[10px] bg-green-500/10 text-green-600 border-none">
                            <Activity className="h-3 w-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditSheet(loc)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={loc.isPrimary}
                          onClick={() => handleDeleteLocation(loc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <LocationSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        location={selectedLocation}
        onSave={handleSaveLocation}
      />
    </div>
  );
}
