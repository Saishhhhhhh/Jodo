'use client';

import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Edit2,
  Trash2,
  Download,
  Eye,
  EyeOff,
  QrCode,
  Package,
  BarChart3,
  LogIn,
  LogOut,
  Search,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import type { ARProduct } from '@/types/product';
import Link from 'next/link';

export default function AdminDashboard() {
  const {
    navigateTo,
    isAdminLoggedIn,
    setAdminLoggedIn,
    editingProduct,
    setEditingProduct,
    showProductForm,
    setShowProductForm,
  } = useAppStore();
  const [products, setProducts] = useState<ARProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products?active=false');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdminLoggedIn) return;
    queueMicrotask(fetchProducts);
  }, [isAdminLoggedIn, fetchProducts]);

  const handleLogin = () => {
    if (loginPassword === 'admin123') {
      setAdminLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid password. Use "admin123"');
    }
  };

  const handleLogout = () => {
    setAdminLoggedIn(false);
    navigateTo('home');
  };

  const handleToggleActive = async (product: ARProduct) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Login Screen
  if (!isAdminLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[60vh] items-center justify-center"
      >
        <Card className="w-full max-w-md border-border/40">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <LogIn className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="mt-4 text-xl">Admin Login</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter the admin password to manage products
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Admin password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="h-11"
              />
              {loginError && (
                <p className="mt-2 text-xs text-destructive">{loginError}</p>
              )}
            </div>
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo password: admin123
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage your AR products and QR codes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo('admin-analytics')}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Products', value: products.length, icon: Package, color: 'text-emerald-600' },
          { label: 'Active Products', value: products.filter(p => p.isActive).length, icon: Eye, color: 'text-teal-600' },
          { label: 'Inactive', value: products.filter(p => !p.isActive).length, icon: EyeOff, color: 'text-amber-600' },
          { label: 'Categories', value: [...new Set(products.map(p => p.category))].length, icon: QrCode, color: 'text-violet-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color} opacity-60`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => {
            setEditingProduct(null);
            setShowProductForm(true);
          }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await fetch('/api/products/seed', { method: 'POST' });
            fetchProducts();
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Seed Sample Data
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Products Table */}
      <Card className="border-border/40">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>3D Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                            <img
                              src={product.model.posterUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground">/{product.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{product.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.isActive ? 'default' : 'secondary'}
                          className={`text-xs ${product.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : ''}`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {product.model.fileSizeMb ? `${product.model.fileSizeMb} MB` : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleActive(product)}
                            title={product.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {product.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductForm(true);
                            }}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <a
                            href={`/api/qr?slug=${product.slug}&size=400`}
                            download={`${product.slug}-qr.png`}
                            className="inline-flex"
                          >
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm(product.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={showProductForm}
        onOpenChange={setShowProductForm}
        product={editingProduct}
        onSave={() => {
          setShowProductForm(false);
          setEditingProduct(null);
          fetchProducts();
        }}
      />
    </motion.div>
  );
}

function getProductFormState(product: ARProduct | null) {
  if (!product) {
    return {
      name: '',
      slug: '',
      sku: '',
      category: 'Furniture',
      description: '',
      price: '',
      enquiryOnly: true,
      width: '',
      height: '',
      depth: '',
      unit: 'cm',
      weight: '',
      glbUrl: '/models/',
      usdzUrl: '',
      posterUrl: '/posters/',
      fileSizeMb: '',
      isActive: true,
    };
  }

  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    category: product.category,
    description: product.description,
    price: product.price?.toString() || '',
    enquiryOnly: product.enquiryOnly,
    width: product.dimensions.width.toString(),
    height: product.dimensions.height.toString(),
    depth: product.dimensions.depth.toString(),
    unit: product.dimensions.unit,
    weight: product.weight?.toString() || '',
    glbUrl: product.model.glbUrl,
    usdzUrl: product.model.usdzUrl || '',
    posterUrl: product.model.posterUrl,
    fileSizeMb: product.model.fileSizeMb?.toString() || '',
    isActive: product.isActive,
  };
}

