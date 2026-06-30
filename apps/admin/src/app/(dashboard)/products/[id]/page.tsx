'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api-client';
import { ProductForm } from '@/components/products/product-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const isNew = id === 'new';

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (isNew) return null;
      const res = await productsApi.get(id);
      return res.data.data;
    },
    enabled: !isNew,
  });

  const createMutation = useMutation({
    mutationFn: (newProduct: any) => productsApi.create(newProduct),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
      router.push(`/products/${res.data.data._id}`);
    },
    onError: () => toast.error('Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast.success('Product updated successfully');
    },
    onError: () => toast.error('Failed to update product'),
  });

  const handleSubmit = (formData: any) => {
    if (isNew) {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  if (isLoading && !isNew) {
    return <div className="p-8 animate-pulse text-muted-foreground">Loading product details...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/products')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isNew ? 'Add Product' : product?.title || 'Edit Product'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isNew ? 'Create a new product in your catalog.' : 'Update your product details and media.'}
          </p>
        </div>
      </div>

      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
