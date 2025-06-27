// src/components/BoxOrderReceipt.tsx

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BoxOrder } from "@/types";
import { useApp } from '@/contexts/AppContext';
import { Printer, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface BoxOrderReceiptProps {
  order: BoxOrder | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BoxOrderReceipt({ order, isOpen, onOpenChange }: BoxOrderReceiptProps) {
  const { settings, printBoxOrderReceipt } = useApp();
  const [isPrinting, setIsPrinting] = useState(false);
  const [receiptText, setReceiptText] = useState('');

  useEffect(() => {
    // PERBAIKAN: Memastikan semua bagian struk dibuat meskipun ada data yang tidak valid
    if (order && settings) {
      const paperWidth = settings.paperSize === '58mm' ? 32 : 48;
      const separator = '-'.repeat(paperWidth);
      const centered = (str: string) => (' '.repeat(Math.max(0, Math.floor((paperWidth - str.length) / 2))) + str);

      let text = '';
      text += `${centered(settings.restaurantName)}\n`;
      text += `${centered('TANDA TERIMA PESANAN KOTAK')}\n`;
      text += `${separator}\n`;
      text += `No Pesanan: #${order.id.substring(0, 8).toUpperCase()}\n`;
      text += `Pelanggan : ${order.customer_name}\n`;
      if (order.customer_phone) {
        text += `Telepon   : ${order.customer_phone}\n`;
      }

      // PERBAIKAN: Parsing tanggal yang lebih aman
      let pickupDateFormatted = 'Tanggal tidak valid';
      try {
          // Memastikan tanggal yang masuk adalah objek Date yang valid
          const date = new Date(order.pickup_date);
          if (!isNaN(date.getTime())) {
            pickupDateFormatted = format(date, 'dd MMM yyyy, HH:mm', { locale: id });
          }
      } catch (e) {
          console.error("Invalid pickup_date for receipt preview:", order.pickup_date, e);
      }
      text += `Tgl Ambil  : ${pickupDateFormatted}\n`;

      text += `${separator}\n`;
      text += `Detail Pesanan:\n`;
      
      // PERBAIKAN: Pengecekan yang lebih aman sebelum iterasi
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item && item.quantity && item.productName) {
            text += `${item.quantity} x ${item.productName}\n`;
          }
        });
      } else {
        text += `(Tidak ada detail item)\n`;
      }

      text += `\n${separator}\n`;
      text += `Status     : ${order.status}\n`;
      text += `Pembayaran : ${order.payment_status} (${order.payment_method})\n`;
      text += `${separator}\n`;
      text += `Catatan:\n`;
      text += `${order.notes || 'Tidak ada catatan.'}\n\n`;
      text += `${centered('Terima Kasih!')}\n`;
      setReceiptText(text);
    } else {
        setReceiptText(''); // Kosongkan struk jika tidak ada data order
    }
  }, [order, settings]);

  const handlePrint = async () => {
    if (!order) return;
    setIsPrinting(true);
    await printBoxOrderReceipt(order);
    setIsPrinting(false);
    onOpenChange(false);
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tanda Terima Pesanan</DialogTitle>
          <DialogDescription>
            Tanda terima untuk pesanan a.n. {order.customer_name}.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-gray-100 p-4 rounded-md my-4 max-h-96 overflow-y-auto">
            <pre className="font-mono text-xs text-black whitespace-pre-wrap">
                {receiptText}
            </pre>
        </div>
        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
            <Button onClick={handlePrint} disabled={isPrinting}>
                {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                Cetak
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}