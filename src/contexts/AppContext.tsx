// src/contexts/AppContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { StockItem, Order, OrderItem, AppSettings, Table, RecipeItem, ProductVariant } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateReceiptBytes } from '@/utils/printerUtils';
import { Database } from '@/integrations/supabase/types';
import { RealtimePostgresChangesPayload, Session, AuthError, User } from '@supabase/supabase-js';

type Profile = Database['public']['Tables']['profiles']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];
type StockRow = Database['public']['Tables']['stocks']['Row'];

interface ActivePrinter {
  device: BluetoothDevice;
  server: BluetoothRemoteGATTServer;
  characteristic: BluetoothRemoteGATTCharacteristic;
}

interface AppContextType {
    session: Session | null;
    profile: Profile | null;
    stocks: StockItem[];
    orders: Order[];
    settings: AppSettings;
    tables: Table[];
    staffList: string[];
    activePrinters: ActivePrinter[];
    isLoading: boolean;
    addStock: (stockData: Omit<StockItem, 'id' | 'created_at' | 'last_updated'>) => Promise<void>;
    updateStock: (id: string, updates: Partial<Omit<StockItem, 'id' | 'created_at' | 'last_updated'>>) => Promise<void>;
    deleteStock: (id: string) => Promise<void>;
    bulkImportStocks: (stocksData: Omit<StockItem, 'id' | 'created_at' | 'last_updated'>[]) => Promise<void>;
    addOrder: (items: OrderItem[], customer?: string, tableNumbers?: string[], staffName?: string, orderNotes?: string, orderType?: string) => Promise<void>;
    updateOrderStatus: (orderId: string, newStatus: Order['status']) => Promise<void>;
    updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
    addStaff: (name: string) => Promise<void>;
    removeStaff: (name: string) => Promise<void>;
    printReceipt: (order: Order) => Promise<boolean>;
    connectBluetoothPrinter: () => Promise<boolean>;
    disconnectPrinter: (printerId: string) => void;
    getProducibleQuantity: (productId: string) => number;
    clearTable: (orderId: string) => Promise<void>;
    transferTable: (orderId: string, newTableNumbers: string[]) => Promise<void>;
    auth: {
        signUp: (params: any) => Promise<{ data: { user: User | null; session: Session | null; }; error: AuthError | null; }>;
        signIn: (params: any) => Promise<{ data: { user: User | null; session: Session | null; }; error: AuthError | null; }>;
        signOut: () => Promise<{ error: AuthError | null }>;
    };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: AppSettings = { restaurantName: 'RestoranKu', address: 'Jl. Jenderal Sudirman No. 1', phone: '08123456789', currency: 'Rp', receiptFooter: 'Terima Kasih atas Kunjungan Anda!', numberOfTables: 10, orderTypes: ['Dine In', 'Take Away', 'Delivery'], defaultStaffName: 'Kasir', staffList: ['Kasir', 'Admin'], paperSize: '80mm', enableCheckboxReceipt: false, autoPrintReceipt: false, bluetoothPrinter: '', autoBackup: false, theme: 'system', printCopies: 1, enablePackageMenu: false, packageCategories: [], reportsPassword: 'admin', };
const mapOrderRowToOrder = (row: OrderRow): Order => ({ id: row.id, orderNumber: row.order_number, createdAt: new Date(row.created_at), items: (row.items as unknown as OrderItem[]) || [], totalItems: row.total_items || 0, status: (row.status as Order['status']) || 'pending', customer: row.customer || undefined, tableNumber: row.table_number || undefined, staffName: row.staff_name || undefined, notes: row.notes || undefined, orderType: row.order_type || undefined, });
const mapStockRowToStockItem = (row: StockRow): StockItem => ({ ...row, type: row.type as 'BAHAN' | 'PRODUK', category: row.category || '', unit: row.unit || '', recipe: (row.recipe as unknown as RecipeItem[]) || null, variants: (row.variants as unknown as ProductVariant[]) || null, });

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [activePrinters, setActivePrinters] = useState<ActivePrinter[]>([]);

  const fetchAppData = useCallback(async () => {
    try {
      const [settingsRes, stocksRes, ordersRes] = await Promise.all([
        supabase.from('settings').select('data').limit(1).single(),
        supabase.from('stocks').select('*'),
        supabase.from('orders').select('*').order('created_at', { ascending: false })
      ]);
      if (settingsRes.data?.data) setSettings({ ...defaultSettings, ...(settingsRes.data.data as unknown as AppSettings) });
      if (stocksRes.data) setStocks(stocksRes.data.map(mapStockRowToStockItem));
      if (ordersRes.data) setOrders(ordersRes.data.map(mapOrderRowToOrder));
    } catch (error: any) {
      toast({ title: "Gagal memuat data aplikasi", description: error.message, variant: "destructive" });
    }
  }, []);

  useEffect(() => {
    const bootstrapApp = async () => {
      setIsLoading(true);
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      if (initialSession) {
        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', initialSession.user.id).single();
        setProfile(userProfile);
        await fetchAppData();
      }
      setIsLoading(false);
    };
    bootstrapApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', newSession.user.id).single();
        setProfile(userProfile);
      } else {
        setProfile(null);
        setOrders([]);
        setStocks([]);
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchAppData]);
  
