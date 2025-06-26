// src/components/OrderTypeSelection.tsx

import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Utensils, ShoppingBag, Truck, Package } from 'lucide-react';
import { Loader2 } from 'lucide-react'; // Import loader

interface OrderTypeSelectionProps {
  onSelect: (orderType: string) => void;
}

const getIconForOrderType = (orderType: string) => {
  const lowerCaseType = orderType.toLowerCase();
  if (lowerCaseType.includes('dine in') || lowerCaseType.includes('makan di tempat')) {
    return <Utensils className="h-8 w-8" />;
  }
  if (lowerCaseType.includes('take away') || lowerCaseType.includes('bawa pulang')) {
    return <ShoppingBag className="h-8 w-8" />;
  }
  if (lowerCaseType.includes('delivery') || lowerCaseType.includes('pesan antar')) {
    return <Truck className="h-8 w-8" />;
  }
  if (lowerCaseType.includes('paket') || lowerCaseType.includes('package')) {
    return <Package className="h-8 w-8" />;
  }
  return <Utensils className="h-8 w-8" />;
};

export default function OrderTypeSelection({ onSelect }: OrderTypeSelectionProps) {
  // --- PERBAIKAN DI SINI ---
  // 1. Ambil seluruh konteks terlebih dahulu
  const appContext = useApp();

  // 2. Tambahkan "penjaga". Jika konteks belum siap, tampilkan loader.
  if (!appContext) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Memuat konteks aplikasi...</p>
      </div>
    );
  }

  // 3. Setelah aman, baru lakukan destructuring
  const { settings } = appContext;
  const orderTypes = settings.orderTypes?.filter(type => type && type.trim() !== '') || ['Dine In', 'Take Away'];

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Buat Pesanan Baru</h1>
        <p className="text-gray-600 mt-2">Silakan pilih jenis pesanan untuk memulai.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
        {orderTypes.map((type) => (
          <Card
            key={type}
            className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-primary hover:-translate-y-2"
            onClick={() => onSelect(type)}
          >
            <CardContent className="p-8 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                {getIconForOrderType(type)}
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{type}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}