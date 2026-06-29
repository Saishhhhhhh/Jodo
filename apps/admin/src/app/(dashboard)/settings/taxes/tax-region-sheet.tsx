'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trash2, Plus, AlertCircle } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'IN', name: 'India' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
];

const subRegionSchema = z.object({
  name: z.string().min(1, 'State/Province name is required'),
  rate: z.coerce.number().min(0, 'Rate must be 0 or more').max(100, 'Rate cannot exceed 100'),
});

const taxRegionSchema = z.object({
  countryCode: z.string().min(2, 'Please select a country'),
  rate: z.coerce.number().min(0, 'Base rate must be 0 or more').max(100, 'Rate cannot exceed 100'),
  subRegions: z.array(subRegionSchema).default([]),
});

type TaxRegionFormValues = z.infer<typeof taxRegionSchema>;

interface TaxRegionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region: any | null; // null if adding
  existingRegions: any[];
  onSave: (values: any) => void;
}

export function TaxRegionSheet({
  open,
  onOpenChange,
  region,
  existingRegions,
  onSave,
}: TaxRegionSheetProps) {
  const isEditing = !!region;

  const form = useForm<TaxRegionFormValues>({
    resolver: zodResolver(taxRegionSchema),
    defaultValues: {
      countryCode: '',
      rate: 0,
      subRegions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subRegions',
  });

  const [newSubRegionName, setNewSubRegionName] = useState('');
  const [newSubRegionRate, setNewSubRegionRate] = useState('');

  useEffect(() => {
    if (open) {
      if (region) {
        form.reset({
          countryCode: region.countryCode || '',
          rate: region.rate ?? 0,
          subRegions: region.subRegions || [],
        });
      } else {
        form.reset({
          countryCode: '',
          rate: 0,
          subRegions: [],
        });
      }
      setNewSubRegionName('');
      setNewSubRegionRate('');
    }
  }, [open, region, form]);

  const selectedCountryCode = form.watch('countryCode');

  // Filter countries already configured if adding
  const availableCountries = COUNTRIES.filter(
    (c) => isEditing || !existingRegions.some((r) => r.countryCode === c.code)
  );

  function onSubmit(values: TaxRegionFormValues) {
    const country = COUNTRIES.find((c) => c.code === values.countryCode);
    const payload = {
      ...values,
      countryName: country ? country.name : values.countryCode,
    };
    onSave(payload);
    onOpenChange(false);
  }

  const handleAddSubRegion = () => {
    if (!newSubRegionName.trim()) return;
    const rateVal = parseFloat(newSubRegionRate) || 0;
    append({
      name: newSubRegionName.trim(),
      rate: rateVal,
    });
    setNewSubRegionName('');
    setNewSubRegionRate('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Tax Region' : 'Add Tax Region'}</SheetTitle>
          <SheetDescription>
            Configure the tax rate and region-specific overrides for this country.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country/Region</FormLabel>
                  {isEditing ? (
                    <div className="p-3 border rounded-md bg-muted text-muted-foreground font-medium">
                      {COUNTRIES.find((c) => c.code === field.value)?.name || field.value}
                    </div>
                  ) : (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCountries.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Tax Rate (%)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type="number" step="0.01" min="0" max="100" placeholder="0.00" {...field} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    The default tax rate applied to products shipped to this country.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">State / Province Overrides</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add local tax overrides for specific states or provinces.
                </p>
              </div>

              {fields.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 p-2 border rounded-md bg-card">
                      <div className="flex-1 text-sm font-medium pl-1">{field.name}</div>
                      <div className="w-24 relative">
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8 pr-6"
                          {...form.register(`subRegions.${index}.rate` as const)}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg text-center bg-muted/20">
                  <AlertCircle className="h-6 w-6 text-muted-foreground/60 mb-2" />
                  <p className="text-xs text-muted-foreground">No overrides defined yet.</p>
                </div>
              )}

              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium">State/Province Name</label>
                  <Input
                    placeholder="e.g. California"
                    value={newSubRegionName}
                    onChange={(e) => setNewSubRegionName(e.target.value)}
                  />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-xs font-medium">Rate (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newSubRegionRate}
                    onChange={(e) => setNewSubRegionRate(e.target.value)}
                  />
                </div>
                <Button type="button" variant="outline" size="icon" onClick={handleAddSubRegion} className="shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <SheetFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Save changes' : 'Add region'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
