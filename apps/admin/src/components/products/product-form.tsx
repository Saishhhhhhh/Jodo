'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api-client';
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
  model3dUrl: z.string().optional().default(''),
  videoUrl: z.string().optional().default(''),
  brochureUrl: z.string().optional().default(''),
  status: z.enum(['draft', 'active', 'archived']),
  material: z.string().optional().default(''),
  dimensions: z.string().optional().default(''),
  weight: z.coerce.number().min(0).optional(),
  assemblyRequired: z.boolean().default(false),
  shortDescription: z.string().optional().default(''),
  longDescription: z.string().optional().default(''),
  emiAvailable: z.boolean().default(false),
  emiStartingFrom: z.coerce.number().optional(),
  additionalOffersStr: z.string().optional().default(''),
  tagsStr: z.string().optional().default(''),
  addons: z.array(z.string()).default([]),
  assemblyFee: z.coerce.number().optional(),
  careAndMaintenance: z.string().optional().default(''),
  warrantyTerms: z.string().optional().default(''),
  detailBrand: z.string().optional().default(''),
  detailCollection: z.string().optional().default(''),
  detailRoomType: z.string().optional().default(''),
  detailSeatingHeight: z.string().optional().default(''),
  detailFirmness: z.string().optional().default(''),
  detailWarranty: z.string().optional().default(''),
  detailRating: z.string().optional().default(''),
  specFrame: z.string().optional().default(''),
  specUpholstery: z.string().optional().default(''),
  specFoam: z.string().optional().default(''),
  specLegs: z.string().optional().default(''),
  specMechanism: z.string().optional().default(''),
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
  const modelFileInputRef = useRef<HTMLInputElement>(null);
  const brochureFileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showGalleryUrlInput, setShowGalleryUrlInput] = useState(false);
  const [galleryUrlValue, setGalleryUrlValue] = useState('');

  const { data: allProducts } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const res = await productsApi.list();
      return res.data.data;
    },
  });

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
      model3dUrl: initialData?.model3dUrl || '',
      videoUrl: initialData?.videoUrl || '',
      brochureUrl: initialData?.brochureUrl || '',
      status: initialData?.status || 'active',
      material: initialData?.material || '',
      dimensions: initialData?.dimensions || '',
      weight: initialData?.weight ?? 0,
      assemblyRequired: initialData?.assemblyRequired ?? false,
      shortDescription: initialData?.shortDescription || '',
      longDescription: initialData?.longDescription || '',
      emiAvailable: initialData?.emiAvailable ?? false,
      emiStartingFrom: initialData?.emiStartingFrom ?? undefined,
      additionalOffersStr: initialData?.additionalOffers?.join('\n') || '',
      tagsStr: initialData?.tags?.join(', ') || '',
      addons: initialData?.addons?.map((a: any) => typeof a === 'string' ? a : a._id) || [],
      assemblyFee: initialData?.assemblyFee ?? undefined,
      careAndMaintenance: initialData?.careAndMaintenance || '',
      warrantyTerms: initialData?.warrantyTerms || '',
      detailBrand: initialData?.productDetails?.['Brand'] || '',
      detailCollection: initialData?.productDetails?.['Collections'] || '',
      detailRoomType: initialData?.productDetails?.['Room Type'] || '',
      detailSeatingHeight: initialData?.productDetails?.['Seating Height'] || '',
      detailFirmness: initialData?.productDetails?.['Sofa Firmness'] || '',
      detailWarranty: initialData?.productDetails?.['Warranty'] || '',
      detailRating: initialData?.productDetails?.['Product Rating'] || '',
      specFrame: initialData?.specifications?.find((s: any) => s.key === 'Frame')?.value || '',
      specUpholstery: initialData?.specifications?.find((s: any) => s.key === 'Upholstery')?.value || '',
      specFoam: initialData?.specifications?.find((s: any) => s.key === 'Foam')?.value || '',
      specLegs: initialData?.specifications?.find((s: any) => s.key === 'Legs')?.value || '',
      specMechanism: initialData?.specifications?.find((s: any) => s.key === 'Seating Mechanism')?.value || '',
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

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('File size exceeds 20MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    const parsedValues: any = { ...values };
    parsedValues.additionalOffers = values.additionalOffersStr ? values.additionalOffersStr.split('\n').map((s: string) => s.trim()).filter(Boolean) : [];
    parsedValues.tags = values.tagsStr;
    parsedValues.addons = values.addons;

    parsedValues.productDetails = {
      ...(values.detailBrand && { 'Brand': values.detailBrand }),
      ...(values.detailCollection && { 'Collections': values.detailCollection }),
      ...(values.detailRoomType && { 'Room Type': values.detailRoomType }),
      ...(values.detailSeatingHeight && { 'Seating Height': values.detailSeatingHeight }),
      ...(values.detailFirmness && { 'Sofa Firmness': values.detailFirmness }),
      ...(values.detailWarranty && { 'Warranty': values.detailWarranty }),
      ...(values.detailRating && { 'Product Rating': values.detailRating }),
    };

    parsedValues.specifications = [
      ...(values.specFrame ? [{ key: 'Frame', value: values.specFrame }] : []),
      ...(values.specUpholstery ? [{ key: 'Upholstery', value: values.specUpholstery }] : []),
      ...(values.specFoam ? [{ key: 'Foam', value: values.specFoam }] : []),
      ...(values.specLegs ? [{ key: 'Legs', value: values.specLegs }] : []),
      ...(values.specMechanism ? [{ key: 'Seating Mechanism', value: values.specMechanism }] : []),
    ];

    onSubmit(parsedValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="w-full">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Main Column */}
          <div className="flex-1 space-y-6 w-full">
            {/* General Info Card */}
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-3 mb-4">Basic Details</h3>
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
            </div>

            {/* Media Card */}
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
              <h3 className="font-semibold text-lg border-b pb-3">Media</h3>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel>Main Image</FormLabel>

                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          value={field.value?.startsWith('data:') ? 'Uploaded File (Base64)' : field.value || ''}
                          onChange={(e) => {
                            if (!field.value?.startsWith('data:')) {
                              field.onChange(e.target.value);
                            }
                          }}
                          readOnly={field.value?.startsWith('data:')}
                        />
                      </FormControl>

                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, field.onChange)}
                      />

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          if (field.value?.startsWith('data:')) {
                            field.onChange('');
                          } else {
                            fileInputRef.current?.click();
                          }
                        }}
                      >
                        {field.value?.startsWith('data:') ? <X className="h-4 w-4 mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                        {field.value?.startsWith('data:') ? 'Clear' : 'Upload'}
                      </Button>
                    </div>

                    {field.value && (
                      <div className="relative rounded-lg border bg-muted/30 p-2 flex items-center justify-center min-h-[200px] group overflow-hidden">
                        <img
                          src={field.value}
                          alt="Product Preview"
                          className="max-h-[190px] max-w-full rounded-md object-contain"
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
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="galleryImages"
                render={({ field }) => (
                  <FormItem className="space-y-2 mt-4 pt-4 border-t border-dashed">
                    <FormLabel>Gallery Images (Optional)</FormLabel>
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
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
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

              <FormField
                control={form.control}
                name="model3dUrl"
                render={({ field }) => (
                  <FormItem className="space-y-2 mt-4 pt-4 border-t border-dashed">
                    <FormLabel>3D Model URL (.glb or .gltf) (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <Input 
                          placeholder="e.g. /wooden_sofa/scene.gltf" 
                          {...field} 
                          value={field.value?.startsWith('data:') ? 'Uploaded File (Base64)' : field.value || ''} 
                          onChange={(e) => {
                            if (!field.value?.startsWith('data:')) {
                              field.onChange(e.target.value);
                            }
                          }}
                          readOnly={field.value?.startsWith('data:')}
                        />
                        <input
                          type="file"
                          ref={modelFileInputRef}
                          className="hidden"
                          accept=".glb,.gltf"
                          onChange={(e) => handleModelFileChange(e, field.onChange)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => modelFileInputRef.current?.click()}
                          className="flex items-center gap-2 whitespace-nowrap"
                        >
                          <UploadCloud className="h-4 w-4" /> {field.value?.startsWith('data:') ? 'Change' : 'Upload'}
                        </Button>
                        {field.value?.startsWith('data:') && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => field.onChange('')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Link to a 3D model file to enable AR Try-On and 3D preview on the product page.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube Video URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. https://www.youtube.com/watch?v=-ueUb6PNwbs" {...field} />
                    </FormControl>
                    <FormDescription>
                      If provided, this video will be displayed next to the product details on the frontend.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brochureUrl"
                render={({ field }) => (
                  <FormItem className="space-y-2 mt-4 pt-4 border-t border-dashed">
                    <FormLabel>Product Brochure (.pdf) (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <Input 
                          placeholder="e.g. /brochure.pdf" 
                          {...field} 
                          value={field.value?.startsWith('data:') ? 'Uploaded File (Base64)' : field.value || ''} 
                          onChange={(e) => {
                            if (!field.value?.startsWith('data:')) {
                              field.onChange(e.target.value);
                            }
                          }}
                          readOnly={field.value?.startsWith('data:')}
                        />
                        <input
                          type="file"
                          accept=".pdf"
                          ref={brochureFileInputRef}
                          className="hidden"
                          onChange={(e) => handleModelFileChange(e, field.onChange)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => brochureFileInputRef.current?.click()}
                          className="flex items-center gap-2 whitespace-nowrap"
                        >
                          <UploadCloud className="h-4 w-4" /> {field.value?.startsWith('data:') ? 'Change' : 'Upload'}
                        </Button>
                        {field.value?.startsWith('data:') && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => field.onChange('')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a PDF brochure that customers can download on the product page.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing Card */}
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-3 mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Specs Card */}
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-3 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-6 h-[40px]">
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

            {/* Rich Details Card */}
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-3 mb-4">Rich Details (Premium Layout)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="shortDescription" render={({ field }) => (
                  <FormItem><FormLabel>Short Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="emiStartingFrom" render={({ field }) => (
                  <FormItem><FormLabel>EMI Starting From (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="longDescription" render={({ field }) => (
                <FormItem><FormLabel>Long Description</FormLabel><FormControl><Textarea className="h-24" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="additionalOffersStr" render={({ field }) => (
                <FormItem><FormLabel>Additional Offers (One per line)</FormLabel><FormControl><Textarea className="h-24" {...field} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="assemblyFee" render={({ field }) => (
                  <FormItem><FormLabel>Assembly Fee (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="emiAvailable" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                    <FormControl><input type="checkbox" className="h-4 w-4 accent-primary" checked={field.value} onChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none"><FormLabel>Enable EMI Option</FormLabel></div>
                  </FormItem>
                )} />
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-md mb-4 text-gray-700">Specific Product Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="detailBrand" render={({ field }) => (
                    <FormItem><FormLabel>Brand</FormLabel><FormControl><Input placeholder="e.g. Woodsworth" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="detailCollection" render={({ field }) => (
                    <FormItem><FormLabel>Collection</FormLabel><FormControl><Input placeholder="e.g. Miranda" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="detailRoomType" render={({ field }) => (
                    <FormItem><FormLabel>Room Type</FormLabel><FormControl><Input placeholder="e.g. Living Room" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="detailFirmness" render={({ field }) => (
                    <FormItem><FormLabel>Firmness</FormLabel><FormControl><Input placeholder="e.g. Medium" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="detailSeatingHeight" render={({ field }) => (
                    <FormItem><FormLabel>Seating Height (inches)</FormLabel><FormControl><Input placeholder="e.g. 19" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="detailRating" render={({ field }) => (
                    <FormItem><FormLabel>Rating (e.g. 4.5)</FormLabel><FormControl><Input type="number" step="0.1" max="5" min="1" {...field} /></FormControl></FormItem>
                  )} />
                </div>
                <div className="mt-4">
                  <FormField control={form.control} name="detailWarranty" render={({ field }) => (
                    <FormItem><FormLabel>Warranty Summary</FormLabel><FormControl><Input placeholder="e.g. 36 Months Warranty" {...field} /></FormControl></FormItem>
                  )} />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-md mb-4 text-gray-700">Specifications (Construction)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="specFrame" render={({ field }) => (
                    <FormItem><FormLabel>Frame Material</FormLabel><FormControl><Input placeholder="e.g. Pine Wood" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="specUpholstery" render={({ field }) => (
                    <FormItem><FormLabel>Upholstery</FormLabel><FormControl><Input placeholder="e.g. Fabric" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="specFoam" render={({ field }) => (
                    <FormItem><FormLabel>Foam Density</FormLabel><FormControl><Input placeholder="e.g. PU Foam 32D" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="specLegs" render={({ field }) => (
                    <FormItem><FormLabel>Legs</FormLabel><FormControl><Input placeholder="e.g. Wooden Legs" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="specMechanism" render={({ field }) => (
                    <FormItem><FormLabel>Seating Mechanism</FormLabel><FormControl><Input placeholder="e.g. S Spring" {...field} /></FormControl></FormItem>
                  )} />
                </div>
              </div>

              <FormField control={form.control} name="careAndMaintenance" render={({ field }) => (
                <FormItem><FormLabel>Care & Maintenance</FormLabel><FormControl><Textarea className="h-24" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="warrantyTerms" render={({ field }) => (
                <FormItem><FormLabel>Warranty Terms</FormLabel><FormControl><Textarea className="h-24" {...field} /></FormControl></FormItem>
              )} />
            </div>

            {/* Bundles & Add-ons Card */}
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-3 mb-4">Bundles & Add-ons</h3>
              <FormField
                control={form.control}
                name="addons"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Select Products to Bundle</FormLabel>
                      <FormDescription>
                        These products will be suggested as add-ons on the product page.
                      </FormDescription>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {allProducts?.filter((p: any) => p._id !== initialData?._id).map((product: any) => (
                        <FormField
                          key={product._id}
                          control={form.control}
                          name="addons"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={product._id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-muted/30 transition-colors"
                              >
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-primary translate-y-0.5 cursor-pointer"
                                    checked={field.value?.includes(product._id)}
                                    onChange={(e) => {
                                      return e.target.checked
                                        ? field.onChange([...field.value, product._id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value: string) => value !== product._id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none flex-1 cursor-pointer" onClick={() => {
                                  const isChecked = field.value?.includes(product._id);
                                  isChecked 
                                    ? field.onChange(field.value?.filter((value: string) => value !== product._id))
                                    : field.onChange([...field.value, product._id]);
                                }}>
                                  <FormLabel className="font-medium cursor-pointer flex justify-between w-full">
                                    <span>{product.title}</span>
                                    <span className="text-muted-foreground text-xs font-normal ml-2">{product.sku}</span>
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                      {(!allProducts || allProducts.length <= 1) && (
                        <p className="text-sm text-muted-foreground italic p-4 text-center border rounded-md">
                          No other products available to bundle.
                        </p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

          </div>

          {/* Right Sidebar Column */}
          <div className="w-full lg:w-[350px] space-y-6 shrink-0">
            {/* Status Card */}
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-3 mb-4">Status</h3>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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

            {/* Organization Card */}
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-3 mb-4">Product Organization</h3>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Furniture, Apparel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Jodo Retail" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tagsStr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. bed, mattress, sleep (comma separated)" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Hidden tags used for intelligent search functionality.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Inventory Card */}
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-3 mb-4">Inventory & Tracking</h3>
              <FormField
                control={form.control}
                name="inventoryQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity in Stock</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. TSH-001" {...field} />
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
                    <FormLabel>Barcode (ISBN, UPC, GTIN)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 190198123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

          </div>
        </div>

        <div className="pt-6 pb-12 mt-6 border-t flex justify-end">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto min-w-[200px]" size="lg">
            {isLoading ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
