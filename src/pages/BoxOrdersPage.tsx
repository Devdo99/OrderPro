// src/pages/BoxOrdersPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Impor useNavigate
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BoxOrder } from '@/types';
import { BoxOrderList } from '@/components/BoxOrderList';
import { useToast } from '@/components/ui/use-toast';

export default function BoxOrdersPage() {
  const [orders, setOrders] = useState<BoxOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // <-- Inisialisasi hook navigasi
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('box_orders')
      .select('*')
      .order('pickup_date', { ascending: true });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal mengambil data pesanan',
        description: error.message,
      });
    } else {
      setOrders(data as BoxOrder[]);
    }
    setIsLoading(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">Pesanan Nasi Kotak</h1>
            <p className="text-muted-foreground">Kelola semua pesanan katering atau dalam jumlah besar.</p>
        </div>
        {/* Ubah tombol ini agar menavigasi ke halaman baru */}
        <Button onClick={() => navigate('/box-orders/new')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pesanan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <BoxOrderList orders={orders} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}