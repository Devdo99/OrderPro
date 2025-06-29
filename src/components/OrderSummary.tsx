// src/components/OrderSummary.tsx

import { OrderItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus, Minus, Trash2, Eraser, Save } from 'lucide-react'; // <-- PERBAIKAN: Menambahkan Save
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from './ui/textarea';

// ... (sisa kode tetap sama)
interface OrderSummaryProps {
    cart: OrderItem[];
    onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
    onSubmitOrder: () => void;
    onClearOrder: () => void;
    staffList: string[];
    defaultStaffName: string;
    onStaffChange: (staff: string) => void;
    customer: string;
    onCustomerChange: (name: string) => void;
    tableNumber: string;
    onTableNumberChange: (table: string) => void;
    orderNotes: string;
    onOrderNotesChange: (notes: string) => void;
  }
  
  export default function OrderSummary({
    cart,
    onUpdateQuantity,
    onSubmitOrder,
    onClearOrder,
    staffList,
    defaultStaffName,
    onStaffChange,
    customer,
    onCustomerChange,
    tableNumber,
    onTableNumberChange,
    orderNotes,
    onOrderNotesChange,
  }: OrderSummaryProps) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
    return (
      <Card className="flex flex-col h-full rounded-none border-l">
        <CardHeader>
          <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Pesanan Saat Ini
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClearOrder}>
                  <Eraser className="mr-2 h-4 w-4" />
                  Kosongkan
              </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 pt-0 gap-4 overflow-hidden">
          
          {/* Detail Pelanggan & Meja */}
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <Label>Nama Pelanggan</Label>
                  <Input value={customer} onChange={(e) => onCustomerChange(e.target.value)} placeholder="(Opsional)"/>
              </div>
               <div>
                  <Label>Nomor Meja</Label>
                  <Input value={tableNumber} onChange={(e) => onTableNumberChange(e.target.value)} placeholder="(Opsional)"/>
              </div>
          </div>
  
          {/* Daftar Item */}
          <ScrollArea className="flex-1 border rounded-md">
              <div className='p-2 space-y-2'>
                  {cart.length === 0 ? (
                      <div className="text-center text-muted-foreground p-8">
                      <p>Keranjang kosong.</p>
                      <p className="text-sm">Klik item di sebelah kiri untuk memulai.</p>
                      </div>
                  ) : (
                      cart.map(item => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-secondary rounded">
                          <div className="flex-1">
                          <p className="font-medium text-sm">
                              {item.stockName}
                              {item.variantName && <span className="text-orange-600 ml-1">({item.variantName})</span>}
                          </p>
                          </div>
                          <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                          </div>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onUpdateQuantity(item.id, 0)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                      ))
                  )}
              </div>
          </ScrollArea>
  
          {/* Staff & Catatan */}
          <div className='space-y-4'>
              <div>
                  <Label>Staff Bertugas</Label>
                  <Select value={defaultStaffName} onValueChange={onStaffChange}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>{staffList.map(staff => <SelectItem key={staff} value={staff}>{staff}</SelectItem>)}</SelectContent>
                  </Select>
              </div>
              <div>
                   <Label>Catatan Pesanan</Label>
                   <Textarea value={orderNotes} onChange={(e) => onOrderNotesChange(e.target.value)} placeholder="Contoh: jangan pakai MSG..."/>
              </div>
          </div>
  
          {/* Tombol Simpan */}
          <div className="mt-auto">
              <Button onClick={onSubmitOrder} disabled={cart.length === 0} className="w-full h-12 text-base">
                  <Save className="mr-2 h-5 w-5" />
                  Simpan Pesanan ({totalItems} item)
              </Button>
          </div>
        </CardContent>
      </Card>
    );
  }