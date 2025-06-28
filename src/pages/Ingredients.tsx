// src/pages/Ingredients.tsx

import { useState, useEffect } from 'react'; // <-- PERBAIKAN: Menambahkan useEffect
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { StockItem } from '@/types';
import { Plus, Minus, Pencil, Save, PlusCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// --- Komponen Pop-up untuk MENGGANTI/MENGEDIT Total Stok ---
function EditStockPopover({ item, onUpdate }: { item: StockItem, onUpdate: (newStock: number) => void }) {
    const [stockValue, setStockValue] = useState(item.current_stock);
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = () => {
        onUpdate(stockValue);
        setIsOpen(false);
    }
    
    // Reset nilai saat pop-up dibuka
    useEffect(() => {
        if (isOpen) {
            setStockValue(item.current_stock);
        }
    }, [isOpen, item.current_stock]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="font-semibold text-lg h-auto p-1 px-2">
                    {item.current_stock}
                    <Pencil className="ml-2 h-3 w-3 text-muted-foreground opacity-50 group-hover:opacity-100" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
                <div className="space-y-2">
                    <Label htmlFor={`stock-edit-${item.id}`}>Edit Total Stok <span className='font-bold'>{item.name}</span></Label>
                    <Input
                        id={`stock-edit-${item.id}`}
                        type="number"
                        value={stockValue}
                        onChange={(e) => setStockValue(Number(e.target.value))}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        autoFocus
                    />
                    <Button onClick={handleSave} size="sm" className="w-full">
                        <Save className="mr-2 h-3 w-3" /> Simpan Total
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}


// --- Komponen Pop-up untuk MENAMBAH Stok ---
function AddStockPopover({ item, onAdd }: { item: StockItem, onAdd: (amountToAdd: number) => void }) {
    const [amount, setAmount] = useState<number | string>('');
    const [isOpen, setIsOpen] = useState(false);

    const handleAdd = () => {
        const amountToAdd = Number(amount);
        if (amountToAdd > 0) {
            onAdd(amountToAdd);
            setIsOpen(false);
            setAmount('');
        } else {
            toast({
                title: "Input Tidak Valid",
                description: "Silakan masukkan jumlah penambahan yang valid.",
                variant: "destructive",
            });
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Stok
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
                <div className="space-y-2">
                    <Label htmlFor={`stock-add-${item.id}`}>Tambah stok untuk <span className='font-bold'>{item.name}</span></Label>
                    <Input
                        id={`stock-add-${item.id}`}
                        type="number"
                        value={amount}
                        placeholder="Jumlah tambahan..."
                        onChange={(e) => setAmount(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        autoFocus
                    />
                    <Button onClick={handleAdd} size="sm" className="w-full">
                        <Save className="mr-2 h-3 w-3" /> Konfirmasi
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// --- Komponen Form untuk Dialog Tambah/Edit Bahan ---
function IngredientForm({
  editingStock,
  onFinished
}: {
  editingStock: StockItem | null;
  onFinished: () => void;
}) {
  const { addStock, updateStock } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    min_stock: 0,
    ...editingStock
  });

  useEffect(() => {
    if (editingStock) {
      setFormData({
        name: editingStock.name,
        category: editingStock.category || '',
        unit: editingStock.unit || '',
        min_stock: editingStock.min_stock || 0,
        ...editingStock
      });
    } else {
      setFormData({ name: '', category: '', unit: '', min_stock: 0 });
    }
  }, [editingStock]);

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.unit) {
      return toast({
        title: 'Data Tidak Lengkap',
        description: 'Nama, kategori, dan satuan wajib diisi.',
        variant: 'destructive'
      });
    }
    const payload = {
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      min_stock: Number(formData.min_stock),
      type: 'BAHAN' as const,
      recipe: null,
      variants: null,
      current_stock: editingStock?.current_stock || 0, // current_stock tidak diubah di form ini
    };
    if (editingStock) {
      updateStock(editingStock.id, payload);
      toast({ title: 'Bahan Diperbarui', description: `${formData.name} berhasil diperbarui.`});
    } else {
      addStock(payload);
      toast({ title: 'Bahan Ditambahkan', description: `${formData.name} berhasil ditambahkan.`});
    }
    onFinished();
  };

  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Nama Bahan</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">Kategori</Label>
          <Input id="category" value={formData.category} onChange={(e) => setFormData(p => ({...p, category: e.target.value}))} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="unit" className="text-right">Satuan</Label>
          <Input id="unit" value={formData.unit} onChange={(e) => setFormData(p => ({...p, unit: e.target.value}))} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="min_stock" className="text-right">Stok Minimum</Label>
          <Input id="min_stock" type="number" value={formData.min_stock} onChange={(e) => setFormData(p => ({...p, min_stock: Number(e.target.value)}))} className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onFinished}>Batal</Button>
        <Button onClick={handleSubmit}>{editingStock ? 'Simpan Perubahan' : 'Tambah Bahan'}</Button>
      </DialogFooter>
    </>
  );
}


export default function Ingredients() {
  const { stocks, isLoading, updateStock, profile } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  
  const canEditDetails = profile?.role?.toUpperCase() === 'MANAGER';

  if (isLoading || !profile) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"><Skeleton className="h-10 w-64" /><Skeleton className="h-10 w-32" /></div>
        <Card><CardHeader><Skeleton className="h-8 w-40" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
      </div>
    );
  }

  const ingredients = stocks.filter((s) => s.type === 'BAHAN');

  const handleUpdateStock = (item: StockItem, newStock: number) => {
    if (newStock < 0) return;
    updateStock(item.id, { current_stock: newStock });
    toast({
        title: "Stok Diperbarui",
        description: `Stok ${item.name} sekarang adalah ${newStock} ${item.unit}.`
    });
  }

  const handleAddStock = (item: StockItem, amountToAdd: number) => {
    const newStock = (item.current_stock || 0) + amountToAdd;
    handleUpdateStock(item, newStock);
  }

  const handleAdjustStock = (item: StockItem, adjustment: number) => {
    const newStock = (item.current_stock || 0) + adjustment;
    handleUpdateStock(item, newStock);
  }

  const handleOpenEditDialog = (stock: StockItem | null) => {
    setEditingStock(stock);
    setIsFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manajemen Bahan</h1>
        {canEditDetails && (
          <Button onClick={() => handleOpenEditDialog(null)}><Plus className="mr-2 h-4 w-4" /> Tambah Bahan Baru</Button>
        )}
      </div>
      
      {/* --- PERBAIKAN: Dialog untuk Tambah/Edit Detail Bahan --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStock ? 'Edit Detail Bahan' : 'Tambah Bahan Baru'}</DialogTitle>
            <DialogDescription>
              {editingStock ? `Mengubah detail untuk ${editingStock.name}.` : 'Lengkapi detail bahan baku baru.'}
            </DialogDescription>
          </DialogHeader>
          <IngredientForm editingStock={editingStock} onFinished={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardHeader><CardTitle>Daftar Bahan & Stok</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left">Nama Bahan</th>
                  <th className="p-3 text-left">Kategori</th>
                  <th className="p-3 text-left">Stok Saat Ini</th>
                  <th className="p-3 text-left w-[300px]">Aksi Cepat</th>
                  {canEditDetails && <th className="p-3 text-left">Aksi Detail</th>}
                </tr>
              </thead>
              <tbody>
                {ingredients.map((bahan) => (
                  <tr key={bahan.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{bahan.name}</td>
                    <td className="p-3 text-muted-foreground">{bahan.category}</td>
                    <td className="p-3 group">
                        <EditStockPopover item={bahan} onUpdate={(newStock) => handleUpdateStock(bahan, newStock)} />
                        <span className='text-sm font-normal text-muted-foreground'>{bahan.unit}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                          <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => handleAdjustStock(bahan, -1)}><Minus className="h-4 w-4" /></Button>
                          <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => handleAdjustStock(bahan, 1)}><Plus className="h-4 w-4" /></Button>
                          <AddStockPopover item={bahan} onAdd={(amount) => handleAddStock(bahan, amount)} />
                      </div>
                    </td>
                    {canEditDetails && (
                        <td className="p-3">
                            <Button size="sm" variant="outline" onClick={() => handleOpenEditDialog(bahan)}>
                                <Pencil className="mr-2 h-3 w-3"/>
                                Edit Detail
                            </Button>
                        </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}