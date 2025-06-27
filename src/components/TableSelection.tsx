// src/components/TableSelection.tsx

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Table as TableType } from '@/types';
import { Users, CheckCircle } from 'lucide-react';
import { Check } from 'lucide-react';

interface TableSelectionProps {
  onTablesSubmit: (tableNumbers: string[]) => void;
}

export default function TableSelection({ onTablesSubmit }: TableSelectionProps) {
  const { tables, orders } = useApp();
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const toggleTableSelection = (tableNumber: string) => {
    setSelectedTables(prev => 
      prev.includes(tableNumber)
        ? prev.filter(t => t !== tableNumber)
        : [...prev, tableNumber]
    );
  };

  const isTableOccupied = (tableNumber: string): boolean => {
    const normalize = (str: string) => str.trim().toLowerCase();
    const normalizedTableNumber = normalize(tableNumber);
    
    return orders.some(o => 
      // PERBAIKAN: Logika untuk menangani gabungan meja
      o.tableNumber?.split(',').map(normalize).includes(normalizedTableNumber) 
      && o.status === 'pending'
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Pilih Satu atau Beberapa Meja</h1>
        <p className="text-gray-600 mt-2">Anda bisa menggabungkan beberapa meja untuk satu pesanan.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-8">
        {tables.map(table => {
          const isOccupied = isTableOccupied(table.number);
          const isSelected = selectedTables.includes(table.number);
          return (
            <Card
              key={table.id}
              onClick={() => !isOccupied && toggleTableSelection(table.number)}
              className={`relative transition-all duration-200 border-2 rounded-lg ${
                isOccupied ? 'bg-gray-200 opacity-60 cursor-not-allowed' : 'cursor-pointer'
              } ${isSelected ? 'border-orange-500 ring-2 ring-orange-500' : 'hover:border-orange-500/50'}`}
            >
              {isSelected && (
                <div className="absolute top-1 right-1 bg-orange-500 text-white rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <CardContent className="p-4 text-center flex flex-col items-center justify-center gap-2">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${isOccupied ? 'bg-gray-300' : 'bg-primary/10'}`}>
                    {isOccupied ? <Users className="h-8 w-8 text-gray-500"/> : <CheckCircle className="h-8 w-8 text-primary"/>}
                </div>
                <p className="font-bold text-xl">{table.number}</p>
                <p className="text-sm font-medium">{isOccupied ? 'Terisi' : 'Kosong'}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Button 
        size="lg"
        onClick={() => onTablesSubmit(selectedTables)}
        disabled={selectedTables.length === 0}
      >
        Lanjutkan dengan {selectedTables.length} Meja
      </Button>
    </div>
  );
}