'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Store, 
  Settings, 
  HelpCircle,
  Megaphone,
  CreditCard
} from 'lucide-react';

export default function HelpDocsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <HelpCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Documentation</h1>
          <p className="text-muted-foreground mt-1">
            Everything you need to know about managing your store with Jodo Commerce OS.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <section id="getting-started">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <Card>
            <CardContent className="pt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Welcome to your new admin panel. From here, you can manage your entire commerce operation,
                from uploading products and organizing them into collections, to managing customer orders
                and customizing the storefront.
              </p>
              <p>
                Navigate using the sidebar on the left. The dashboard gives you a quick overview of your 
                sales and activity. Use the search bar at the top (or press <kbd className="px-1.5 py-0.5 bg-muted rounded border">⌘K</kbd>) 
                to quickly jump between pages.
              </p>
            </CardContent>
          </Card>
        </section>

        <section id="store-management">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Store Management</h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Products & Collections</CardTitle>
              <CardDescription>Managing your catalog</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <h3 className="font-medium text-foreground">Creating Products</h3>
              <p>
                Navigate to <strong>Store {'>'} Products</strong> to add new items. You can set the title, description, 
                price, and upload multiple high-resolution images. Make sure to define your variants (like size or color) 
                if the product comes in different options.
              </p>
              <Separator />
              <h3 className="font-medium text-foreground">Organizing with Collections</h3>
              <p>
                Collections help group your products together (e.g., "Summer Sale" or "Living Room Furniture"). 
                Go to <strong>Store {'>'} Collections</strong>. You can manually assign products to a collection or 
                set up automated rules based on tags or prices.
              </p>
              <Separator />
              <h3 className="font-medium text-foreground">Inventory Tracking</h3>
              <p>
                Keep track of stock levels under <strong>Store {'>'} Inventory</strong>. You can adjust quantities 
                across multiple locations and set up alerts for low stock.
              </p>
            </CardContent>
          </Card>
        </section>

        <section id="orders">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Order Processing</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <h3 className="font-medium text-foreground">Fulfilling Orders</h3>
              <p>
                When a customer places an order, it appears in <strong>Orders {'>'} All Orders</strong> as "Unfulfilled". 
                Click on the order to view details, package the items, and mark it as fulfilled. You can also print 
                packing slips and purchase shipping labels directly from this view.
              </p>
              <h3 className="font-medium text-foreground">Handling Returns</h3>
              <p>
                If a customer requests a return, process it under <strong>Orders {'>'} Returns</strong>. You can issue 
                refunds (partial or full) and restock the items back into your inventory automatically.
              </p>
            </CardContent>
          </Card>
        </section>

        <section id="customers">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Customer Relations</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                The <strong>Customers</strong> section acts as your CRM. You can view order histories, total spent, 
                and contact information for every customer who interacts with your store.
              </p>
              <h3 className="font-medium text-foreground">Customer Segments</h3>
              <p>
                Use segments to group customers based on their purchasing behavior. For example, you can create a 
                segment for "VIP Customers" (spent over $500) and target them with specific email marketing campaigns 
                using the <strong>Marketing</strong> tab.
              </p>
            </CardContent>
          </Card>
        </section>

        <section id="settings">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Settings & Configuration</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <h3 className="font-medium text-foreground">Store Details & Profile</h3>
              <p>
                Update your store's name, contact email, and address in <strong>Settings {'>'} Store Details</strong>. 
                To change your personal admin avatar or the Admin Panel Logo, click your profile in the top right and 
                select <strong>Profile Settings</strong>.
              </p>
              <Separator />
              <h3 className="font-medium text-foreground">Staff Permissions</h3>
              <p>
                Need to give your team access? Go to <strong>Settings {'>'} Staff & Permissions</strong> to invite 
                users and restrict what they can see or edit.
              </p>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}
