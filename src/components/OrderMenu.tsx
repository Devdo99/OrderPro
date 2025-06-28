// src/components/OrderMenu.tsx

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { OrderItem, StockItem } from '@/types';
import SearchFilterBar from './SearchFilterBar';
import ProductGrid from './ProductGrid';
import CustomerStaffDialog from './CustomerStaffDialog';
import QuantityPopup from './QuantityPopup';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination'; // <-- Impor Paginasi

interface OrderMenuProps {
  cart: OrderItem[];
  onProductClick: (stock: StockItem) => void;
  isQuantityPopupOpen: boolean;
  setIsQuantityPopupOpen: (isOpen: boolean) => void;
  selectedStock: StockItem | null;
  setSelectedStock: (stock: StockItem | null) => void;
  onAddToCartFromPopup: (quantity: number, itemNotes?: string, variantName?: string) => void;
  onGoToCart: () => void;
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

export default function OrderMenu({
  cart,
  onProductClick,
  isQuantityPopupOpen,
  setIsQuantityPopupOpen,
  selectedStock,
  setSelectedStock,
  onAddToCartFromPopup,
  onGoToCart,
  preselectedTables = [],
  onOrderComplete,
  isFullScreen = false,
  initialOrderData
}: OrderMenuProps) {
  const { stocks } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(!initialOrderData);
  const [orderData, setOrderData] = useState(initialOrderData || null);

  // --- State Baru untuk Paginasi ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8; // Tampilkan 8 produk per halaman

  useEffect(() => {
    if (initialOrderData) {
      setOrderData(initialOrderData);
      setIsCustomerDialogOpen(false);
    }
  }, [initialOrderData]);
  
  // Reset halaman ke 1 setiap kali filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const productsForSale = stocks.filter(s => s.type === 'PRODUK');
  const filteredProducts = productsForSale.filter(stock => {
    const matchesSearch = stock.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || selectedCategory === '' || stock.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- Logika untuk memotong data sesuai halaman ---
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const categories = [...new Set(productsForSale.map(stock => stock.category || 'Lainnya'))];

  const getTotalQuantityInCartForProduct = (stockId: string): number => {
    return cart
      .filter(item => item.stockId === stockId)
      .reduce((total, item) => total + item.quantity, 0);
  };
  
  const handleDialogClose = () => {
    setIsCustomerDialogOpen(false);
    if (onOrderComplete && !orderData) onOrderComplete();
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-full">
      {isCustomerDialogOpen && (
        <CustomerStaffDialog
          isOpen={isCustomerDialogOpen}
          onClose={handleDialogClose}
          onSubmit={(data) => {
            setOrderData(data);
            setIsCustomerDialogOpen(false);
          }}
          tableNumber={preselectedTables.join(', ')}
        />
      )}

      {!isCustomerDialogOpen && (
        <div className="flex flex-col h-full space-y-4">
          <div className="shrink-0">
            <SearchFilterBar 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm} 
                selectedCategory={selectedCategory} 
                onCategoryChange={setSelectedCategory} 
                categories={categories}
                cartItemCount={totalCartItems}
                onViewCartClick={onGoToCart}
            />
          </div>

          <div className="flex-1 overflow-auto">
            <ProductGrid 
              products={paginatedProducts} // Gunakan data yang sudah dipaginasi
              getQuantityInCart={getTotalQuantityInCartForProduct} 
              onProductClick={onProductClick} 
              onQuantityChange={() => {}} 
            />
          </div>
          
          {/* --- FITUR BARU: Tampilkan Navigasi Paginasi --- */}
          {totalPages > 1 && (
            <div className='shrink-0'>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                <PaginationPrevious href="#" />
                            </Button>
                        </PaginationItem>
                        <PaginationItem className="font-medium">
                            Halaman {currentPage} dari {totalPages}
                        </PaginationItem>
                        <PaginationItem>
                             <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                <PaginationNext href="#" />
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
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
        onAddToCart={onAddToCartFromPopup} 
      />
    </div>
  );
}