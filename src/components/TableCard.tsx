// src/components/TableCard.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Table as TableType } from '@/types';
import { Users, CheckCircle, Wind } from 'lucide-react';
import FullScreenOrderDialog from './FullScreenOrderDialog';

interface TableCardProps {
  table: TableType;
}

const getStatusProps = (status: TableType['status']) => {
  switch (status) {
    case 'occupied':
      return { 
        icon: <Users className="h-8 w-8 text-red-600" />, 
        color: 'bg-red-100 border-red-300 text-red-800',
        textColor: 'text-red-500',
        text: 'Terisi',
        isClickable: false,
      };
    case 'recently_completed':
      return { 
        icon: <Wind className="h-8 w-8 text-blue-600" />, 
        color: 'bg-blue-100 border-blue-300 text-blue-800',
        textColor: 'text-blue-500',
        text: 'Selesai', 
        isClickable: false,
      };
    default: // available
      return { 
        icon: <CheckCircle className="h-8 w-8 text-green-600" />, 
        color: 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200',
        textColor: 'text-green-600',
        text: 'Kosong',
        isClickable: true,
      };
  }
};

export default function TableCard({ table }: TableCardProps) {
  const { icon, color, textColor, text, isClickable } = getStatusProps(table.status);

  const cardContent = (
    <Card
      className={`transition-all duration-300 border-2 shadow-md rounded-xl overflow-hidden ${color} ${isClickable ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1.5' : 'cursor-not-allowed'}`}
    >
      <CardContent className="p-4 text-center flex flex-col items-center justify-between gap-2 aspect-square">
        <div className={`font-black text-6xl ${textColor}`}>
          {table.number}
        </div>
        <div className="flex flex-col items-center">
            {icon}
            <p className="font-semibold text-base mt-1">{text}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (table.status === 'available') {
    return (
      <FullScreenOrderDialog tableNumbers={[table.number]}>
        {cardContent}
      </FullScreenOrderDialog>
    );
  }

  return cardContent;
}