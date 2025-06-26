// src/pages/OrderList.tsx

import OrderList from '@/components/OrderList';

export default function OrderListPage() {
  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold">Daftar Order</h1>
        <p className="text-gray-600 text-sm lg:text-base">Kelola dan pantau semua pesanan</p>
      </div>
      
      <OrderList />
    </div>
  );
}