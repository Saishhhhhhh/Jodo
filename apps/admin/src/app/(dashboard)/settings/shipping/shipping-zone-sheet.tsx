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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const COUNTRIES = [
  { id: 'US', label: 'United States' },
  { id: 'CA', label: 'Canada' },
  { id: 'GB', label: 'United Kingdom' },
  { id: 'AU', label: 'Australia' },
  { id: 'IN', label: 'India' },
  { id: 'FR', label: 'France' },
  { id: 'DE', label: 'Germany' },
  { id: 'JP', label: 'Japan' },
  { id: 'REST_OF_WORLD', label: 'Rest of World' },
];

const zoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required'),
  countries: z.array(z.string()).min(1, 'Select at least one country or region'),
});

type ZoneFormValues = z.infer<typeof zoneSchema>;

interface ShippingZoneSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone: any | null;
  onSave: (zoneData: any) => void;
}

export function ShippingZoneSheet({ open, onOpenChange, zone, onSave }: ShippingZoneSheetProps) {
  const isEditing = !!zone;

  const form = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: '',
      countries: [],
    },
  });

  useEffect(() => {
    if (zone && open) {
      form.reset({
        name: zone.name,
        countries: zone.countries || [],
      });
    } else if (open && !zone) {
      form.reset({
        name: '',
        countries: [],
      });
    }
  }, [zone, open, form]);

  function onSubmit(data: ZoneFormValues) {
    const payload = {
      id: zone ? zone.id : generateId(),
      name: data.name,
      countries: data.countries,
      rates: zone ? zone.rates : [],
    };
    onSave(payload);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Zone' : 'Create Zone'}</SheetTitle>
          <SheetDescription>
            A zone is a group of countries or regions that share the same shipping rates.
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
                    <FormLabel>Zone Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Domestic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="countries"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Countries</FormLabel>
                    </div>
                    <ScrollArea className="h-48 rounded-md border p-4">
                      <div className="space-y-4">
                        {COUNTRIES.map((country) => (
                          <FormField
                            key={country.id}
                            control={form.control}
                            name="countries"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={country.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(country.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, country.id])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== country.id)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {country.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Save Zone' : 'Create Zone'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
