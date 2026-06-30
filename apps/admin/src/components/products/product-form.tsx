'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import { UploadCloud, X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  sku: z.string().min(2, { message: 'SKU must be at least 2 characters.' }),
  barcode: z.string().optional().default(''),
  price: z.coerce.number().min(0, { message: 'Price must be positive.' }),
  compareAtPrice: z.coerce.number().min(0, { message: 'Compare at price must be positive.' }).optional(),
  inventoryQuantity: z.coerce.number().min(0, { message: 'Inventory must be positive.' }),
  category: z.string().min(2, { message: 'Category is required.' }),
  vendor: z.string().optional().default(''),
  imageUrl: z.string().optional().default(''),
  galleryImages: z.array(z.string()).default([]),
  status: z.enum(['draft', 'active', 'archived']),
  material: z.string().optional().default(''),
  dimensions: z.string().optional().default(''),
  weight: z.coerce.number().min(0).optional(),
  assemblyRequired: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showGalleryUrlInput, setShowGalleryUrlInput] = useState(false);
  const [galleryUrlValue, setGalleryUrlValue] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      sku: initialData?.sku || '',
      barcode: initialData?.barcode || '',
      price: initialData?.price ?? 0,
      compareAtPrice: initialData?.compareAtPrice ?? undefined,
      inventoryQuantity: initialData?.inventoryQuantity ?? 0,
      category: initialData?.category || '',
      vendor: initialData?.vendor || '',
      imageUrl: initialData?.imageUrl || '',
      galleryImages: initialData?.galleryImages || [],
      status: initialData?.status || 'active',
      material: initialData?.material || '',
      dimensions: initialData?.dimensions || '',
      weight: initialData?.weight ?? 0,
      assemblyRequired: initialData?.assemblyRequired ?? false,
    },
  });

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

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    const currentImages = field.value || [];
    let processedCount = 0;
    const newImages: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 5MB limit.`);
        processedCount++;
        if (processedCount === files.length) {
          field.onChange([...currentImages, ...newImages]);
        }
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        processedCount++;
        if (processedCount === files.length) {
          field.onChange([...currentImages, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const triggerGalleryFileSelect = () => {
    galleryFileInputRef.current?.click();
  };

  const removeGalleryImage = (index: number, field: any) => {
    const newImages = [...field.value];
    newImages.splice(index, 1);
    field.onChange(newImages);
  };
  
  const addGalleryUrl = (field: any) => {
    if (galleryUrlValue.trim()) {
      field.onChange([...(field.value || []), galleryUrlValue.trim()]);
      setGalleryUrlValue('');
      setShowGalleryUrlInput(false);
    }
  };

  const handleFormSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pr-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Premium T-Shirt" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Product Media</FormLabel>
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
                    <div className="relative rounded-lg border bg-muted/30 p-2 flex items-center justify-center min-h-[160px] group overflow-hidden">
                      <img
                        src={field.value}
                        alt="Product Preview"
                        className="max-h-[150px] max-w-full rounded-md object-contain"
                        referrerPolicy="no-referrer"
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
                      onClick={triggerFileSelect}
                      className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/30 hover:border-primary/45 transition-colors min-h-[160px]"
                    >
                      <div className="rounded-full bg-primary/10 p-3 text-primary">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold">Upload Image</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Drag and drop or click to upload</p>
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
                        placeholder="Paste image web link (e.g. https://...)"
                        className="h-8 text-xs"
                        {...field}
                      />
                      {!field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
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
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="TSH-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode (GTIN/UPC)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 190198123456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (INR)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="compareAtPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compare At Price (INR)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g. Original Price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="inventoryQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inventory</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Apparel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor</FormLabel>
                <FormControl>
                  <Input placeholder="Jodo Apparel" {...field} />
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
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        <FormField
          control={form.control}
          name="galleryImages"
          render={({ field }) => (
            <FormItem className="space-y-2 mt-4">
              <FormLabel>Gallery Images</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <input
                    type="file"
                    multiple
                    ref={galleryFileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleGalleryFileChange(e, field)}
                  />

                  {field.value && field.value.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {field.value.map((url: string, idx: number) => (
                        <div key={idx} className="relative rounded-lg border bg-muted/30 p-2 flex items-center justify-center h-[120px] group overflow-hidden">
                          <img
                            src={url}
                            alt={`Gallery ${idx + 1}`}
                            className="max-h-[110px] max-w-full rounded-md object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeGalleryImage(idx, field)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div
                      onClick={triggerGalleryFileSelect}
                      className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted/30 hover:border-primary/45 transition-colors flex-1"
                    >
                      <UploadCloud className="h-5 w-5 text-muted-foreground" />
                      <p className="text-xs font-semibold text-muted-foreground mt-1">Upload Images</p>
                    </div>

                    {!showGalleryUrlInput ? (
                      <div
                        onClick={() => setShowGalleryUrlInput(true)}
                        className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted/30 hover:border-primary/45 transition-colors flex-1"
                      >
                        <LinkIcon className="h-5 w-5 text-muted-foreground" />
                        <p className="text-xs font-semibold text-muted-foreground mt-1">Add from URL</p>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-2 flex flex-col items-center justify-center gap-2 flex-1">
                        <Input
                          placeholder="Image URL"
                          className="h-8 text-xs"
                          value={galleryUrlValue}
                          onChange={(e) => setGalleryUrlValue(e.target.value)}
                        />
                        <div className="flex gap-2 w-full">
                          <Button
                            type="button"
                            size="sm"
                            className="h-7 text-xs flex-1"
                            onClick={() => addGalleryUrl(field)}
                          >
                            Add
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs flex-1"
                            onClick={() => {
                              setShowGalleryUrlInput(false);
                              setGalleryUrlValue('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2 pb-2">
          <h3 className="text-sm font-medium border-b pb-2 mb-4">Furniture Specifications</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Solid Oak Wood" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dimensions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dimensions</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 72 x 36 x 30 inches" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assemblyRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-8 h-[36px]">
                  <div className="space-y-0.5">
                    <FormLabel>Assembly Required</FormLabel>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
