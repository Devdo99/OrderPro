// src/components/OrderList.tsx

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { Order } from '@/types';
import { Clock, Package, Search, User, UserCog } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ReceiptPreview from '@/components/ReceiptPreview';
import OrderTimer from '@/components/OrderTimer';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function OrderList() {
  const { orders, updateOrderStatus, isLoading } = useApp();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        if (statusFilter !== 'all' && order.status !== statusFilter) {
          return false;
        }
        if (searchTerm) {
          const lowerCaseSearch = searchTerm.toLowerCase();
          const searchIn = [
            order.orderNumber,
            order.customer,
            order.staffName,
            order.tableNumber // Pencarian tetap bisa berdasarkan string gabungan
          ].join(' ').toLowerCase();
          return searchIn.includes(lowerCaseSearch);
        }
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [orders, statusFilter, searchTerm]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    toast({
      title: 'Status Order Diperbarui',
      description: `Status order berhasil diubah ke ${newStatus}.`,
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 w-full md:w-48" />
            <Skeleton className="h-10 w-full md:w-64" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Label htmlFor="status-filter">Status:</Label>
                <Select value={statusFilter} onValueChange={(value: any) => { setStatusFilter(value); setCurrentPage(1); }}>
                  <SelectTrigger id="status-filter" className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Cari no. order, pelanggan, atau staff..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
            </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {currentOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-base md:text-lg">{order.orderNumber}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'pending' ? 'Pending' : order.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                    </span>
                    {order.orderType && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {order.orderType}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-2"><UserCog className="h-4 w-4" />Staff: {order.staffName || '-'}</div>
                    <div className="flex items-center gap-2"><User className="h-4 w-4" />Pelanggan: {order.customer || '-'}</div>
                    {order.tableNumber && <div className="flex items-center gap-2"><span>🍽️</span>Meja: {order.tableNumber}</div>}
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4" />Waktu: {order.createdAt.toLocaleString('id-ID')}</div>
                  </div>

                  {order.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-1 text-sm">
                        <span className="font-medium text-gray-700">Waktu Berjalan:</span>
                        <OrderTimer startTime={order.createdAt} />
                    </div>
                  )}

                  <div className="mt-2 text-sm">
                    <p className="font-medium">Items ({order.totalItems}):</p>
                    <ul className="list-disc list-inside text-muted-foreground pl-2">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.quantity}x {item.stockName} {item.variantName && `(${item.variantName})`}
                          {item.notes && <span className="text-blue-600 ml-2">- "{item.notes}"</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {order.notes && (
                      <div className="text-sm pt-2">
                        <p className="font-medium">Catatan Pesanan:</p>
                        <p className="text-blue-700 italic">"{order.notes}"</p>
                      </div>
                  )}
                </div>
                
                <div className="flex flex-row md:flex-col gap-2 shrink-0">
                  {order.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'completed')} className="w-full">Selesai</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(order.id, 'cancelled')} className="w-full">Batal</Button>
                    </>
                  )}
                  <ReceiptPreview order={order} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <h3 className="text-lg font-semibold">Tidak Ada Order Ditemukan</h3>
            <p>Coba ubah filter atau kata kunci pencarian Anda.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                 <PaginationItem key={page}>
                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page); }} isActive={currentPage === page}>
                        {page}
                    </PaginationLink>
                 </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}