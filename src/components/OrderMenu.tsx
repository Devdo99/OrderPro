// src/components/OrderMenu.tsx

import { OrderItem, StockItem } from '@/types';
import SearchFilterBar from './SearchFilterBar';
import ProductGrid from './ProductGrid';
import OrderSummary from './OrderSummary';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface OrderMenuProps {
  cart: OrderItem[];
  onProductClick: (stock: StockItem) => void;
  products: StockItem[];
  categories: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onSubmitOrder: () => void;
  onClearOrder: () => void;
  staffList: string[];
  defaultStaffName: string;
  onStaffChange: (staff: string) => void;
  customer: string;
  onCustomerChange: (name: string) => void;
  tableNumber: string;
  onTableNumberChange: (table: string) => void;
  orderNotes: string;
  onOrderNotesChange: (notes: string) => void;
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

export default function OrderMenu(props: OrderMenuProps) {
  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={65} minSize={40}>
        <div className="flex flex-col h-full p-4 space-y-4">
          <SearchFilterBar 
            searchTerm={props.searchTerm} 
            onSearchChange={props.onSearchChange} 
            selectedCategory={props.selectedCategory} 
            onCategoryChange={props.onCategoryChange} 
            categories={props.categories}
            cartItemCount={props.cart.reduce((sum, item) => sum + item.quantity, 0)}
            onViewCartClick={props.onGoToCart}
          />
          <div className="flex-1 overflow-auto">
            <ProductGrid 
              products={props.products}
              onProductClick={props.onProductClick}
            />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={35} minSize={30}>
        <OrderSummary
          cart={props.cart}
          onUpdateQuantity={props.onUpdateQuantity}
          onSubmitOrder={props.onSubmitOrder}
          onClearOrder={props.onClearOrder}
          staffList={props.staffList}
          defaultStaffName={props.defaultStaffName}
          onStaffChange={props.onStaffChange}
          customer={props.customer}
          onCustomerChange={props.onCustomerChange}
          tableNumber={props.tableNumber}
          onTableNumberChange={props.onTableNumberChange}
          orderNotes={props.orderNotes}
          onOrderNotesChange={props.onOrderNotesChange}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}