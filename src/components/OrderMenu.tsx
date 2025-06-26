// src/components/OrderMenu.tsx

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { OrderItem, StockItem } from '@/types';
import SearchFilterBar from './SearchFilterBar';
import ProductGrid from './ProductGrid';
import CustomerStaffDialog from './CustomerStaffDialog';
import QuantityPopup from './QuantityPopup';
import CartPage from './CartPage';
import { Button } from '@/components/ui/button';

interface OrderMenuProps {
  preselectedTables?: string[];
  onOrderComplete?: () => void;
  isFullScreen?: boolean;
  initialOrderData?: {
    customer?: string;
    selectedStaff: string;
    orderNotes?: string;
    orderType: string;
  };
}

export default function OrderMenu({ preselectedTables = [], onOrderComplete, isFullScreen = false, initialOrderData }: OrderMenuProps) {
  const { stocks, addOrder, getProducibleQuantity } = useApp();
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [isQuantityPopupOpen, setIsQuantityPopupOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(!initialOrderData);
  const [showCartPage, setShowCartPage] = useState(false);
  const [orderData, setOrderData] = useState<{
    customer?: string;
    selectedStaff: string;
    orderNotes?: string;
    orderType: string;
  } | null>(initialOrderData || null);

  useEffect(() => {
    if (initialOrderData) {
      setOrderData(initialOrderData);
      setIsCustomerDialogOpen(false);
    } else {
      setIsCustomerDialogOpen(true);
      setOrderData(null);
    }
  }, [initialOrderData]);

  const productsForSale = stocks.filter(s => s.type === 'PRODUK');
  const filteredProducts = productsForSale.filter(stock => {
    const matchesSearch = stock.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || selectedCategory === '' || stock.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(productsForSale.map(stock => stock.category))];

  const getTotalQuantityInCartForProduct = (stockId: string): number => {
    return cart
      .filter(item => item.stockId === stockId)
      .reduce((total, item) => total + item.quantity, 0);
  };

  const handleCustomerDataSubmit = (data: { customer?: string; selectedStaff: string; orderNotes?: string; orderType: string; }) => {
    setOrderData(data);
    setIsCustomerDialogOpen(false);
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
  
  const handleCardQuantityChange = (stockId: string, newQuantity: number) => {
      const itemInCart = cart.find(i => i.stockId === stockId);
      if (!itemInCart) return;

      handleQuantityChangeInCart(itemInCart.id, newQuantity);
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
  
  const handleGoToCart = () => {
    if (cart.length === 0) {
      toast({ title: 'Keranjang Kosong', variant: 'destructive' });
      return;
    }
    setShowCartPage(true);
  };
  
  const handleSubmitOrder = async () => {
    if (cart.length === 0 || !orderData) return;
    addOrder(cart, orderData.customer, preselectedTables, orderData.selectedStaff, orderData.orderNotes, orderData.orderType);
    setCart([]);
    setOrderData(null);
    setIsCustomerDialogOpen(true);
    setShowCartPage(false);
    if (onOrderComplete) onOrderComplete();
  };
  
  const handleDialogClose = () => {
    setIsCustomerDialogOpen(false);
    if (onOrderComplete && !orderData) onOrderComplete();
  };
  
  if (showCartPage && orderData) {
    return ( <CartPage 
                cart={cart} 
                orderData={orderData} 
                preselectedTable={preselectedTables.join(', ')} 
                onUpdateQuantity={handleQuantityChangeInCart} 
                onUpdateItemNotes={handleUpdateItemNotesInCart} 
                onSubmitOrder={handleSubmitOrder} 
                onBack={() => setShowCartPage(false)}
             /> );
  }

  return (
    <div className="flex flex-col h-full">
      {isCustomerDialogOpen && !orderData && (
        <CustomerStaffDialog 
            isOpen={isCustomerDialogOpen} 
            onClose={handleDialogClose} 
            onSubmit={handleCustomerDataSubmit} 
            tableNumber={preselectedTables.join(', ')} 
        />
      )}

      {orderData && !showCartPage && (
        <div className="flex flex-col h-full space-y-4">
          <div className="shrink-0">
            <SearchFilterBar 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm} 
                selectedCategory={selectedCategory} 
                onCategoryChange={setSelectedCategory} 
                categories={categories} 
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <ProductGrid 
              products={filteredProducts} 
              getQuantityInCart={getTotalQuantityInCartForProduct} 
              onQuantityChange={handleCardQuantityChange}
              onProductClick={handleProductClick} 
            />
          </div>
          
          {cart.length > 0 && (
            <div className="bg-white border-t p-4 rounded-lg shrink-0">
              <Button onClick={handleGoToCart} className="w-full h-12 text-lg font-semibold">
                Lihat Keranjang ({cart.reduce((sum, item) => sum + item.quantity, 0)} item)
              </Button>
            </div>
          )}
        </div>
      )}
      
      <QuantityPopup 
        isOpen={isQuantityPopupOpen} 
        onClose={() => {
          setIsQuantityPopupOpen(false);
          setSelectedStock(null);
        }} 
        stock={selectedStock} 
        onAddToCart={handleAddToCartFromPopup} 
      />
    </div>
  );
}