  useEffect(() => {
    if (!session) return;
    const handleRealtimeUpdate = () => fetchAppData();
    const channel = supabase.channel('public-db-changes').on('postgres_changes', { event: '*', schema: 'public' }, handleRealtimeUpdate).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session, fetchAppData]);
  
  useEffect(() => {
    if(session){
        setTables(Array.from({ length: settings.numberOfTables || 0 }, (_, i) => ({ id: `${i + 1}`, number: `${i + 1}`, status: 'available', capacity: 4 })));
    }
  }, [settings.numberOfTables, session]);

  const addStock = async (stockData: Omit<StockItem, 'id' | 'created_at' | 'last_updated'>) => { await supabase.from('stocks').insert({ ...stockData } as any); };
  const updateStock = async (id: string, updates: Partial<Omit<StockItem, 'id' | 'created_at' | 'last_updated'>>) => { await supabase.from('stocks').update({ ...updates, last_updated: new Date().toISOString() } as any).eq('id', id); };
  const deleteStock = async (id: string) => { await supabase.from('stocks').delete().eq('id', id); };
  const bulkImportStocks = async (stocksData: Omit<StockItem, 'id' | 'created_at' | 'last_updated'>[]) => { await supabase.from('stocks').insert(stocksData as any); };
  const getProducibleQuantity = useCallback((productId: string): number => { const product = stocks.find(s => s.id === productId); if (!product || !product.recipe || product.recipe.length === 0) return 999; let maxProducible = Infinity; for (const recipeItem of product.recipe) { const ingredient = stocks.find(s => s.id === recipeItem.ingredientId); if (!ingredient) return 0; const producibleFromThis = Math.floor(ingredient.current_stock / recipeItem.quantityNeeded); if (producibleFromThis < maxProducible) maxProducible = producibleFromThis; } return maxProducible === Infinity ? 0 : maxProducible; }, [stocks]);
  
  const addOrder = async (items: OrderItem[], customer?: string, tableNumbers?: string[], staffName?: string, orderNotes?: string, orderType?: string) => {
    const orderNumber = `ORD-${Date.now()}`;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const newOrder: Omit<OrderRow, 'id' | 'created_at'> = { order_number: orderNumber, items: items as any, total_items: totalItems, status: 'pending', customer, table_number: tableNumbers?.join(','), staff_name: staffName || settings.defaultStaffName, notes: orderNotes, order_type: orderType, };
    const { data, error } = await supabase.from('orders').insert(newOrder).select().single();
    if (error) { toast({ title: 'Gagal menyimpan pesanan', description: error.message, variant: 'destructive' }); return; }
    if (settings.autoPrintReceipt && data) {
      for (let i = 0; i < (settings.printCopies || 1); i++) {
        await printReceipt(mapOrderRowToOrder(data));
      }
    }
  };
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => { await supabase.from('orders').update({ status: newStatus }).eq('id', orderId); };
  const transferTable = async (orderId: string, newTableNumbers: string[]) => { await supabase.from('orders').update({ table_number: newTableNumbers.join(',') }).eq('id', orderId); };
  const updateSettings = async (updates: Partial<AppSettings>) => { const newSettings = { ...settings, ...updates }; await supabase.from('settings').update({ data: newSettings as any }).eq('id', 1); };
  const addStaff = async (name: string) => { if (!name.trim()) return; const newStaffList = [...(settings.staffList || []), name.trim()]; await updateSettings({ staffList: newStaffList }); };
  const removeStaff = async (name: string) => { if ((settings.staffList || []).length <= 1) { toast({ title: "Tidak bisa menghapus", description: "Harus ada minimal satu staff.", variant: "destructive" }); return; } const newStaffList = (settings.staffList || []).filter(s => s !== name); const newSettings: Partial<AppSettings> = { staffList: newStaffList }; if (settings.defaultStaffName === name) newSettings.defaultStaffName = newStaffList[0] || ''; await updateSettings(newSettings); };
  const disconnectPrinter = useCallback((printerId: string) => { setActivePrinters(prev => prev.filter(p => p.device.id !== printerId)); }, []);
  const clearTable = async (orderId: string) => { await supabase.from('orders').update({ status: 'archived' as any }).eq('id', orderId); };
  const connectBluetoothPrinter = async (): Promise<boolean> => { /* ... */ return false };
  const printReceipt = async (order: Order): Promise<boolean> => { /* ... */ return false };

  const value: AppContextType = {
    isLoading, session, profile, stocks, orders, tables, settings, staffList: settings.staffList || [],
    activePrinters, addStock, updateStock, deleteStock, bulkImportStocks, addOrder, updateOrderStatus,
    updateSettings, addStaff, removeStaff, printReceipt, connectBluetoothPrinter, disconnectPrinter,
    getProducibleQuantity, clearTable, transferTable,
    auth: {
        signUp: (params) => supabase.auth.signUp(params),
        signIn: (params) => supabase.auth.signInWithPassword(params),
        signOut: () => supabase.auth.signOut(),
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within a AppProvider");
  }
  return context;
};