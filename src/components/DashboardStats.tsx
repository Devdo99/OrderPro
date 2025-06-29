// src/components/DashboardStats.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Users, AlertTriangle } from 'lucide-react'; // DollarSign dihapus

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
    isLoading: boolean;
    // totalRevenue dihapus
    totalOrders: number;
    totalCustomers: number;
    lowStockCount: number;
}

export function DashboardStats({ isLoading, totalOrders, totalCustomers, lowStockCount }: DashboardStatsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
        )
    }

    // PERBAIKAN: Menghapus statistik pendapatan
    const stats = [
        { title: 'Pesanan Hari Ini', value: `+${totalOrders}`, icon: ShoppingCart, color: 'text-blue-600' },
        { title: 'Pelanggan Hari Ini', value: `+${totalCustomers}`, icon: Users, color: 'text-purple-600' },
        { title: 'Stok Menipis', value: `${lowStockCount}`, icon: AlertTriangle, color: 'text-red-600' }
    ];

    return (
        // PERBAIKAN: Grid disesuaikan untuk 3 kartu
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
        </div>
    );
}