// Product Form Dialog Component
function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ARProduct | null;
  onSave: () => void;
}) {
  const [form, setForm] = useState(() => getProductFormState(product));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setForm(getProductFormState(product));
    });
  }, [product, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        sku: form.sku,
        category: form.category,
        description: form.description,
        price: form.price ? parseFloat(form.price) : null,
        enquiryOnly: form.enquiryOnly,
        width: parseFloat(form.width) || 0,
        height: parseFloat(form.height) || 0,
        depth: parseFloat(form.depth) || 0,
        unit: form.unit,
        weight: form.weight ? parseFloat(form.weight) : null,
        glbUrl: form.glbUrl,
        usdzUrl: form.usdzUrl || null,
        posterUrl: form.posterUrl,
        fileSizeMb: form.fileSizeMb ? parseFloat(form.fileSizeMb) : null,
        isActive: form.isActive,
      };

      if (product) {
        await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'h-9 text-sm';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Basic Info */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="product-name" className="text-xs font-medium text-muted-foreground">Product Name</label>
              <Input
                id="product-name"
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Premium Oak Chair"
              />
            </div>
            <div>
              <label htmlFor="product-slug" className="text-xs font-medium text-muted-foreground">Slug</label>
              <Input
                id="product-slug"
                className={inputClass}
                value={form.slug}
                onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="premium-oak-chair"
              />
            </div>
            <div>
              <label htmlFor="product-sku" className="text-xs font-medium text-muted-foreground">SKU</label>
              <Input
                id="product-sku"
                className={inputClass}
                value={form.sku}
                onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))}
                placeholder="CHAIR-001"
              />
            </div>
            <div>
              <label htmlFor="product-category" className="text-xs font-medium text-muted-foreground">Category</label>
              <Input
                id="product-category"
                className={inputClass}
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="Furniture"
              />
            </div>
            <div>
              <label htmlFor="product-price" className="text-xs font-medium text-muted-foreground">Price (leave empty for enquiry)</label>
              <Input
                id="product-price"
                className={inputClass}
                type="number"
                value={form.price}
                onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="product-description" className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              id="product-description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Product description..."
            />
          </div>

          {/* Dimensions */}
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-2 block">Dimensions</span>
            <div className="grid grid-cols-4 gap-2">
              <Input
                id="product-width"
                aria-label="Width"
                className={inputClass}
                type="number"
                value={form.width}
                onChange={(e) => setForm(f => ({ ...f, width: e.target.value }))}
                placeholder="Width"
              />
              <Input
                id="product-height"
                aria-label="Height"
                className={inputClass}
                type="number"
                value={form.height}
                onChange={(e) => setForm(f => ({ ...f, height: e.target.value }))}
                placeholder="Height"
              />
              <Input
                id="product-depth"
                aria-label="Depth"
                className={inputClass}
                type="number"
                value={form.depth}
                onChange={(e) => setForm(f => ({ ...f, depth: e.target.value }))}
                placeholder="Depth"
              />
              <Input
                id="product-unit"
                aria-label="Unit"
                className={inputClass}
                value={form.unit}
                onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))}
                placeholder="cm"
              />
            </div>
          </div>

          {/* Model URLs */}
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-2 block">3D Model URLs</span>
            <div className="space-y-2">
              <Input
                id="product-glb-url"
                aria-label="GLB file URL"
                className={inputClass}
                value={form.glbUrl}
                onChange={(e) => setForm(f => ({ ...f, glbUrl: e.target.value }))}
                placeholder="GLB file URL"
              />
              <Input
                id="product-usdz-url"
                aria-label="USDZ file URL"
                className={inputClass}
                value={form.usdzUrl}
                onChange={(e) => setForm(f => ({ ...f, usdzUrl: e.target.value }))}
                placeholder="USDZ file URL (optional, for iOS)"
              />
              <Input
                id="product-poster-url"
                aria-label="Poster image URL"
                className={inputClass}
                value={form.posterUrl}
                onChange={(e) => setForm(f => ({ ...f, posterUrl: e.target.value }))}
                placeholder="Poster image URL"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.name}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
          >
            {saving ? 'Saving...' : product ? 'Update' : 'Create'} Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
