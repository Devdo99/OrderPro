// src/pages/Orders.tsx

import { useState } from 'react';
import usePersistentState from '@/hooks/usePersistentState';
import { OrderItem } from '@/types';
import { useApp } from '@/contexts/AppContext';

import OrderTypeSelection from '@/components/OrderTypeSelection';
import TableSelection from '@/components/TableSelection';
import PosInterface from '@/components/PosInterface';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type Step = 'selectOrderType' | 'selectTable' | 'createOrder';

export default function Orders() {
  const { settings, fetchAppData } = useApp(); // <-- Ambil fungsi fetchAppData
  
  const [step, setStep] = useState<Step>('selectOrderType');
  
  const [cart, setCart] = usePersistentState<OrderItem[]>('pos-cart', []);
  const [orderNotes, setOrderNotes] = usePersistentState<string>('pos-order-notes', '');
  const [customer, setCustomer] = usePersistentState<string>('pos-customer', '');
  const [selectedStaff, setSelectedStaff] = usePersistentState<string>('pos-staff', settings.defaultStaffName || '');
  
  const [selectedOrderType, setSelectedOrderType] = useState<string | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const handleOrderTypeSelect = (orderType: string) => {
    setSelectedOrderType(orderType);
    if (orderType === 'Dine In') {
      setStep('selectTable');
    } else {
      setSelectedTables([]);
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
    if (step === 'createOrder') {
      if (selectedOrderType === 'Dine In') {
        setStep('selectTable');
      } else {
        resetProcess();
      }
    } else if (step === 'selectTable') {
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
        return (
          <PosInterface
            cart={cart}
            setCart={setCart}
            orderNotes={orderNotes}
            setOrderNotes={setOrderNotes}
            customer={customer}
            setCustomer={setCustomer}
            selectedStaff={selectedStaff}
            setSelectedStaff={setSelectedStaff}
            preselectedTables={selectedTables}
            orderType={selectedOrderType || 'Take Away'}
            onOrderComplete={resetProcess}
            fetchAppData={fetchAppData} // <-- Kirim fungsi sebagai prop
          />
        );
        
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
      <div className="flex-1 overflow-hidden">
        {renderStep()}
      </div>
    </div>
  );
}