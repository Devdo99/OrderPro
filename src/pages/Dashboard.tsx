// src/pages/Dashboard.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { ShoppingCart, Package, Utensils, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const appContext = useApp();

  if (!appContext) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  const { stocks, orders, getProducibleQuantity } = appContext;

  const todayOrders = orders.filter(order => {
    const today = new Date().toDateString();
    return new Date(order.createdAt).toDateString() === today;
  });

  const lowStockItems = stocks.filter(stock => {
    if (stock.type === 'BAHAN') {
      return (stock.current_stock || 0) <= stock.min_stock;
    }
    if (stock.type === 'PRODUK') {
      const producible = getProducibleQuantity(stock.id);
      return producible <= stock.min_stock;
    }
    return false;
  });

  const stats = [
    { title: 'Pesanan Hari Ini', value: todayOrders.length, icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-100', link: '/order-list' },
    { title: 'Total Produk', value: stocks.filter(s => s.type === 'PRODUK').length, icon: Utensils, color: 'text-green-600', bgColor: 'bg-green-100', link: '/products' },
    { title: 'Stok Menipis', value: lowStockItems.length, icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100', link: '/#low-stock-alert' },
    { title: 'Total Bahan', value: stocks.filter(s => s.type === 'BAHAN').length, icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100', link: '/ingredients' }
  ];

  return (
    <div className="space-y-6">
      {/* --- Header Dashboard Baru --- */}
      <div className="bg-gradient-to-br from-card to-secondary rounded-lg p-6 border shadow-sm">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Selamat Datang Selamat Berbahagia</h1>
        <p className="text-muted-foreground">Kelola pesanan, produk, dan bahan dengan mudah dari satu tempat.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link} className="block">
            <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" />Pesanan Terbaru</CardTitle></CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.totalItems} item • {new Date(order.createdAt).toLocaleTimeString('id-ID')}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
                <Link to="/order-list" className="pt-2 block text-center text-sm text-accent-foreground/80 hover:text-accent-foreground font-medium">Lihat Semua Pesanan →</Link>
              </div>
            ) : (<p className="text-muted-foreground text-center py-8">Belum ada pesanan</p>)}
          </CardContent>
        </Card>

        <Card id="low-stock-alert">
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />Peringatan Stok</CardTitle></CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <div>
                      <p className="font-medium text-destructive">{item.name}</p>
                      <p className="text-sm text-destructive/80">
                        {item.type === 'BAHAN' ? `Sisa: ${item.current_stock}` : `Bisa dibuat: ~${getProducibleQuantity(item.id)}`}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === 'BAHAN' ? 'bg-gray-200' : 'bg-blue-100 text-blue-800'}`}>{item.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8"><Package className="h-12 w-12 text-green-500 mx-auto mb-2" /><p className="text-green-600 font-medium">Semua stok aman!</p><p className="text-muted-foreground text-sm">Tidak ada item dengan stok menipis</p></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}