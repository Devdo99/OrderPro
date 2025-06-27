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
import { Loader2, PlusCircle, Trash2, ArrowLeft, Save, Info } from 'lucide-react';
import { BoxOrderItem } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Json } from '@/integrations/supabase/types'; // Import tipe Json

export default function BoxOrderForm() {
  const { stocks } = useApp();
  const navigate = useNavigate();
  const products = stocks.filter(s => s.type === 'PRODUK');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'lunas' | 'dp' | 'belum_bayar'>('belum_bayar');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'lainnya'>('cash');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [items, setItems] = useState<BoxOrderItem[]>([]);
  const [currentItemProductId, setCurrentItemProductId] = useState<string>('');
  const [currentItemQuantity, setCurrentItemQuantity] = useState<number>(1);

  const handleConfirmAndAddItem = () => {
    if (!currentItemProductId || currentItemQuantity <= 0) {
      toast({
        title: "Pilihan Tidak Lengkap",
        description: "Silakan pilih produk dan tentukan jumlah yang valid.",
        variant: "destructive",
      });
      return;
    }
    
    const selectedProduct = products.find(p => p.id === currentItemProductId);
    if (!selectedProduct) return;

    const newItem: BoxOrderItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: currentItemQuantity,
    };

    setItems([...items, newItem]);
    setCurrentItemProductId('');
    setCurrentItemQuantity(1);
    toast({
        title: "Item Ditambahkan",
        description: `${newItem.quantity}x ${newItem.productName} berhasil ditambahkan ke daftar.`,
    })
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !pickupDate || items.length === 0) {
        toast({ variant: "destructive", title: "Data tidak lengkap!", description: "Pastikan nama pelanggan, tanggal ambil, dan minimal satu item pesanan telah ditambahkan." });
        return;
    }
    setIsSaving(true);
    const pickupDateISO = new Date(pickupDate).toISOString();

    const payload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      // PERBAIKAN: Secara eksplisit mengubah tipe `items` menjadi Json
      items: items as unknown as Json,
      order_date: new Date().toISOString(),
      pickup_date: pickupDateISO,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      status: 'Baru' as const,
      notes,
    };

    const { error } = await supabase.from('box_orders').insert(payload);
    
    setIsSaving(false);
    if (error) {
       toast({ variant: "destructive", title: "Gagal menyimpan!", description: error.message });
    } else {
       toast({ title: "Sukses!", description: "Pesanan nasi kotak berhasil disimpan." });
       navigate('/box-orders');
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
                <CardDescription>Tambahkan produk satu per satu ke dalam pesanan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-secondary space-y-3">
                  <h4 className="font-medium text-lg">Form Tambah Item</h4>
                  <div className="flex flex-col sm:flex-row items-end gap-2">
                      <div className="flex-1 w-full">
                          <Label htmlFor="product-select">Pilih Produk</Label>
                          <Select value={currentItemProductId} onValueChange={setCurrentItemProductId}>
                              <SelectTrigger id="product-select"><SelectValue placeholder="Pilih Produk..."/></SelectTrigger>
                              <SelectContent>
                                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="w-full sm:w-28">
                          <Label htmlFor="quantity-input">Jumlah</Label>
                          <Input 
                              id="quantity-input"
                              type="number" 
                              value={currentItemQuantity} 
                              onChange={(e) => setCurrentItemQuantity(parseInt(e.target.value) || 1)}
                              min="1"
                          />
                      </div>
                      <Button type="button" onClick={handleConfirmAndAddItem} className="w-full sm:w-auto">
                          <PlusCircle className="mr-2 h-4 w-4" /> Konfirmasi & Tambah
                      </Button>
                  </div>
              </div>
              
              <div className="space-y-2">
                  <Label className="text-base">Item yang Sudah Ditambahkan</Label>
                  {items.length === 0 ? (
                      <div className="text-center text-muted-foreground py-6 border-2 border-dashed rounded-lg">
                          <p>Belum ada item ditambahkan ke pesanan ini.</p>
                      </div>
                  ) : (
                      <div className="space-y-2 border rounded-md p-2">
                          {items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-background rounded-md shadow-sm">
                                  <div>
                                      <p className="font-semibold">{item.productName}</p>
                                      <p className="text-sm text-muted-foreground">Jumlah: {item.quantity}</p>
                                  </div>
                                  <Button type="button" size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveItem(index)}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
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