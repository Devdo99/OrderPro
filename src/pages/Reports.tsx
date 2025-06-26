// src/pages/Reports.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { Calendar, FileText, Download, BarChart3, FileSpreadsheet, FileBarChart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

// --- KONTEN LAPORAN SEKARANG LANGSUNG DI-RENDER ---
export default function Reports() {
  const { orders } = useApp();
  const [reportType, setReportType] = useState('daily');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const getDateRange = () => {
    const now = new Date();
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);

    switch (reportType) {
      case 'daily':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        };
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return { start: weekStart, end: weekEnd };
      case 'monthly':
        return {
          start: new Date(year, month, 1),
          end: new Date(year, month + 1, 1)
        };
      case 'yearly':
        return {
          start: new Date(year, 0, 1),
          end: new Date(year + 1, 0, 1)
        };
      default:
        return { start: new Date(), end: new Date() };
    }
  };

  const { start, end } = getDateRange();
  const filteredOrders = orders.filter(order => 
    new Date(order.createdAt) >= start && new Date(order.createdAt) < end
  );

  const totalOrders = filteredOrders.length;
  const totalItems = filteredOrders.reduce((sum, order) => sum + order.totalItems, 0);

  const itemCount: { [key: string]: number } = {};
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      itemCount[item.stockName] = (itemCount[item.stockName] || 0) + item.quantity;
    });
  });

  const popularItems = Object.entries(itemCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  const handleDownloadCSV = () => {
    const reportData = filteredOrders.map(order => ({
      'No Pesanan': order.orderNumber,
      'Pelanggan': order.customer || 'Pelanggan',
      'Staff': order.staffName || 'Staff',
      'Meja': order.tableNumber || '-',
      'Total Item': order.totalItems,
      'Status': order.status === 'completed' ? 'Selesai' : 
               order.status === 'pending' ? 'Menunggu' : 'Dibatalkan',
      'Waktu': new Date(order.createdAt).toLocaleString('id-ID'),
      'Item Detail': order.items.map(item => `${item.stockName} (${item.quantity} ${item.unit})`).join('; ')
    }));

    exportToCSV(reportData, `laporan_${reportType}_${new Date().toISOString().split('T')[0]}`);
    
    toast({
      title: 'Laporan CSV Berhasil Diunduh',
      description: 'File CSV telah disimpan',
    });
  };

  const handleDownloadExcel = () => {
    const reportData = filteredOrders.map(order => ({
      'No Pesanan': order.orderNumber,
      'Pelanggan': order.customer || 'Pelanggan',
      'Staff': order.staffName || 'Staff',
      'Meja': order.tableNumber || '-',
      'Total Item': order.totalItems,
      'Status': order.status === 'completed' ? 'Selesai' : 
               order.status === 'pending' ? 'Menunggu' : 'Dibatalkan',
      'Waktu': new Date(order.createdAt).toLocaleString('id-ID'),
      'Item Detail': order.items.map(item => `${item.stockName} (${item.quantity} ${item.unit})`).join('; ')
    }));

    exportToExcel(reportData, `laporan_${reportType}_${new Date().toISOString().split('T')[0]}`);
    
    toast({
      title: 'Laporan Excel Berhasil Diunduh',
      description: 'File Excel telah disimpan',
    });
  };

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Laporan Penjualan</h1>
          <p className="text-gray-600">Analisis performa bisnis Anda</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadCSV} variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Unduh CSV
          </Button>
          <Button onClick={handleDownloadExcel} variant="outline">
            <FileBarChart className="mr-2 h-4 w-4" />
            Unduh Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Harian</SelectItem>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
            
            {(reportType === 'monthly' || reportType === 'yearly') && (
              <>
                {reportType === 'monthly' && (
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Pilih bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pesanan</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Item Terjual</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rata-rata per Hari</p>
                <p className="text-2xl font-bold">
                  {reportType === 'daily' ? totalOrders : Math.round(totalOrders / Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Terpopuler</CardTitle>
        </CardHeader>
        <CardContent>
          {popularItems.length > 0 ? (
            <div className="space-y-4">
              {popularItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-lg font-bold">{item.quantity} terjual</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Tidak ada data untuk periode ini</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detail Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">No. Pesanan</th>
                    <th className="text-left p-3">Pelanggan</th>
                    <th className="text-left p-3">Total Item</th>
                    <th className="text-left p-3">Waktu</th>
                    <th className="text-left p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{order.orderNumber}</td>
                      <td className="p-3">{order.customer || 'Pelanggan'}</td>
                      <td className="p-3">{order.totalItems}</td>
                      <td className="p-3">{new Date(order.createdAt).toLocaleString('id-ID')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status === 'completed' ? 'Selesai' :
                           order.status === 'pending' ? 'Menunggu' : 'Dibatalkan'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Tidak ada pesanan untuk periode ini</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}