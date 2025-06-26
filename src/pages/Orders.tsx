// src/pages/Orders.tsx

import { useState } from 'react';
import OrderTypeSelection from '@/components/OrderTypeSelection';
import TableSelection from '@/components/TableSelection';
import OrderMenu from '@/components/OrderMenu';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type Step = 'selectOrderType' | 'selectTable' | 'createOrder';

export default function Orders() {
  const [step, setStep] = useState<Step>('selectOrderType');
  const [selectedOrderType, setSelectedOrderType] = useState<string | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const handleOrderTypeSelect = (orderType: string) => {
    setSelectedOrderType(orderType);
    if (orderType.toLowerCase().includes('dine in')) {
      setStep('selectTable');
    } else {
      setStep('createOrder');
    }
  };

  const handleTablesSubmit = (tableNumbers: string[]) => {
    if (tableNumbers.length === 0) return;
    setSelectedTables(tableNumbers);
    setStep('createOrder');
  };

  const resetProcess = () => {
    setStep('selectOrderType');
    setSelectedOrderType(null);
    setSelectedTables([]);
  };

  const handleBack = () => {
    if (step === 'createOrder' && selectedOrderType?.toLowerCase().includes('dine in')) {
      setStep('selectTable');
      setSelectedTables([]);
    } else {
      resetProcess();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'selectOrderType':
        return <OrderTypeSelection onSelect={handleOrderTypeSelect} />;
      case 'selectTable':
        return <TableSelection onTablesSubmit={handleTablesSubmit} />;
      case 'createOrder':
        return <OrderMenu 
                  preselectedTables={selectedTables} 
                  onOrderComplete={resetProcess}
                  isFullScreen={true}
                  initialOrderData={{ 
                      orderType: selectedOrderType || '', 
                      selectedStaff: '',
                  }}
               />;
      default:
        return <OrderTypeSelection onSelect={handleOrderTypeSelect} />;
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {step !== 'selectOrderType' && (
        <div className="mb-4 shrink-0">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      )}
      <div className="flex-1">
        {renderStep()}
      </div>
    </div>
  );
}