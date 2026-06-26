import React from 'react';
import { Settings, Store, Users, CreditCard, Truck, Receipt, MapPin, Activity } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Settings' };

const SETTINGS_SECTIONS = [
  {
    label: 'Store Details',
    description: 'Store name, description, contact info, and branding',
    icon: Store,
    href: '/settings/store',
    status: 'configure',
  },
  {
    label: 'Staff & Permissions',
    description: 'Manage team members and access control',
    icon: Users,
    href: '/settings/staff',
    status: 'active',
  },
  {
    label: 'Payments',
    description: 'Configure Razorpay, Stripe, COD, and other payment methods',
    icon: CreditCard,
    href: '/settings/payments',
    status: 'configure',
  },
  {
    label: 'Shipping',
    description: 'Set up shipping zones, rates, and fulfillment rules',
    icon: Truck,
    href: '/settings/shipping',
    status: 'configure',
  },
  {
    label: 'Taxes',
    description: 'Configure GST, tax classes, and tax rules',
    icon: Receipt,
    href: '/settings/taxes',
    status: 'configure',
  },
  {
    label: 'Locations',
    description: 'Manage store locations and warehouses',
    icon: MapPin,
    href: '/settings/locations',
    status: 'configure',
  },
  {
    label: 'Audit Logs',
    description: 'View all admin actions and security events',
    icon: Activity,
    href: '/settings/audit-logs',
    status: 'active',
  },
];

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure your store settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS_SECTIONS.map((section) => (
          <Link key={section.label} href={section.href}>
            <Card className="group h-full cursor-pointer hover:border-primary/40 transition-all duration-200 hover:shadow-md hover:shadow-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <section.icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  {section.status === 'configure' && (
                    <Badge variant="warning" className="text-[10px]">
                      Configure
                    </Badge>
                  )}
                  {section.status === 'active' && (
                    <Badge variant="success" className="text-[10px]">
                      Active
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-sm font-semibold mt-3">{section.label}</CardTitle>
                <CardDescription className="text-xs">{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
