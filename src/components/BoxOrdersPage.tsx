import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BoxOrder } from '@/types';
import { BoxOrderFormDialog } from '@/components/BoxOrderFormDialog';
import { BoxOrderList } from '@/components/BoxOrderList';
import { useToast } from '@/components/ui/use-toast';

export default function BoxOrdersPage() {
  const [orders, setOrders] = useState<BoxOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      setOrders(data as unknown as BoxOrder[]);
    }
    setIsLoading(false);
  };
  
  const handleSave = () => {
    fetchOrders(); // Refresh list setelah menyimpan
    setIsDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pesanan Nasi Kotak</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pesanan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan Mendatang</CardTitle>
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
      
      <BoxOrderFormDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
}