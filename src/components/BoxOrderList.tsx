// src/components/BoxOrderList.tsx

import { useState } from 'react';
import { BoxOrder } from "@/types";
import { useApp } from '@/contexts/AppContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Printer, MoreHorizontal, Package, Phone } from 'lucide-react'; // <-- TAMBAHKAN IKON PHONE
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BoxOrderReceipt } from './BoxOrderReceipt';

interface BoxOrderListProps {
  orders: BoxOrder[];
}

export function BoxOrderList({ orders }: BoxOrderListProps) {
  const { updateBoxOrderStatus } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<BoxOrder | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'lunas': return <Badge className="bg-green-500 hover:bg-green-600">Lunas</Badge>;
      case 'dp': return <Badge className="bg-yellow-500 hover:bg-yellow-600">DP</Badge>;
      default: return <Badge variant="destructive">Belum Bayar</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
        case 'Diproses': return <Badge className="bg-blue-500 hover:bg-blue-600">Diproses</Badge>;
        case 'Selesai': return <Badge className="bg-gray-500 hover:bg-gray-600">Selesai</Badge>;
        case 'Dibatalkan': return <Badge variant="destructive">Dibatalkan</Badge>;
        default: return <Badge className="bg-indigo-500 hover:bg-indigo-600">Baru</Badge>;
    }
  }

  const handlePrintClick = (order: BoxOrder) => {
    setSelectedOrder(order);
    setIsReceiptOpen(true);
  };

  if (orders.length === 0) {
    return <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
        <Package className="h-16 w-16 text-gray-300"/>
        <p>Belum ada pesanan nasi kotak.</p>
    </div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tgl. Ambil</TableHead>
            <TableHead>Pelanggan & Pesanan</TableHead>
            <TableHead>Status Pesanan</TableHead>
            <TableHead>Status Bayar</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{format(new Date(order.pickup_date), 'dd MMM yy', { locale: id })}</TableCell>
              <TableCell>
                <div className="font-semibold">{order.customer_name}</div>
                {/* TAMPILKAN NOMOR TELEPON JIKA ADA */}
                {order.customer_phone && <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{order.customer_phone}</div>}
                <div className="text-xs text-muted-foreground pt-1">
                  {order.items?.map(it => `${it.quantity}x ${it.productName}`).join(', ') || 'Tidak ada item'}
                </div>
              </TableCell>
              <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
              <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Buka menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handlePrintClick(order)}>
                      <Printer className="mr-2 h-4 w-4" />
                      <span>Cetak Tanda Terima</span>
                    </DropdownMenuItem>
                    {order.status === 'Baru' && (
                        <DropdownMenuItem onClick={() => updateBoxOrderStatus(order.id, 'Diproses')}>
                            Tandai "Diproses" & Kurangi Stok
                        </DropdownMenuItem>
                    )}
                    {order.status === 'Diproses' && (
                        <DropdownMenuItem onClick={() => updateBoxOrderStatus(order.id, 'Selesai')}>
                            Tandai "Selesai"
                        </DropdownMenuItem>
                    )}
                     {order.status !== 'Dibatalkan' && order.status !== 'Selesai' && (
                        <DropdownMenuItem className="text-red-600" onClick={() => updateBoxOrderStatus(order.id, 'Dibatalkan')}>
                            Batalkan Pesanan
                        </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <BoxOrderReceipt
        isOpen={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        order={selectedOrder}
      />
    </>
  );
}