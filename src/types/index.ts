// src/types/index.ts

export interface OrderItem {
  id: string;
  stockId: string;
  stockName: string;
  quantity: number;
  unit: string;
  variantName?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: Date;
  items: OrderItem[];
  totalItems: number;
  status: 'pending' | 'completed' | 'cancelled';
  customer?: string;
  tableNumber?: string;
  staffName?: string;
  notes?: string;
  orderType?: string;
}

export interface BoxOrderItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface BoxOrder {
  id: string;
  customer_name: string;
  customer_phone?: string;
  items: BoxOrderItem[];
  order_date: string;
  pickup_date: string;
  payment_status: 'lunas' | 'dp' | 'belum_bayar';
  payment_method: 'cash' | 'transfer' | 'lainnya';
  status: 'Baru' | 'Diproses' | 'Selesai' | 'Dibatalkan';
  notes?: string;
  created_at: string;
}

export interface RecipeItem {
  ingredientId: string;
  quantityNeeded: number;
}

export interface ProductVariant {
  name: string;
}

export interface StockItem {
  id: string;
  created_at: string;
  name: string;
  category: string;
  unit: string;
  last_updated: string;
  type: 'BAHAN' | 'PRODUK';
  min_stock: number;
  current_stock: number;
  recipe: RecipeItem[] | null;
  variants: ProductVariant[] | null;
}

export interface Table {
    id: string;
    number: string;
    status: 'available' | 'occupied' | 'recently_completed';
    capacity: number;
}

export interface AppSettings {
  restaurantName: string;
  address: string;
  phone: string;
  receiptFooter: string;
  numberOfTables: number;
  orderTypes: string[];
  defaultStaffName: string;
  staffList: string[];
  paperSize: '58mm' | '80mm';
  autoPrintReceipt: boolean;
  enableCheckboxReceipt: boolean;
  bluetoothPrinter: string;
  autoBackup: boolean;
  theme: 'system' | 'light' | 'dark';
  printCopies: number;
  enablePackageMenu: boolean;
  packageCategories: string[];
  reportsPassword?: string;
  // currency: string; // <-- Properti ini dihapus
}