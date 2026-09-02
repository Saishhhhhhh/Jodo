'use client';

import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, getImageUrl } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, MoreHorizontal, Pencil, Trash, Package, Download, Search, Upload } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';

type Product = {
  _id: string;
  title: string;
  sku: string;
  price: number;
  inventoryQuantity: number;
  status: string;
  category: string;
  imageUrl?: string;
  vendor?: string;
  material?: string;
  dimensions?: string;
  weight?: number;
  assemblyRequired?: boolean;
  galleryImages?: string[];
  tags?: string[];
};

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await productsApi.list();
      return res.data.data;
    },
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((p: Product) => 
      p.title?.toLowerCase().includes(query) || 
      p.sku?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);



  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => productsApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setRowSelection({});
      toast.success('Products deleted successfully');
    },
    onError: () => toast.error('Failed to delete products'),
  });

  const bulkImportMutation = useMutation({
    mutationFn: (products: any[]) => productsApi.bulkImport(products),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Products imported successfully');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to import products'),
  });

  const handleCreate = () => {
    router.push('/products/new');
  };

  const handleEdit = (product: Product) => {
    router.push(`/products/${product._id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection)
      .filter((index) => rowSelection[index as keyof typeof rowSelection])
      .map((index) => filteredData[parseInt(index)]._id);

    if (selectedIds.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
      bulkDeleteMutation.mutate(selectedIds);
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedProducts = results.data.map((row: any) => ({
          title: row['Product Name'] || 'Untitled',
          sku: row['SKU'] || '',
          price: parseFloat((row['Price'] || '0').replace(/[^0-9.-]+/g,"")),
          inventoryQuantity: parseInt(row['Stock Level'] || '0', 10),
          status: (row['Status'] || 'draft').toLowerCase(),
          category: row['Category'] || '',
          vendor: row['Vendor'] || '',
          material: row['Material'] || '',
          dimensions: row['Dimensions'] || '',
          weight: parseFloat((row['Weight'] || '0').replace(/[^0-9.-]+/g,"")),
          assemblyRequired: (row['Assembly'] || '').toLowerCase() === 'yes',
          imageUrl: row['Main Image URL'] !== '-' ? row['Main Image URL'] : '',
          galleryImages: row['Gallery Images'] !== '-' ? (row['Gallery Images'] || '').split(' ; ') : [],
          tags: row['Tags'] || ''
        }));

        bulkImportMutation.mutate(importedProducts);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        toast.error('Failed to parse CSV file');
        console.error(error);
      }
    });
  };


  const handleExportCSV = () => {
    const productsToExport = filteredData || [];
    
    const formatCurrency = (amount: number) => {
      return `"${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}"`;
    };

    const escapeCsv = (val: string | undefined | null) => {
      if (!val || val.trim() === '') return '"-"'; // Clean minimal look for empty cells
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    // Define cleaner headers
    const headers = [
      'Product Name', 'SKU', 'Price', 'Stock Level', 'Status', 'Category', 'Vendor', 
      'Material', 'Dimensions', 'Weight', 'Assembly',
      'Main Image URL', 'Gallery Images', 'Tags'
    ];
    
    // Map the products to an array of arrays
    const csvRows = productsToExport.map((p: Product) => {
      const status = p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : '';
      return [
        escapeCsv(p.title),
        escapeCsv(p.sku),
        formatCurrency(p.price || 0),
        p.inventoryQuantity || 0,
        escapeCsv(status),
        escapeCsv(p.category),
        escapeCsv(p.vendor),
        escapeCsv(p.material),
        escapeCsv(p.dimensions),
        p.weight ? `"${p.weight} kg"` : '"-"',
        escapeCsv(p.assemblyRequired ? 'Yes' : 'No'),
        escapeCsv(p.imageUrl),
        escapeCsv((p.galleryImages || []).join(' ; ')),
        escapeCsv((p.tags || []).join(', '))
      ];
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map((row: string[]) => row.join(','))
    ].join('\n');
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'products_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Products exported to CSV');
  };

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="translate-y-[2px]"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'title',
        header: 'Product',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div 
              className="flex items-center gap-3 transition-colors"
            >
              <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden shrink-0 relative">
                {product.imageUrl ? (
                  <>
                    <img 
                      src={getImageUrl(product.imageUrl)} 
                      alt={product.title} 
                      className="h-full w-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.classList.remove('hidden');
                        }
                      }}
                    />
                    <Package className="h-5 w-5 text-muted-foreground hidden absolute" />
                  </>
                ) : (
                  <Package className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate hover:underline">{product.title}</span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {product.category || 'Uncategorized'} {product.vendor ? `• ${product.vendor}` : ''}
                </span>
              </div>
            </div>
          );
        },
      },
      { accessorKey: 'sku', header: 'SKU' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          let badgeVariant: 'default' | 'secondary' | 'outline' = 'secondary';
          let customClass = '';

          if (status === 'active') {
            badgeVariant = 'default';
            customClass = 'bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none';
          } else if (status === 'draft') {
            badgeVariant = 'secondary';
            customClass = 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none';
          } else if (status === 'archived') {
            badgeVariant = 'outline';
            customClass = 'text-muted-foreground border-muted';
          }

          return (
            <Badge variant={badgeVariant} className={`text-xs capitalize font-medium ${customClass}`}>
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'inventoryQuantity',
        header: 'Inventory',
        cell: ({ row }) => {
          const qty = row.getValue('inventoryQuantity') as number;
          let stockColor = 'text-green-600 font-medium';
          if (qty === 0) {
            stockColor = 'text-destructive font-semibold';
          } else if (qty < 15) {
            stockColor = 'text-amber-600 font-medium';
          }
          return <span className={`text-xs ${stockColor}`}>{qty} in stock</span>;
        },
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => {
          const price = parseFloat(row.getValue('price'));
          const formatted = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
          }).format(price);
          return formatted;
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(product)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDelete(product._id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your catalog</p>
        </div>
        <div className="flex items-center gap-3">
          {Object.keys(rowSelection).length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleteMutation.isPending}>
              <Trash className="mr-2 h-4 w-4" /> Delete Selected ({Object.keys(rowSelection).length})
            </Button>
          )}
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImportCSV}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={bulkImportMutation.isPending}>
            <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products by title, SKU, or category..."
            className="pl-8 bg-muted/50 border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredData} 
        isLoading={isLoading} 
        onRowClick={(row) => router.push(`/products/${row._id}`)}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </div>
  );
}
