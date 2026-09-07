'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWarehouseStore } from '@/stores/warehouse';
import { toast } from 'sonner';

interface AddManufacturerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddManufacturerDrawer({ open, onOpenChange }: AddManufacturerDrawerProps) {
  const { addManufacturer } = useWarehouseStore();

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [productsStr, setProductsStr] = useState('');
  const [capacity, setCapacity] = useState('');
  const [leadTime, setLeadTime] = useState('14 days');
  const [qualityRating, setQualityRating] = useState('4.8');
  const [status, setStatus] = useState<'Active' | 'At Capacity' | 'Temporarily Unavailable' | 'Inactive'>('Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactPerson || !location) {
      toast.error('Please fill in all required fields');
      return;
    }

    addManufacturer({
      name,
      contactPerson,
      phone: phone || '+91 98000 00000',
      email: email || 'vendor@example.com',
      location,
      productCategories: productsStr
        ? productsStr.split(',').map((p) => p.trim())
        : ['Apparel', 'Fabrics'],
      productionCapacity: capacity || '50,000 units/mo',
      currentUtilization: 45,
      averageLeadTime: leadTime || '14 days',
      qualityRating: parseFloat(qualityRating) || 4.8,
      onTimeDeliveryRate: 96.0,
      status,
    });

    toast.success('Contract manufacturer onboarded successfully');
    onOpenChange(false);

    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setLocation('');
    setProductsStr('');
    setCapacity('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Manufacturer</SheetTitle>
          <SheetDescription>
            Register a production partner, their capacity, contact details and lead times.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="mfg-name">Manufacturer Company Name *</Label>
            <Input
              id="mfg-name"
              placeholder="e.g. Acme Garment Works"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mfg-contact">Contact Person *</Label>
              <Input
                id="mfg-contact"
                placeholder="Ramesh Gupta"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mfg-phone">Phone Number</Label>
              <Input
                id="mfg-phone"
                placeholder="+91 98200 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mfg-email">Email Address</Label>
              <Input
                id="mfg-email"
                type="email"
                placeholder="orders@acmegarments.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mfg-loc">Location (City, State) *</Label>
              <Input
                id="mfg-loc"
                placeholder="Tirupur, Tamil Nadu"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mfg-products">Products / Capabilities (comma-separated)</Label>
            <Input
              id="mfg-products"
              placeholder="T-Shirts, Polos, Hoodies, Activewear"
              value={productsStr}
              onChange={(e) => setProductsStr(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mfg-cap">Monthly Capacity</Label>
              <Input
                id="mfg-cap"
                placeholder="e.g. 50,000 units/mo"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mfg-lead">Standard Lead Time</Label>
              <Input
                id="mfg-lead"
                placeholder="e.g. 14 days"
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mfg-rating">Quality Rating (1–5)</Label>
              <Input
                id="mfg-rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={qualityRating}
                onChange={(e) => setQualityRating(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mfg-status">Onboarding Status</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger id="mfg-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="At Capacity">At Capacity</SelectItem>
                  <SelectItem value="Temporarily Unavailable">Temporarily Unavailable</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Manufacturer</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
