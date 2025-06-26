// src/components/CustomerManagement.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// --- PERBAIKAN ADA DI SINI ---
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { Users, Plus, Phone, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  orders: number;
}

export default function CustomerManagement() {
  const appContext = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // State lokal untuk data pelanggan, bisa diubah untuk mengambil dari database nanti
  const [customers, setCustomers] = useState<Customer[]>([
    { id: '1', name: 'Ahmad Wijaya', phone: '0812-3456-7890', address: 'Jl. Merdeka No. 123', orders: 5 },
    { id: '2', name: 'Siti Nurhaliza', phone: '0813-9876-5432', address: 'Jl. Sudirman No. 456', orders: 3 }
  ]);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  // Guard clause untuk menunggu context siap
  if (!appContext) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const { orders } = appContext;

  const handleAddCustomer = () => {
    if (!formData.name || !formData.phone) {
      toast({ title: 'Data Tidak Lengkap', description: 'Nama dan nomor telepon wajib diisi', variant: 'destructive' });
      return;
    }
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...formData,
      orders: 0
    };
    setCustomers(prev => [...prev, newCustomer]);
    setFormData({ name: '', phone: '', address: '' });
    setIsDialogOpen(false);
    toast({ title: 'Pelanggan Berhasil Ditambahkan' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manajemen Pelanggan
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pelanggan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
                <DialogDescription>Masukkan detail pelanggan untuk menyimpannya ke dalam sistem.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Nama Pelanggan *</Label>
                  <Input id="customerName" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Masukkan nama pelanggan" />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Nomor Telepon *</Label>
                  <Input id="customerPhone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="Contoh: 0812-3456-7890" />
                </div>
                <div>
                  <Label htmlFor="customerAddress">Alamat</Label>
                  <Input id="customerAddress" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="Alamat pelanggan (opsional)" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddCustomer} className="flex-1">Tambah</Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {customers.map((customer) => (
            <div key={customer.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="font-medium">{customer.name}</div>
                <div className="text-sm text-gray-600 flex items-center gap-4">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{customer.phone}</span>
                  {customer.address && (<span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{customer.address}</span>)}
                </div>
              </div>
              <div className="text-sm text-gray-500">{customer.orders} pesanan</div>
            </div>
          ))}
          {customers.length === 0 && (<div className="text-center py-8 text-gray-500">Belum ada data pelanggan</div>)}
        </div>
      </CardContent>
    </Card>
  );
}