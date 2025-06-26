// src/components/ReceiptPreview.tsx

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Order } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Eye, Printer, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReceiptPreviewProps {
  order: Order;
}

// 1. Konten Struk menjadi komponen "dumb" yang hanya menerima data
// Tidak ada hooks (seperti useState atau useApp) di dalamnya.
const ReceiptView = ({ receiptText, paperSize, onPrint, isPrinting }: { receiptText: string, paperSize: '58mm' | '80mm', onPrint: () => void, isPrinting: boolean }) => (
  <div className="p-4 flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4">
          <div 
            className="bg-white p-4 border rounded-md"
            style={{ minWidth: paperSize === '58mm' ? '280px' : '380px' }}
          >
            <pre style={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '12px', whiteSpace: 'pre-wrap', wordWrap: 'break-word', margin: 0, color: 'black' }}>
              {receiptText}
            </pre>
          </div>
      </ScrollArea>
      <div className="mt-4 flex-shrink-0">
          <Button onClick={onPrint} className="w-full" disabled={isPrinting}>
              {isPrinting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mencetak...</>
              ) : (
                  <><Printer className="h-4 w-4 mr-2" /> Cetak Struk</>
              )}
          </Button>
      </div>
  </div>
);


// 2. Komponen Utama mengelola semua state dan logika
export default function ReceiptPreview({ order }: ReceiptPreviewProps) {
  const { printReceipt, settings } = useApp();
  const [open, setOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const isMobile = useIsMobile();

  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    await printReceipt(order);
    setIsPrinting(false);
    setOpen(false);
  };

  // Logika pembuatan teks struk tetap di sini, menggunakan useMemo untuk efisiensi
  const receiptText = useMemo(() => {
    if (!settings) return '';
    const charCount = settings.paperSize === '58mm' ? 32 : 48;
    const separator = '-'.repeat(charCount) + '\n';
    let text = '';
    const centered = (str: string) => (' '.repeat(Math.max(0, Math.floor((charCount - str.length) / 2))) + str + '\n');
    text += centered('=== STRUK ORDER ===');
    text += centered(settings.restaurantName);
    text += '\n';
    text += `Order #: ${order.orderNumber}\n`;
    text += `Waktu: ${new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}\n`;
    text += `Kasir: ${order.staffName || 'N/A'}\n`;
    if (order.customer) text += `Pelanggan: ${order.customer}\n`;
    text += separator;
    text += centered(`${order.orderType?.toUpperCase() || 'DINE IN'}`);
    if (order.tableNumber) text += `\n${centered(`MEJA: ${order.tableNumber.toUpperCase()}`)}\n`;
    text += separator;
    text += centered('--- DAFTAR ITEM ---');
    order.items.forEach(item => {
        text += `${item.quantity}x ${item.stockName}`;
        if (item.variantName) text += ` (${item.variantName})`;
        text += '\n';
        if (item.notes) text += `   > Catatan: ${item.notes}\n`;
    });
    text += separator;
    if (order.notes) text += `Catatan Pesanan:\n${order.notes}\n` + separator;
    text += '\n' + centered('*** BUKAN BUKTI PEMBAYARAN ***');
    return text;
  }, [order, settings]);

  if (!settings) return null;

  const triggerButton = (
    <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => setOpen(true)}>
      <Eye className="h-4 w-4 mr-1" />
      Preview
    </Button>
  );

  const contentProps = {
    receiptText,
    paperSize: settings.paperSize,
    onPrint: handlePrint,
    isPrinting,
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent className="h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>Preview Struk Order</DrawerTitle>
            <DrawerDescription>Tampilan struk yang akan dicetak.</DrawerDescription>
          </DrawerHeader>
          <ReceiptView {...contentProps} />
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Tutup</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Preview Struk Order</DialogTitle>
          <DialogDescription>
            Ini adalah tampilan struk yang akan dicetak untuk dapur atau bar.
          </DialogDescription>
        </DialogHeader>
        <ReceiptView {...contentProps} />
      </DialogContent>
    </Dialog>
  );
}