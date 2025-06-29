// src/components/PosInterface.tsx

import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { OrderItem, StockItem } from '@/types';
import SearchFilterBar from '@/components/SearchFilterBar';
import ProductGrid from '@/components/ProductGrid';
import QuantityPopup from '@/components/QuantityPopup';
import OrderSummary from '@/components/OrderSummary';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import CartPage from './CartPage';

interface PosInterfaceProps {
  cart: OrderItem[];
  setCart: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  orderNotes: string;
  setOrderNotes: React.Dispatch<React.SetStateAction<string>>;
  customer: string;
  setCustomer: React.Dispatch<React.SetStateAction<string>>;
  selectedStaff: string;
  setSelectedStaff: React.Dispatch<React.SetStateAction<string>>;
  preselectedTables: string[];
  orderType: string;
  onOrderComplete: () => void;
  fetchAppData: (isInitialLoad?: boolean) => Promise<void>; // <-- Menerima fungsi fetch
}

export default function PosInterface({
    cart, setCart, orderNotes, setOrderNotes, customer, setCustomer,
    selectedStaff, setSelectedStaff, preselectedTables, orderType, onOrderComplete,
    fetchAppData // <-- Menerima fungsi fetch
}: PosInterfaceProps) {
  const { stocks, addOrder, getProducibleQuantity, productPopularity, settings } = useApp();
  
  const [tableNumber, setTableNumber] = useState(preselectedTables.join(', '));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [isQuantityPopupOpen, setIsQuantityPopupOpen] = useState(false);
  const [showCartPage, setShowCartPage] = useState(false);

  useEffect(() => {
    setTableNumber(preselectedTables.join(', '));
  }, [preselectedTables]);

  const sortedAndFilteredProducts = useMemo(() => {
    const productsForSale = stocks.filter(s => s.type === 'PRODUK');
    const filtered = productsForSale.filter(stock => {
      const matchesSearch = stock.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || stock.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    return filtered.sort((a, b) => (productPopularity.get(b.id) || 0) - (productPopularity.get(a.id) || 0));
  }, [stocks, searchTerm, selectedCategory, productPopularity]);

  const categories = [...new Set(stocks.filter(s => s.type === 'PRODUK').map(stock => stock.category || 'Lainnya'))];

  const handleProductClick = (stock: StockItem) => {
    if (stock.variants && stock.variants.length > 0) {
        setSelectedStock(stock);
        setIsQuantityPopupOpen(true);
    } else {
        handleAddToCart(stock, 1);
    }
  };

  const handleAddToCart = (stock: StockItem, quantity: number, itemNotes?: string, variantName?: string) => {
    const cartItemKey = stock.id + (variantName || '');
    const existingItem = cart.find(item => item.id === cartItemKey);
    if (existingItem) {
        handleUpdateQuantity(cartItemKey, existingItem.quantity + quantity);
    } else {
        const newItem: OrderItem = { id: cartItemKey, stockId: stock.id, stockName: stock.name, quantity, unit: stock.unit || '', notes: itemNotes, variantName };
        setCart(prev => [...prev, newItem]);
        toast({ title: 'Item Ditambahkan' });
    }
  };

  const handleAddToCartFromPopup = (quantity: number, itemNotes?: string, variantName?: string) => {
    if (!selectedStock) return;
    handleAddToCart(selectedStock, quantity, itemNotes, variantName);
    setIsQuantityPopupOpen(false);
    setSelectedStock(null);
  };
  
  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    const itemInCart = cart.find(item => item.id === cartItemId);
    if (!itemInCart) return;
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== cartItemId));
    } else {
      const availableStock = getProducibleQuantity(itemInCart.stockId);
      if (newQuantity > availableStock) {
        toast({ title: 'Stok Tidak Cukup', variant: 'destructive' });
        return;
      }
      setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const clearOrder = () => {
    setCart([]);
    setOrderNotes('');
    setCustomer('');
    setTableNumber('');
    setSelectedStaff(settings.defaultStaffName || '');
    toast({ title: "Pesanan Dikosongkan" });
  }

  const handleSubmitOrder = () => {
    if (cart.length === 0) {
        toast({ title: "Keranjang Kosong", variant: "destructive"});
        return;
    }
    addOrder(cart, customer, tableNumber ? [tableNumber] : undefined, selectedStaff, orderNotes, orderType);
    clearOrder();
    onOrderComplete();
  };
  
  const handleUpdateItemNotesInCart = (cartItemId: string, notes: string) => {
    setCart(cart.map(item => item.id === cartItemId ? { ...item, notes } : item));
  };


  if (showCartPage) {
    return (
      <CartPage
        cart={cart}
        preselectedTable={preselectedTables.join(', ')}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateItemNotes={handleUpdateItemNotesInCart}
        onSubmitOrderWithDetails={handleSubmitOrder}
        onBack={() => setShowCartPage(false)}
      />
    );
  }

  return (
    <>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={65} minSize={40}>
          <div className="flex flex-col h-full p-4 space-y-4">
            <SearchFilterBar 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
              selectedCategory={selectedCategory} 
              onCategoryChange={setSelectedCategory} 
              categories={categories}
              cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
              onViewCartClick={() => setShowCartPage(true)}
              onRefreshClick={() => fetchAppData(false)} // <-- Menghubungkan aksi klik
            />
            <div className="flex-1 overflow-auto">
              <ProductGrid products={sortedAndFilteredProducts} onProductClick={handleProductClick} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={35} minSize={30}>
          <OrderSummary
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onSubmitOrder={handleSubmitOrder}
            onClearOrder={clearOrder}
            staffList={settings.staffList || []}
            defaultStaffName={selectedStaff}
            onStaffChange={setSelectedStaff}
            customer={customer}
            onCustomerChange={setCustomer}
            tableNumber={tableNumber}
            onTableNumberChange={setTableNumber}
            orderNotes={orderNotes}
            onOrderNotesChange={setOrderNotes}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
      <QuantityPopup 
        isOpen={isQuantityPopupOpen} 
        onClose={() => setIsQuantityPopupOpen(false)} 
        stock={selectedStock} 
        onAddToCart={handleAddToCartFromPopup} 
      />
    </>
  );
}