
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerManagement from '@/components/CustomerManagement';

export default function Customers() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Management Pelanggan</h1>
        <p className="text-gray-600">Kelola data pelanggan dan riwayat pesanan</p>
      </div>

      {/* Customer Management */}
      <CustomerManagement />
    </div>
  );
}
