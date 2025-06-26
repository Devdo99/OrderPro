// src/utils/printerUtils.ts

import { Order, AppSettings } from '@/types';

const ESC = '\x1B'; 
const GS = '\x1D';  

const INIT_PRINTER = ESC + '@';       
const BOLD_ON = ESC + 'E' + '\x01';    
const BOLD_OFF = ESC + 'E' + '\x00';   
const ALIGN_CENTER = ESC + 'a' + '\x01'; 
const ALIGN_LEFT = ESC + 'a' + '\x00';   
const PAPER_CUT = GS + 'V' + '\x01';   
const DOUBLE_STRIKE_ON = ESC + 'G' + '\x01'; 
const DOUBLE_STRIKE_OFF = ESC + 'G' + '\x00';
const LARGE_TEXT_ON = GS + '!' + '\x11'; 
const LARGE_TEXT_OFF = GS + '!' + '\x00';

export async function generateReceiptBytes(order: Order, settings: AppSettings): Promise<Uint8Array> {
  const paperWidth = settings.paperSize === '58mm' ? 32 : 48;
  const separator = '-'.repeat(paperWidth) + '\n';

  let receiptText = '';

  receiptText += ALIGN_CENTER;
  receiptText += DOUBLE_STRIKE_ON + '=== STRUK ORDER ===\n' + DOUBLE_STRIKE_OFF;
  receiptText += BOLD_ON + settings.restaurantName + BOLD_OFF + '\n\n';
  
  receiptText += ALIGN_LEFT;
  receiptText += `Order #: ${order.orderNumber}\n`;
  receiptText += `Waktu: ${new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}\n`;
  receiptText += `Kasir: ${order.staffName || 'N/A'}\n`;
  if (order.customer) receiptText += `Pelanggan: ${order.customer}\n`;
  receiptText += separator;

  receiptText += ALIGN_CENTER;
  receiptText += BOLD_ON + `${order.orderType?.toUpperCase() || 'DINE IN'}\n` + BOLD_OFF;
  if (order.tableNumber) {
      receiptText += LARGE_TEXT_ON + `MEJA: ${order.tableNumber.toUpperCase()}\n` + LARGE_TEXT_OFF;
  }
  receiptText += ALIGN_LEFT; 
  receiptText += separator;

  receiptText += ALIGN_CENTER + BOLD_ON + '--- DAFTAR ITEM ---\n' + BOLD_OFF + ALIGN_LEFT;
  order.items.forEach(item => {
    receiptText += `${item.quantity}x ${item.stockName}`;
    if (item.variantName) {
        receiptText += ` (${item.variantName})`;
    }
    receiptText += '\n';
    if(item.notes) receiptText += `   > Catatan: ${item.notes}\n`;
  });
  receiptText += separator;

  if (order.notes) {
      receiptText += BOLD_ON + 'Catatan Pesanan:\n' + BOLD_OFF + order.notes + '\n' + separator;
  }

  receiptText += ALIGN_CENTER;
  
  if (settings.receiptFooter && settings.receiptFooter.trim() !== '') {
    receiptText += settings.receiptFooter + '\n\n';
  }

  receiptText += BOLD_ON + '*** BUKAN BUKTI PEMBAYARAN ***\n\n' + BOLD_OFF;
  
  const fullReceiptCommands = INIT_PRINTER + receiptText + PAPER_CUT;
  const encoder = new TextEncoder();
  return encoder.encode(fullReceiptCommands);
}