// src/components/TableSelection.tsx

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Users, Wind } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TableSelectionProps {
  onTablesSubmit: (tableNumbers: string[]) => void;
}

export default function TableSelection({ onTablesSubmit }: TableSelectionProps) {
  const { tables } = useApp();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (tableNumber: string) => {
    setSelected(prev => 
      prev.includes(tableNumber) 
        ? prev.filter(t => t !== tableNumber) 
        : [...prev, tableNumber]
    );
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      toast({ title: 'Pilih Meja', description: 'Anda harus memilih setidaknya satu meja.', variant: 'destructive' });
      return;
    }
    onTablesSubmit(selected);
  };

  return (
    <div className="flex flex-col items-center h-full">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Pilih Meja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {tables.map(table => {
              const isSelected = selected.includes(table.number);
              const isOccupied = table.status === 'occupied';
              
              return (
                <Button
                  key={table.id}
                  variant={isSelected ? 'default' : 'outline'}
                  disabled={isOccupied}
                  onClick={() => toggleSelection(table.number)}
                  className={`h-20 text-xl font-bold relative ${isOccupied ? 'bg-destructive/20 text-destructive' : ''}`}
                >
                  {isOccupied && <Users className="absolute top-1 right-1 h-4 w-4" />}
                  {table.number}
                </Button>
              );
            })}
          </div>
          <Button onClick={handleSubmit} className="w-full h-12 text-lg">
            Lanjutkan ke Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}