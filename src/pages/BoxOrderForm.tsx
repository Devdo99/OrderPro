// src/pages/BoxOrderForm.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, Trash2, ArrowLeft, Save } from 'lucide-react';
import { BoxOrderItem } from '@/types';
import { useApp } from '@/contexts/AppContext';

export default function BoxOrderForm() {
  const { stocks } = useApp();
  const navigate = useNavigate();
  const products = stocks.filter(s => s.type === 'PRODUK');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<BoxOrderItem[]>([{ productId: '', productName: '', quantity: 1 }]);
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
        toast({ variant: "destructive", title: "Data tidak lengkap!", description: "Pastikan nama pelanggan, tanggal ambil, dan item pesanan telah diisi." });
        return;
    }
    setIsSaving(true);

    const { error } = await supabase.from('box_orders').insert({
      customer_name: customerName,
      customer_phone: customerPhone,
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
       navigate('/box-orders'); // Kembali ke daftar pesanan setelah sukses
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Form Pesanan Nasi Kotak</h1>
          <p className="text-muted-foreground">Isi detail pesanan di bawah ini.</p>
        </div>
        <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/box-orders')}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan Pesanan
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Detail Pesanan</CardTitle>
                <CardDescription>Produk apa saja yang dipesan oleh pelanggan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <PlusCircle className="mr-2 h-4 w-4" /> Tambah Item Lainnya
                </Button>
            </CardContent>
        </Card>

        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Informasi Pelanggan</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="customerName">Nama Pelanggan</Label>
                        <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="customerPhone">No. Telepon</Label>
                        <Input id="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Pengambilan & Pembayaran</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="pickupDate">Tanggal Pengambilan</Label>
                        <Input id="pickupDate" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required/>
                    </div>
                    <div>
                        <Label htmlFor="paymentStatus">Status Bayar</Label>
                        <Select onValueChange={(value: any) => setPaymentStatus(value)} value={paymentStatus}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                                <SelectItem value="dp">DP</SelectItem>
                                <SelectItem value="lunas">Lunas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
       <Card>
            <CardHeader><CardTitle>Catatan Tambahan</CardTitle></CardHeader>
            <CardContent>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Contoh: Sambal dipisah, ekstra kerupuk untuk semua pesanan..."/>
            </CardContent>
        </Card>
    </form>
  );
}