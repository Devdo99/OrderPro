// src/components/OrderTypeSelection.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, ShoppingBag } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface OrderTypeSelectionProps {
  onSelect: (orderType: string) => void;
}

export default function OrderTypeSelection({ onSelect }: OrderTypeSelectionProps) {
  const { settings } = useApp();
  const orderTypes = settings.orderTypes || ['Dine In', 'Take Away'];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Buat Pesanan Baru</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-center text-muted-foreground">Pilih jenis pesanan untuk memulai.</p>
          {orderTypes.map(type => (
            <Button
              key={type}
              onClick={() => onSelect(type)}
              className="h-16 text-lg"
            >
              {type.toLowerCase().includes('dine') ? 
                <Utensils className="mr-4 h-6 w-6" /> : 
                <ShoppingBag className="mr-4 h-6 w-6" />
              }
              {type}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}