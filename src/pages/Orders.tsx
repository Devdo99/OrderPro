// src/pages/Orders.tsx

import { useMemo, useState } from 'react';
import usePersistentState from '@/hooks/usePersistentState';
import OrderTypeSelection from '@/components/OrderTypeSelection';
import TableSelection from '@/components/TableSelection';
import OrderMenu from '@/components/OrderMenu';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { OrderItem, StockItem } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import CartPage from '@/components/CartPage';

type Step = 'selectOrderType' | 'selectTable' | 'createOrder' | 'viewCart';

export default function Orders() {
  const { addOrder, getProducibleQuantity } = useApp();

  // Mengganti semua useState dengan usePersistentState agar tidak hilang saat refresh
  const [step, setStep] = usePersistentState<Step>('order-step', 'selectOrderType');
  const [selectedOrderType, setSelectedOrderType] = usePersistentState<string | null>('order-type', null);
  const [selectedTables, setSelectedTables] = usePersistentState<string[]>('order-tables', []);
  const [cart, setCart] = usePersistentState<OrderItem[]>('order-cart', []);
  const [selectedStock, setSelectedStock] = usePersistentState<StockItem | null>('order-selected-stock', null);
  const [isQuantityPopupOpen, setIsQuantityPopupOpen] = useState(false); // Pop-up tidak perlu persistent

  const initialOrderData = useMemo(() => ({
    orderType: selectedOrderType || '',
    selectedStaff: '', 
  }), [selectedOrderType]);

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
  
  // Fungsi ini sekarang juga membersihkan localStorage untuk pesanan berikutnya
  const resetProcess = () => {
    setStep('selectOrderType');
    setSelectedOrderType(null);
    setSelectedTables([]);
    setCart([]);
    setSelectedStock(null);
    setIsQuantityPopupOpen(false);
  };

  const handleBack = () => {
    if (step === 'viewCart') {
      setStep('createOrder');
    } else if (step === 'createOrder' && selectedOrderType?.toLowerCase().includes('dine in')) {
      setStep('selectTable');
    } else {
      resetProcess();
    }
  };
  
  const handleProductClick = (stock: StockItem) => {
    const availableStock = getProducibleQuantity(stock.id);
    if (availableStock <= 0) {
      toast({ title: 'Stok Habis', description: `${stock.name} tidak dapat dibuat saat ini.`, variant: 'destructive' });
      return;
    }
    setSelectedStock(stock);
    setIsQuantityPopupOpen(true);
  };

  const handleAddToCartFromPopup = (quantity: number, itemNotes?: string, variantName?: string) => {
    if (!selectedStock) return;
    const availableStock = getProducibleQuantity(selectedStock.id);
    const cartItemKey = selectedStock.id + (variantName || '');
    const existingItem = cart.find(item => item.id === cartItemKey);
    const currentQuantity = existingItem?.quantity || 0;

    if (quantity + currentQuantity > availableStock) {
      toast({ title: 'Stok Tidak Cukup', variant: 'destructive' });
      return;
    }

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      setCart(cart.map(item => item.id === cartItemKey ? { ...item, quantity: newQuantity, notes: itemNotes || item.notes } : item));
      toast({ title: 'Jumlah Diperbarui', description: `${selectedStock.name} ${variantName ? `(${variantName})` : ''} sekarang menjadi ${newQuantity}.` });
    } else {
      const newItem: OrderItem = {
        id: cartItemKey, stockId: selectedStock.id, stockName: selectedStock.name,
        quantity, unit: selectedStock.unit || '', notes: itemNotes, variantName: variantName,
      };
      setCart([...cart, newItem]);
      toast({ title: 'Item Ditambahkan', description: `${selectedStock.name} ${variantName ? `(${variantName})` : ''} x${quantity} ditambahkan.` });
    }
    setIsQuantityPopupOpen(false);
    setSelectedStock(null);
  };
  
  const handleQuantityChangeInCart = (cartItemId: string, newQuantity: number) => {
    const itemInCart = cart.find(item => item.id === cartItemId);
    if (!itemInCart) return;

    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== cartItemId));
    } else {
      const availableStock = getProducibleQuantity(itemInCart.stockId);
      if (newQuantity > availableStock) {
        toast({ title: 'Stok Tidak Cukup', variant: 'destructive' });
        return;
      }
      setCart(cart.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const handleUpdateItemNotesInCart = (cartItemId: string, notes: string) => {
    setCart(cart.map(item => item.id === cartItemId ? { ...item, notes } : item));
  };
  
  const handleSubmitOrder = (finalOrderData: { customer?: string; selectedStaff: string; orderNotes?: string; orderType: string; }) => {
    if (cart.length === 0) return;
    addOrder(cart, finalOrderData.customer, selectedTables, finalOrderData.selectedStaff, finalOrderData.orderNotes, finalOrderData.orderType);
    resetProcess();
  };

  const renderStep = () => {
    switch (step) {
      case 'selectOrderType':
        return <OrderTypeSelection onSelect={handleOrderTypeSelect} />;
      case 'selectTable':
        return <TableSelection onTablesSubmit={handleTablesSubmit} />;
      case 'createOrder':
        return (
          <OrderMenu
            cart={cart}
            onProductClick={handleProductClick}
            isQuantityPopupOpen={isQuantityPopupOpen}
            setIsQuantityPopupOpen={setIsQuantityPopupOpen}
            selectedStock={selectedStock}
            setSelectedStock={setSelectedStock}
            onAddToCartFromPopup={handleAddToCartFromPopup}
            onGoToCart={() => setStep('viewCart')}
            preselectedTables={selectedTables}
            onOrderComplete={resetProcess}
            isFullScreen={true}
            initialOrderData={initialOrderData}
          />
        );
      case 'viewCart':
        return (
            <CartPage 
                cart={cart}
                preselectedTable={selectedTables.join(', ')}
                onUpdateQuantity={handleQuantityChangeInCart}
                onUpdateItemNotes={handleUpdateItemNotesInCart}
                onSubmitOrderWithDetails={handleSubmitOrder}
                onBack={() => setStep('createOrder')}
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