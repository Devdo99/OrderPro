// src/pages/Products.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { StockItem, RecipeItem } from '@/types';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BulkStockImport from '@/components/BulkStockImport';
import { generateProductTemplate } from '@/utils/exportUtils';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

export default function Products() {
  const appContext = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  
  const initialFormData: Omit<StockItem, 'id' | 'created_at' | 'last_updated'> = {
    name: '', category: '', unit: 'porsi', type: 'PRODUK',
    min_stock: 5, current_stock: 0, recipe: [], variants: [],
  };
  const [formData, setFormData] = useState(initialFormData);

  // --- PERBAIKAN: Guard Clause untuk menunggu context siap ---
  if (!appContext) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Card>
          <CardHeader><Skeleton className="h-8 w-40" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const { stocks, addStock, updateStock, deleteStock } = appContext;

  const products = stocks.filter((s) => s.type === 'PRODUK');
  const ingredients = stocks.filter((s) => s.type === 'BAHAN');

  const handleOpenDialog = (stock: StockItem | null = null) => {
    if (stock) {
      setEditingStock(stock);
      setFormData({
        name: stock.name, category: stock.category, unit: stock.unit, type: 'PRODUK',
        min_stock: stock.min_stock, current_stock: stock.current_stock,
        recipe: stock.recipe || [], variants: stock.variants || [],
      });
    } else {
      setEditingStock(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };
  
  const handleRecipeChange = (index: number, field: keyof RecipeItem, value: string) => {
    const newRecipe = [...(formData.recipe || [])];
    newRecipe[index] = { ...newRecipe[index], [field]: field === 'quantityNeeded' ? Number(value) : value };
    setFormData(p => ({ ...p, recipe: newRecipe }));
  };
  const addRecipeItem = () => setFormData(p => ({ ...p, recipe: [...(p.recipe || []), { ingredientId: '', quantityNeeded: 1 }] }));
  const removeRecipeItem = (index: number) => setFormData(p => ({ ...p, recipe: (p.recipe || []).filter((_, i) => i !== index) }));

  const handleVariantChange = (index: number, value: string) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], name: value };
    setFormData(p => ({ ...p, variants: newVariants }));
  };
  const addVariant = () => setFormData(p => ({ ...p, variants: [...(p.variants || []), { name: '' }] }));
  const removeVariant = (index: number) => setFormData(p => ({ ...p, variants: (p.variants || []).filter((_, i) => i !== index) }));

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.unit) {
      return toast({ title: 'Data Tidak Lengkap', description: 'Nama, kategori, dan satuan produk wajib diisi.', variant: 'destructive' });
    }
    const payload = { ...formData };
    if (editingStock) {
      updateStock(editingStock.id, payload);
    } else {
      addStock(payload);
    }
    setIsDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manajemen Produk</h1>
        <div className="flex gap-2">
            <BulkStockImport stockType="PRODUK" onGenerateTemplate={generateProductTemplate} />
            <Button onClick={() => handleOpenDialog()}><Plus className="mr-2 h-4 w-4" /> Tambah Produk</Button>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingStock ? 'Edit' : 'Tambah'} Produk</DialogTitle>
            <DialogDescription>Lengkapi detail produk, resep, dan varian yang tersedia.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            <div className="space-y-4 md:col-span-1">
                <h3 className='font-semibold'>Info Dasar</h3>
                <div><Label>Nama Produk *</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Kategori *</Label><Input value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} /></div>
                <div><Label>Satuan *</Label><Input value={formData.unit} onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))} /></div>
                <div><Label>Stok Minimum</Label><Input type="number" value={formData.min_stock} onChange={e => setFormData(p => ({ ...p, min_stock: Number(e.target.value) }))} /></div>
            </div>
            <div className="space-y-4 md:col-span-1">
              <h3 className='font-semibold'>Resep</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 border p-3 rounded-md">
                {(formData.recipe || []).map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Select value={item.ingredientId} onValueChange={(value) => handleRecipeChange(index, 'ingredientId', value)}>
                        <SelectTrigger><SelectValue placeholder="Pilih bahan..."/></SelectTrigger>
                        <SelectContent>{ingredients.map(ing => <SelectItem key={ing.id} value={ing.id}>{ing.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input type="number" value={item.quantityNeeded} onChange={(e) => handleRecipeChange(index, 'quantityNeeded', e.target.value)} className="w-24" />
                    <Button variant="destructive" size="icon" onClick={() => removeRecipeItem(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                 {formData.recipe?.length === 0 && <p className='text-sm text-gray-500 text-center'>Belum ada resep.</p>}
              </div>
              <Button variant="outline" onClick={addRecipeItem} className="w-full">Tambah Bahan ke Resep</Button>
            </div>
            <div className="space-y-4 md:col-span-1">
              <h3 className='font-semibold'>Varian (Contoh: Paket Nasi)</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 border p-3 rounded-md">
                {(formData.variants || []).map((variant, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input placeholder="Nama Varian" value={variant.name} onChange={(e) => handleVariantChange(index, e.target.value)} />
                    <Button variant="destructive" size="icon" onClick={() => removeVariant(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                {formData.variants?.length === 0 && <p className='text-sm text-gray-500 text-center'>Belum ada varian.</p>}
              </div>
              <Button variant="outline" onClick={addVariant} className="w-full">Tambah Varian</Button>
            </div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button><Button onClick={handleSubmit}>{editingStock ? 'Simpan' : 'Tambah'}</Button></div>
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader><CardTitle>Daftar Produk</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b"><th className="p-3 text-left">Nama</th><th className="p-3 text-left">Kategori</th><th className="p-3 text-left">Varian</th><th className="p-3 text-left">Aksi</th></tr></thead>
              <tbody>
                {products.map((produk) => (<tr key={produk.id} className="border-b">
                    <td className="p-3 font-medium">{produk.name}</td>
                    <td className="p-3">{produk.category}</td>
                    <td className="p-3 text-sm text-gray-600">{produk.variants && produk.variants.length > 0 ? produk.variants.map(v => v.name).join(', ') : '-'}</td>
                    <td className="p-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenDialog(produk)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteStock(produk.id)}>Hapus</Button>
                    </td>
                </tr>))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
