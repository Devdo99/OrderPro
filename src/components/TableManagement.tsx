// src/components/TableManagement.tsx

import { useApp } from '@/contexts/AppContext';
import TableCard from '@/components/TableCard'; 

export default function TableManagement() {
  const { tables } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Status & Manajemen Meja</h2>
        <p className="text-gray-600">
          Hijau (Kosong), Merah (Terisi), Biru (Perlu Dibersihkan).
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {tables.map((table) => (
          <TableCard 
            key={table.id} 
            table={table}
          />
        ))}
      </div>
    </div>
  );
}