// src/components/BoxOrderFormDialog.tsx

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from './ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { BoxOrderItem } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface BoxOrderFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: () => void;
}

export function BoxOrderFormDialog({ isOpen, onOpenChange, onSave }: BoxOrderFormDialogProps) {
  const { stocks } = useApp();
  const products = stocks.filter(s => s.type === 'PRODUK');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState(''); // <-- STATE BARU
  const [items, setItems] = useState<BoxOrderItem[]>([]);
  const [pickupDate, setPickupDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'lunas' | 'dp' | 'belum_bayar'>('belum_bayar');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'lainnya'>('cash');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleAddItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1 }]);
  };

  const handleItemChange = (index: number, field: keyof BoxOrderItem, value: string | number) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index], [field]: value };
    
    if (field === 'productId') {
      const selectedProduct = products.find(p => p.id === value);
      currentItem.productName = selectedProduct?.name || '';
    }
    
    newItems[index] = currentItem;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !pickupDate || items.length === 0 || items.some(it => !it.productId || it.quantity <= 0)) {
        toast({ variant: "destructive", title: "Data tidak lengkap!", description: "Pastikan semua data pesanan, termasuk item produk, telah diisi dengan benar." });
        return;
    }
    setIsSaving(true);

    const { error } = await supabase.from('box_orders').insert({
      customer_name: customerName,
      customer_phone: customerPhone, // <-- KIRIM DATA BARU
      items: items as any,
      order_date: new Date().toISOString(),
      pickup_date: pickupDate,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      status: 'Baru',
      notes,
    });
    
    setIsSaving(false);
    if (error) {
       toast({ variant: "destructive", title: "Gagal menyimpan!", description: error.message });
    } else {
       toast({ title: "Sukses!", description: "Pesanan nasi kotak berhasil disimpan." });
       onSave();
       resetForm();
    }
  };
  
  const resetForm = () => {
      setCustomerName('');
      setCustomerPhone(''); // <-- RESET STATE BARU
      setItems([]);
      setPickupDate('');
      setPaymentStatus('belum_bayar');
      setPaymentMethod('cash');
      setNotes('');
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Form Pesanan Nasi Kotak</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Customer Details */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customerName" className="text-right">Nama</Label>
              <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customerPhone" className="text-right">No. Telepon</Label>
              <Input id="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pickupDate" className="text-right">Tgl. Ambil</Label>
                <Input id="pickupDate" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="col-span-3" required/>
            </div>

            {/* Item Details */}
            <div className="col-span-4">
              <Label>Detail Item Pesanan</Label>
              <div className="space-y-2 mt-2 p-3 border rounded-lg">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select value={item.productId} onValueChange={(value) => handleItemChange(index, 'productId', value)}>
                        <SelectTrigger><SelectValue placeholder="Pilih Produk..."/></SelectTrigger>
                        <SelectContent>
                            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} 
                      className="w-24" 
                      min="1"
                    />
                    <Button type="button" size="icon" variant="destructive" onClick={() => handleRemoveItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" className="w-full" onClick={handleAddItem}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Tambah Item
                </Button>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentStatus" className="text-right">Status Bayar</Label>
                 <Select onValueChange={(value: any) => setPaymentStatus(value)} value={paymentStatus}>
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                        <SelectItem value="dp">DP</SelectItem>
                        <SelectItem value="lunas">Lunas</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentMethod" className="text-right">Pembayaran</Label>
                 <Select onValueChange={(value: any) => setPaymentMethod(value)} value={paymentMethod}>
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">Keterangan</Label>
                <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} className="col-span-3" placeholder="Contoh: Sambal dipisah, ekstra kerupuk..."/>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Pesanan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}