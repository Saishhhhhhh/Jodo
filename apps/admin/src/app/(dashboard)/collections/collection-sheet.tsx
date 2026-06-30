'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { UploadCloud, X, Link as LinkIcon, Package, Check, Search } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

import { productsApi } from '@/lib/api-client';

const collectionSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional().default(''),
  imageUrl: z.string().optional().default(''),
  type: z.enum(['manual', 'automated']).default('manual'),
  products: z.array(z.string()).default([]),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

interface CollectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: any | null; // null if adding
  onSave: (values: any) => void;
  isLoading?: boolean;
}

export function CollectionSheet({
  open,
  onOpenChange,
  collection,
  onSave,
  isLoading,
}: CollectionSheetProps) {
  const isEditing = !!collection;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Fetch products to allow manual association
  const { data: products } = useQuery({
    queryKey: ['products-list-minimal'],
    queryFn: async () => {
      const res = await productsApi.list();
      return res.data.data;
    },
    enabled: open,
  });

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      type: 'manual',
      products: [],
      status: 'active',
    },
  });

  useEffect(() => {
    if (open) {
      if (collection) {
        form.reset({
          title: collection.title || '',
          description: collection.description || '',
          imageUrl: collection.imageUrl || '',
          type: collection.type || 'manual',
          products: collection.products?.map((p: any) => {
            const id = typeof p === 'string' ? p : (p?._id || p?.id);
            return id ? String(id) : '';
          }).filter(Boolean) || [],
          status: collection.status || 'active',
        });
      } else {
        form.reset({
          title: '',
          description: '',
          imageUrl: '',
          type: 'manual',
          products: [],
          status: 'active',
        });
      }
      setShowUrlInput(false);
      setProductSearch('');
    }
  }, [open, collection, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(values: CollectionFormValues) {
    onSave(values);
    onOpenChange(false);
  }

  const selectedProducts = form.watch('products') || [];

  const handleProductToggle = (productId: string, checked: boolean) => {
    const current = [...selectedProducts];
    if (checked) {
      current.push(productId);
    } else {
      const index = current.indexOf(productId);
      if (index > -1) current.splice(index, 1);
    }
    form.setValue('products', current, { shouldDirty: true });
  };
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((prod: any) =>
      prod.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      prod.sku.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Collection' : 'Create Collection'}</SheetTitle>
          <SheetDescription>
            Group products into collections manually or define rules for automation.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Summer Specials, Staff Picks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell customers about this collection..." className="h-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Collection Image</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, field.onChange)}
                      />

                      {field.value ? (
                        <div className="relative rounded-lg border bg-muted/30 p-2 flex items-center justify-center min-h-[140px] group overflow-hidden">
                          <img
                            src={field.value}
                            alt="Collection Cover"
                            className="max-h-[130px] max-w-full rounded-md object-contain"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 h-7 w-7 opacity-90 hover:opacity-100"
                            onClick={() => field.onChange('')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-muted/30 hover:border-primary/45 transition-colors min-h-[140px]"
                        >
                          <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                            <UploadCloud className="h-5 w-5" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold">Upload Image</p>
                            <p className="text-xs text-muted-foreground">Select cover image</p>
                          </div>
                        </div>
                      )}

                      {!showUrlInput && !field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs text-primary/80 h-7 flex items-center gap-1 hover:bg-primary/5 w-full justify-center"
                          onClick={() => setShowUrlInput(true)}
                        >
                          <LinkIcon className="h-3 w-3" /> Or paste image URL
                        </Button>
                      )}

                      {(showUrlInput || field.value) && (
                        <div className="flex items-center gap-2 pt-1">
                          <Input
                            placeholder="Paste image web link..."
                            className="h-8 text-xs"
                            {...field}
                          />
                          {!field.value && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground"
                              onClick={() => {
                                setShowUrlInput(false);
                                field.onChange('');
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="manual">Manual</option>
                        <option value="automated">Automated</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Manual Product Attachment Selection */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Products in Collection</label>
                <p className="text-[11px] text-muted-foreground">
                  Select the products to include in this collection.
                </p>
              </div>

              {/* Product search box */}
              {products && products.length > 0 && (
                <div className="flex items-center gap-2 bg-card rounded-md border px-2.5 py-1.5 shadow-sm">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products by title or SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                  />
                  {productSearch && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 text-muted-foreground hover:text-foreground"
                      onClick={() => setProductSearch('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}

              {filteredProducts.length > 0 ? (
                <div className="border rounded-md divide-y max-h-[180px] overflow-y-auto bg-card pr-1">
                  {filteredProducts.map((prod: any) => {
                    const prodId = String(prod._id || prod.id);
                    const isChecked = selectedProducts.includes(prodId);
                    return (
                      <div key={prodId} className="flex items-center justify-between p-2.5 hover:bg-muted/30">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Checkbox
                            id={`prod-${prodId}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => handleProductToggle(prodId, !!checked)}
                          />
                          <div className="h-7 w-7 rounded border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                            {prod.imageUrl ? (
                              <img src={prod.imageUrl} alt={prod.title} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-xs font-medium truncate">{prod.title}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{prod.sku}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-6 border border-dashed rounded-lg text-xs text-muted-foreground">
                  {productSearch ? 'No products match search query.' : 'No products available to add.'}
                </div>
              )}
            </div>

            <SheetFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
