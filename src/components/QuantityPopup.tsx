// src/components/QuantityPopup.tsx

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { StockItem } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile'; // <-- Import hook deteksi mobile

interface QuantityPopupProps {
  isOpen: boolean;
  onClose: () => void;
  stock: StockItem | null;
  onAddToCart: (quantity: number, itemNotes?: string, variantName?: string) => void;
}

function QuantityPopupContent({ stock, onAddToCart, onClose }: Omit<QuantityPopupProps, 'isOpen'>) {
    const { getProducibleQuantity } = useApp();
    const [quantity, setQuantity] = useState(1);
    const [itemNotes, setItemNotes] = useState('');
    const [selectedVariant, setSelectedVariant] = useState<string>('');
    
    useEffect(() => {
        if (stock) {
            setQuantity(1);
            setItemNotes('');
            setSelectedVariant(stock.variants && stock.variants.length > 0 ? stock.variants[0].name : '');
        }
    }, [stock]);

    if (!stock) return null;

    const handleSubmit = () => {
        onAddToCart(quantity, itemNotes || undefined, selectedVariant || undefined);
    };

    const maxQuantity = getProducibleQuantity(stock.id);

    return (
        <>
            <div className="space-y-6 pt-4 p-4 md:p-0">
                <div className="text-center">
                    <h3 className="text-xl font-semibold">{stock.name}</h3>
                    <p className="text-gray-500">{stock.category}</p>
                    <p className="text-gray-600 mt-2">
                        Stok dapat dibuat: ~{maxQuantity} {stock.unit}
                    </p>
                </div>

                <div className="space-y-4">
                    {stock.variants && stock.variants.length > 0 && (
                        <div>
                            <Label htmlFor="itemVariant">Pilih Varian</Label>
                            <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                                <SelectTrigger id="itemVariant">
                                    <SelectValue placeholder="Pilih Varian..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {stock.variants.map(variant => (
                                        <SelectItem key={variant.name} value={variant.name}>
                                            {variant.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div>
                        <Label>Jumlah Pesanan</Label>
                        <div className="flex items-center gap-4 mt-2">
                            <Button size="lg" variant="outline" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="h-12 w-12 p-0"><Minus className="h-5 w-5" /></Button>
                            <Input type="number" value={quantity} onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))} className="text-center text-xl h-12 flex-1" min={1} max={maxQuantity} />
                            <Button size="lg" variant="outline" onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))} disabled={quantity >= maxQuantity} className="h-12 w-12 p-0"><Plus className="h-5 w-5" /></Button>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="itemNotes">Catatan untuk Item Ini (Opsional)</Label>
                        <Textarea id="itemNotes" value={itemNotes} onChange={(e) => setItemNotes(e.target.value)} placeholder="Contoh: jangan pedas..."/>
                    </div>
                </div>
            </div>
            {/* Tombol Aksi untuk Drawer (Mobile) */}
            <DrawerFooter className="pt-4 flex-row gap-3 md:hidden">
                <DrawerClose asChild>
                    <Button variant="outline" className="flex-1 h-12">Batal</Button>
                </DrawerClose>
                <Button onClick={handleSubmit} className="flex-1 h-12 text-lg" disabled={maxQuantity === 0}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Tambah ({quantity})
                </Button>
            </DrawerFooter>
             {/* Tombol Aksi untuk Dialog (Desktop) */}
            <div className="hidden md:flex gap-3 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1 h-12">Batal</Button>
                <Button onClick={handleSubmit} className="flex-1 h-12 text-lg" disabled={maxQuantity === 0}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Tambah ({quantity})
                </Button>
            </div>
        </>
    );
}


export default function QuantityPopup(props: QuantityPopupProps) {
  const isMobile = useIsMobile();

  if (!props.isOpen || !props.stock) {
    return null;
  }

  if (isMobile) {
    return (
      <Drawer open={props.isOpen} onOpenChange={props.onClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Tambah ke Keranjang
            </DrawerTitle>
          </DrawerHeader>
          <QuantityPopupContent {...props} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Tambah ke Keranjang
          </DialogTitle>
        </DialogHeader>
        <QuantityPopupContent {...props} />
      </DialogContent>
    </Dialog>
  );
}