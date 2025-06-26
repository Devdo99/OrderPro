// src/components/OrderSummary.tsx

import { OrderItem } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface OrderSummaryProps {
  cart: OrderItem[];
  staffList: string[];
  defaultStaffName: string;
  preselectedTable?: string;
  onSubmitOrder: (customer?: string, tableNumber?: string, selectedStaff?: string, orderNotes?: string) => void;
  onUpdateQuantity: (stockId: string, quantity: number, variantName?: string) => void;
  isFullScreen?: boolean;
}

export default function OrderSummary({
  cart, staffList, defaultStaffName, preselectedTable, onSubmitOrder, onUpdateQuantity, isFullScreen = false
}: OrderSummaryProps) {
  const { settings } = useApp();
  const [customer, setCustomer] = useState('');
  const [tableNumber, setTableNumber] = useState(preselectedTable || 'no-table');
  const [selectedStaff, setSelectedStaff] = useState(defaultStaffName);
  const [orderNotes, setOrderNotes] = useState('');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = () => {
    onSubmitOrder(customer || undefined, preselectedTable || (tableNumber === 'no-table' ? undefined : tableNumber), selectedStaff, orderNotes || undefined);
  };
  
  return (
    <Card className={`flex flex-col ${isFullScreen ? 'h-full' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Ringkasan Pesanan
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden p-4">
        <div className="space-y-3">
          <Label>Staff</Label>
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>{staffList.map(staff => <SelectItem key={staff} value={staff}>{staff}</SelectItem>)}</SelectContent>
          </Select>
          <Label>Nama Pelanggan (Opsional)</Label>
          <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Nama pelanggan..."/>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto border-t border-b py-2">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Keranjang kosong</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  {/* --- PERUBAHAN DI SINI: Menampilkan nama varian --- */}
                  <p className="font-medium text-sm">
                    {item.stockName}
                    {item.variantName && <span className="text-orange-600 ml-1">({item.variantName})</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdateQuantity(item.stockId, item.quantity - 1, item.variantName)}><Minus className="h-3 w-3" /></Button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdateQuantity(item.stockId, item.quantity + 1, item.variantName)}><Plus className="h-3 w-3" /></Button>
                </div>
                 <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => onUpdateQuantity(item.stockId, 0, item.variantName)}><Trash2 className="h-4 w-4"/></Button>
              </div>
            ))
          )}
        </div>
        <div className="space-y-2 pt-2">
            <Button onClick={handleSubmit} disabled={cart.length === 0} className="w-full h-12 text-base">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Simpan Pesanan ({totalItems} item)
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}