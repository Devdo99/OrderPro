// src/types/index.ts

export interface RecipeItem {
  ingredientId: string;
  quantityNeeded: number;
}

export interface ProductVariant {
  name: string;
  recipeModifier?: RecipeItem[];
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

export interface OrderItem {
  id: string; 
  stockId: string;
  stockName: string;
  quantity: number;
  unit: string;
  notes?: string;
  orderType?: string;
  variantName?: string; 
}

export interface Order {
  id: string;
  createdAt: Date; 
  orderNumber: string;
  items: OrderItem[];
  totalItems: number;
  status: 'pending' | 'completed' | 'cancelled' | 'archived';
  customer?: string;
  tableNumber?: string;
  staffName?: string;
  notes?: string;
  orderType?: string;
}

export interface Table {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved' | 'recently_completed';
  capacity: number;
  orderId?: string;
}

export interface AppSettings {
  restaurantName: string;
  address: string;
  phone: string;
  currency: string;
  receiptFooter: string;
  orderTypes: string[];
  numberOfTables: number;
  defaultStaffName: string;
  staffList: string[]; 
  paperSize: '58mm' | '80mm';
  enableCheckboxReceipt: boolean;
  autoPrintReceipt: boolean;
  bluetoothPrinter: string;
  autoBackup: boolean;
  theme: 'light' | 'dark' | 'system';
  printCopies: number;
  enablePackageMenu: boolean;
  packageCategories: string[];
  reportsPassword?: string;
}