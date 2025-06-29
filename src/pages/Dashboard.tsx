// src/pages/Dashboard.tsx

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Utensils, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { DashboardStats } from '@/components/DashboardStats';
import { SalesChart } from '@/components/SalesChart';
import { StockItem } from '@/types';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { stocks, orders, isLoading } = useApp();

  const {
      todayOrdersCount,
      todayCustomers,
      salesData,
      topProducts,
      lowStockItems
  } = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    
    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return o.status === 'completed' && orderDate >= todayStart && orderDate <= todayEnd;
    });

    const todayCustomers = new Set(todayOrders.map(o => o.customer).filter(Boolean)).size;

    // --- PERBAIKAN: salesData sekarang menghitung kuantitas, bukan revenue ---
    const salesData = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(now, 6 - i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        const total = orders
            .filter(o => {
                const orderDate = new Date(o.createdAt);
                return o.status === 'completed' && orderDate >= dayStart && orderDate <= dayEnd;
            })
            .reduce((sum, order) => sum + order.totalItems, 0); // Menjumlahkan totalItems
        return { name: format(date, 'd MMM', { locale: localeID }), total };
    });

    const productCount = new Map<string, {name: string, quantity: number}>();
    todayOrders.forEach(order => {
        order.items.forEach(item => {
            const current = productCount.get(item.stockId) || { name: item.stockName, quantity: 0};
            productCount.set(item.stockId, { ...current, quantity: current.quantity + item.quantity });
        });
    });
    const topProducts = [...productCount.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    
    const lowStockItems = stocks.filter(s => s.type === 'BAHAN' && s.current_stock <= s.min_stock)
                                  .sort((a,b) => a.current_stock - b.current_stock);

    return {
        todayOrdersCount: todayOrders.length,
        todayCustomers,
        salesData,
        topProducts,
        lowStockItems
    };
  }, [orders, stocks]);


  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-4">
        {/* PERBAIKAN: totalRevenue dihapus */}
        <DashboardStats 
            isLoading={isLoading}
            totalOrders={todayOrdersCount}
            totalCustomers={todayCustomers}
            lowStockCount={lowStockItems.length}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* PERBAIKAN: SalesChart sekarang menampilkan kuantitas */}
          <SalesChart data={salesData} />
          <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
              <CardTitle>Menu Terlaris Hari Ini</CardTitle>
              <CardDescription>5 produk yang paling banyak dipesan hari ini.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.length > 0 ? topProducts.map((product) => (
                  <div key={product.name} className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-md mr-4">
                        <Utensils className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{product.name}</p>
                    </div>
                    <div className="font-semibold">{product.quantity} terjual</div>
                  </div>
                )) : (
                    <div className="text-center text-muted-foreground py-8">
                        <Package className="h-10 w-10 mx-auto mb-2" />
                        <p>Belum ada penjualan hari ini.</p>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
             <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><AlertTriangle className="h-5 w-5 text-red-600"/>Peringatan Stok Bahan</CardTitle>
                    <CardDescription>Bahan baku yang perlu segera diisi ulang.</CardDescription>
                </CardHeader>
                <CardContent>
                    {lowStockItems.length > 0 ? (
                        <div className="space-y-4">
                            {lowStockItems.slice(0, 5).map(item => (
                                <div key={item.id} className="flex items-center">
                                    <div className={`p-3 rounded-md mr-4 ${item.current_stock === 0 ? 'bg-red-100' : 'bg-yellow-100'}`}>
                                        <Package className={`h-5 w-5 ${item.current_stock === 0 ? 'text-red-600' : 'text-yellow-600'}`} />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.category}</p>
                                    </div>
                                    <div className={`font-semibold ${item.current_stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                                        Sisa {item.current_stock} {item.unit}
                                    </div>
                                </div>
                            ))}
                            {lowStockItems.length > 5 && (
                                <Link to="/ingredients" className="pt-2 block text-center text-sm text-accent-foreground/80 hover:text-accent-foreground font-medium">
                                    dan {lowStockItems.length - 5} lainnya...
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500"/>
                            <p className="font-medium text-green-600">Semua stok bahan baku aman!</p>
                        </div>
                    )}
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}