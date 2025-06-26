// src/pages/Ingredients.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { useApp } from '@/contexts/AppContext';
import { StockItem } from '@/types';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

function IngredientForm({ editingStock, onFinished }: { editingStock: StockItem | null, onFinished: () => void }) {
    const { addStock, updateStock } = useApp();
    const initialFormData = { name: '', category: '', current_stock: 0, min_stock: 0, unit: '' };
    const [formData, setFormData] = useState(
        editingStock 
        ? { name: editingStock.name, category: editingStock.category, unit: editingStock.unit, current_stock: editingStock.current_stock, min_stock: editingStock.min_stock } 
        : initialFormData
    );

    const handleSubmit = () => { 
        if (!formData.name || !formData.category || !formData.unit) { 
            return toast({ title: 'Data Tidak Lengkap', variant: 'destructive' }); 
        } 
        const payload = { ...formData, type: 'BAHAN' as const, recipe: null, variants: null }; 
        if (editingStock) { 
            updateStock(editingStock.id, payload); 
        } else { 
            addStock(payload); 
        } 
        onFinished();
    };

    return (
        <>
            <div className="space-y-4 p-4">
                <div><Label>Nama Bahan *</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Kategori *</Label><Input value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} /></div>
                <div><Label>Satuan *</Label><Input value={formData.unit} onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))} /></div>
                <div><Label>Stok Saat Ini</Label><Input type="number" value={formData.current_stock} onChange={e => setFormData(p => ({ ...p, current_stock: Number(e.target.value) }))} /></div>
                <div><Label>Stok Minimum</Label><Input type="number" value={formData.min_stock} onChange={e => setFormData(p => ({ ...p, min_stock: Number(e.target.value) }))} /></div>
            </div>
            <DrawerFooter className="pt-2 flex-row gap-2">
                <DrawerClose asChild>
                    <Button variant="outline" onClick={onFinished} className="flex-1">Batal</Button>
                </DrawerClose>
                <Button onClick={handleSubmit} className="flex-1">{editingStock ? 'Simpan' : 'Tambah'}</Button>
            </DrawerFooter>
        </>
    )
}

export default function Ingredients() {
  const { stocks, isLoading } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"><Skeleton className="h-10 w-64" /><Skeleton className="h-10 w-32" /></div>
        <Card><CardHeader><Skeleton className="h-8 w-40" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
      </div>
    );
  }

  const ingredients = stocks.filter((s) => s.type === 'BAHAN');

  const handleOpenDialog = (stock: StockItem | null = null) => { 
      setEditingStock(stock);
      setIsDialogOpen(true); 
  };
  const onDialogFinished = () => setIsDialogOpen(false);
  
  const DialogComponent = isMobile ? Drawer : Dialog;
  const DialogContentComponent = isMobile ? DrawerContent : DialogContent;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Manajemen Bahan</h1><Button onClick={() => handleOpenDialog()}><Plus className="mr-2 h-4 w-4" /> Tambah Bahan</Button></div>
      
      <DialogComponent open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContentComponent>
              <DialogHeader className="p-4 pb-0">
                  <DialogTitle>{editingStock ? 'Edit' : 'Tambah'} Bahan</DialogTitle>
                  <DialogDescription>Lengkapi detail di bawah ini.</DialogDescription>
              </DialogHeader>
              <IngredientForm editingStock={editingStock} onFinished={onDialogFinished} />
          </DialogContentComponent>
      </DialogComponent>

      <Card>
        <CardHeader><CardTitle>Daftar Bahan</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full">
            <thead><tr className="border-b"><th className="p-3 text-left">Nama</th><th className="p-3 text-left">Kategori</th><th className="p-3 text-left">Stok</th><th className="p-3 text-left">Aksi</th></tr></thead>
            <tbody>
              {ingredients.map((bahan) => (<tr key={bahan.id} className="border-b">
                  <td className="p-3 font-medium">{bahan.name}</td>
                  <td className="p-3">{bahan.category}</td>
                  <td className="p-3">{bahan.current_stock} {bahan.unit}</td>
                  <td className="p-3"><Button size="sm" variant="outline" onClick={() => handleOpenDialog(bahan)}>Edit</Button></td>
              </tr>))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}