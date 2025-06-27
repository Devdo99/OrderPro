// src/pages/BoxOrdersPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BoxOrder } from '@/types';
import { BoxOrderList } from '@/components/BoxOrderList';
import { useToast } from '@/components/ui/use-toast';

// PERBAIKAN: Fungsi untuk memvalidasi dan membersihkan data dari database
const mapSupabaseDataToBoxOrder = (data: any[]): BoxOrder[] => {
    return data.map(order => ({
        ...order,
        // Ini adalah bagian terpenting: memastikan `items` selalu array.
        // Jika `items` dari database null, undefined, atau bukan array,
        // maka akan diubah menjadi array kosong [].
        items: Array.isArray(order.items) ? order.items : [],
    }));
};


export default function BoxOrdersPage() {
  const [orders, setOrders] = useState<BoxOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
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
      setOrders([]); // Set ke array kosong jika ada error
    } else if (data) {
      // PERBAIKAN: Gunakan fungsi mapping untuk membersihkan data
      const cleanData = mapSupabaseDataToBoxOrder(data);
      setOrders(cleanData);
    } else {
      setOrders([]); // Set ke array kosong jika tidak ada data
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