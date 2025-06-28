// src/components/CartPage.tsx

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, ArrowLeft, MessageSquare } from 'lucide-react';
import { OrderItem } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import ItemNotesDialog from './ItemNotesDialog';
import CustomerStaffDialog from './CustomerStaffDialog';

interface CartPageProps {
  cart: OrderItem[];
  preselectedTable?: string;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onUpdateItemNotes: (cartItemId: string, notes: string) => void;
  onSubmitOrderWithDetails: (orderDetails: {
    customer?: string;
    selectedStaff: string;
    orderNotes?: string;
    orderType: string;
  }) => void;
  onBack: () => void;
}

export default function CartPage({
  cart,
  preselectedTable,
  onUpdateQuantity,
  onUpdateItemNotes,
  onSubmitOrderWithDetails,
  onBack
}: CartPageProps) {
  const { getProducibleQuantity } = useApp();
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = () => {
    if (cart.length === 0) {
      toast({ title: 'Keranjang Kosong', variant: 'destructive' });
      return;
    }
    // Menampilkan dialog data pelanggan sebagai langkah terakhir
    setIsCustomerDialogOpen(true);
  };
  
  const handleFinalSubmit = (data: {
    customer?: string;
    selectedStaff: string;
    orderNotes?: string;
    orderType: string;
  }) => {
    onSubmitOrderWithDetails(data);
    setIsCustomerDialogOpen(false);
  }

  return (
    <>
      <CustomerStaffDialog 
        isOpen={isCustomerDialogOpen}
        onClose={() => setIsCustomerDialogOpen(false)}
        onSubmit={handleFinalSubmit}
        tableNumber={preselectedTable}
      />
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-white shadow-sm border-b p-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Keranjang Belanja ({totalItems} item)
              </h1>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 py-4">
          {cart.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Keranjang masih kosong</p>
                <Button onClick={onBack} className="mt-4">
                  Kembali ke Menu
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => {
                const maxQuantity = getProducibleQuantity(item.stockId);
                return (
                <Card key={item.id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">
                            {item.stockName}
                            {item.variantName && <span className="text-base text-orange-600 ml-2">({item.variantName})</span>}
                          </h3>
                          <p className="text-sm text-gray-600">{item.unit}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= maxQuantity}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <ItemNotesDialog
                            itemName={item.stockName}
                            notes={item.notes || ''}
                            onNotesChange={(notes) => onUpdateItemNotes(item.id, notes)}
                          />
                        </div>
                      </div>

                      {item.notes && (
                        <div className="bg-blue-50 p-2 rounded border-l-4 border-blue-200">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-xs text-blue-600 font-medium">Catatan Item:</p>
                              <p className="text-sm text-blue-800">{item.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="bg-white border-t p-4 shrink-0">
            <Button 
              onClick={handleSubmit}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Proses Pesanan ({totalItems} item)
            </Button>
          </div>
        )}
      </div>
    </>
  );
}