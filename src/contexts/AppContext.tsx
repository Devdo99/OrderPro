// src/contexts/AppContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { StockItem, Order, OrderItem, AppSettings, Table, RecipeItem, ProductVariant, BoxOrder, BoxOrderItem } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateReceiptBytes, generateBoxOrderReceiptBytes } from '@/utils/printerUtils';
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
    boxOrders: BoxOrder[];
    settings: AppSettings;
    tables: Table[];
    staffList: string[];
    activePrinters: ActivePrinter[];
    isLoading: boolean;
    isAppDataLoading: boolean;
    isReconnectingPrinter: boolean;
    addStock: (stockData: Omit<StockItem, 'id' | 'created_at' | 'last_updated'>) => Promise<void>;
    updateStock: (id: string, updates: Partial<Omit<StockItem, 'id' | 'created_at' | 'last_updated'>>) => Promise<void>;
    deleteStock: (id: string) => Promise<void>;
    bulkImportStocks: (stocksData: Omit<StockItem, 'id' | 'created_at' | 'last_updated'>[]) => Promise<void>;
    addOrder: (items: OrderItem[], customer?: string, tableNumbers?: string[], staffName?: string, orderNotes?: string, orderType?: string) => Promise<void>;
    updateOrderStatus: (orderId: string, newStatus: Order['status']) => Promise<void>;
    updateBoxOrderStatus: (orderId: string, newStatus: BoxOrder['status']) => Promise<void>;
    updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
    addStaff: (name: string) => Promise<void>;
    removeStaff: (name: string) => Promise<void>;
    printReceipt: (order: Order) => Promise<boolean>;
    printBoxOrderReceipt: (order: BoxOrder) => Promise<boolean>;
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
const mapStockRowToStockItem = (row: StockRow): StockItem => ({ ...row, id: row.id, created_at: row.created_at, last_updated: row.last_updated, name: row.name, type: row.type as 'BAHAN' | 'PRODUK', category: row.category || '', unit: row.unit || '', recipe: (row.recipe as unknown as RecipeItem[]) || null, variants: (row.variants as unknown as ProductVariant[]) || null, current_stock: row.current_stock, min_stock: row.min_stock });

const SAVED_PRINTER_IDS_KEY = 'orderpal-saved-printer-ids';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppDataLoading, setIsAppDataLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [boxOrders, setBoxOrders] = useState<BoxOrder[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [activePrinters, setActivePrinters] = useState<ActivePrinter[]>([]);
  const [isReconnectingPrinter, setIsReconnectingPrinter] = useState(true);

  const fetchAppData = useCallback(async () => {
    setIsAppDataLoading(true);
    try {
      const [settingsRes, stocksRes, ordersRes, boxOrdersRes] = await Promise.all([
        supabase.from('settings').select('data').limit(1).single(),
        supabase.from('stocks').select('*'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('box_orders').select('*').order('pickup_date', { ascending: true })
      ]);
      
      if (settingsRes.data?.data) setSettings({ ...defaultSettings, ...(settingsRes.data.data as unknown as AppSettings) });
      if (stocksRes.data) setStocks(stocksRes.data.map(mapStockRowToStockItem));
      if (ordersRes.data) setOrders(ordersRes.data.map(mapOrderRowToOrder));
      if (boxOrdersRes.data) setBoxOrders(boxOrdersRes.data as unknown as BoxOrder[]);

    } catch (error: any) {
      toast({ title: "Gagal memuat data aplikasi", description: error.message, variant: "destructive" });
    } finally {
      setIsAppDataLoading(false);
    }
  }, []);

  useEffect(() => {
    const bootstrapSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      if (initialSession) {
        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', initialSession.user.id).single();
        setProfile(userProfile as Profile);
      }
      setIsLoading(false);
    };
    bootstrapSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    if (session) {
      fetchAppData();
      const handleRealtimeUpdate = (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
        console.log('Perubahan terdeteksi:', payload);
        fetchAppData();
      };
      const channel = supabase.channel('public-db-changes').on('postgres_changes', { event: '*', schema: 'public' }, handleRealtimeUpdate).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
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
      await printReceipt(mapOrderRowToOrder(data));
    }
  };
  
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => { await supabase.from('orders').update({ status: newStatus }).eq('id', orderId); };
  
  const processBoxOrderStockDeduction = async (orderId: string) => {
    toast({ title: "Memproses Stok...", description: "Mengurangi stok bahan baku untuk pesanan nasi kotak." });

    const { data: orderData, error: orderError } = await supabase
      .from('box_orders')
      .select('items')
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      toast({ title: "Gagal memproses stok", description: "Tidak dapat menemukan data pesanan.", variant: "destructive" });
      return;
    }

    const items = orderData.items as unknown as BoxOrderItem[];
    const ingredientDeductions = new Map<string, number>();

    for (const item of items) {
      const product = stocks.find(s => s.id === item.productId);
      if (product && product.recipe) {
        for (const recipeItem of product.recipe) {
          const totalNeeded = recipeItem.quantityNeeded * item.quantity;
          const currentDeduction = ingredientDeductions.get(recipeItem.ingredientId) || 0;
          ingredientDeductions.set(recipeItem.ingredientId, currentDeduction + totalNeeded);
        }
      }
    }

    for (const [ingredientId, quantityToDeduct] of ingredientDeductions.entries()) {
      const { error: rpcError } = await supabase.rpc('decrement_stock', {
        stock_id: ingredientId,
        decrement_value: quantityToDeduct
      });

      if (rpcError) {
        console.error(`Gagal mengurangi stok untuk bahan ${ingredientId}:`, rpcError);
        toast({ title: `Gagal mengurangi stok bahan`, description: rpcError.message, variant: "destructive" });
      }
    }
    toast({ title: "Stok berhasil diperbarui!" });
  };

  const updateBoxOrderStatus = async (orderId: string, newStatus: BoxOrder['status']) => {
    const { data: currentOrder } = await supabase.from('box_orders').select('status').eq('id', orderId).single();

    if (currentOrder && currentOrder.status !== 'Diproses' && newStatus === 'Diproses') {
      await processBoxOrderStockDeduction(orderId);
    }
  
    const { error } = await supabase.from('box_orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
        toast({ title: "Gagal Memperbarui Status", description: error.message, variant: "destructive" });
    } else {
        toast({ title: "Status Pesanan Diperbarui" });
        fetchAppData();
    }
  };

  const transferTable = async (orderId: string, newTableNumbers: string[]) => { await supabase.from('orders').update({ table_number: newTableNumbers.join(',') }).eq('id', orderId); };
  const updateSettings = async (updates: Partial<AppSettings>) => { const newSettings = { ...settings, ...updates }; await supabase.from('settings').update({ data: newSettings as any }).eq('id', 1); };
  const addStaff = async (name: string) => { if (!name.trim()) return; const newStaffList = [...(settings.staffList || []), name.trim()]; await updateSettings({ staffList: newStaffList }); };
  const removeStaff = async (name: string) => { if ((settings.staffList || []).length <= 1) { toast({ title: "Tidak bisa menghapus", description: "Harus ada minimal satu staff.", variant: "destructive" }); return; } const newStaffList = (settings.staffList || []).filter(s => s !== name); const newSettings: Partial<AppSettings> = { staffList: newStaffList }; if (settings.defaultStaffName === name) newSettings.defaultStaffName = newStaffList[0] || ''; await updateSettings(newSettings); };
  const clearTable = async (orderId: string) => { await supabase.from('orders').update({ status: 'archived' as any }).eq('id', orderId); };
  
  const _connectToDeviceAndSetState = useCallback(async (device: BluetoothDevice) => {
    if (!device.gatt) {
      throw new Error("GATT Server tidak ditemukan pada perangkat.");
    }
    const server = await device.gatt.connect();
    const services = await server.getPrimaryServices();
    let writableCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
    
    for (const service of services) {
      const characteristics = await service.getCharacteristics();
      for (const characteristic of characteristics) {
        if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
          writableCharacteristic = characteristic;
          break;
        }
      }
      if (writableCharacteristic) break;
    }

    if (!writableCharacteristic) {
      throw new Error("Tidak ditemukan characteristic yang bisa ditulis pada printer ini.");
    }

    const newPrinter: ActivePrinter = { device, server, characteristic: writableCharacteristic };
    
    setActivePrinters(prev => {
        const existingIds = prev.map(p => p.device.id);
        if (existingIds.includes(device.id)) return prev;
        const newActivePrinters = [...prev, newPrinter];
        
        const idsToSave = newActivePrinters.map(p => p.device.id);
        localStorage.setItem(SAVED_PRINTER_IDS_KEY, JSON.stringify(idsToSave));

        return newActivePrinters;
    });
    
    return true;
  }, []);

  const connectBluetoothPrinter = async (): Promise<boolean> => {
    if (!navigator.bluetooth) {
      toast({ title: "Web Bluetooth Tidak Tersedia", variant: "destructive" });
      return false;
    }
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
        acceptAllDevices: false,
      });
      await _connectToDeviceAndSetState(device);
      toast({ title: "Printer Terhubung", description: `Berhasil terhubung ke ${device.name || 'printer'}` });
      return true;
    } catch (error: any) {
      if (error.name !== 'NotFoundError') {
        toast({ title: "Koneksi Gagal", description: error.message, variant: "destructive" });
      }
      return false;
    }
  };
  
  const disconnectPrinter = useCallback((printerId: string) => {
    const printerToDisconnect = activePrinters.find(p => p.device.id === printerId);
    if (printerToDisconnect && printerToDisconnect.server.connected) {
      printerToDisconnect.server.disconnect();
    }
    
    const newActivePrinters = activePrinters.filter(p => p.device.id !== printerId);
    setActivePrinters(newActivePrinters);
    
    const idsToSave = newActivePrinters.map(p => p.device.id);
    localStorage.setItem(SAVED_PRINTER_IDS_KEY, JSON.stringify(idsToSave));

    toast({ title: "Koneksi Printer Diputus" });
  }, [activePrinters]);

  useEffect(() => {
    const savedIdsString = localStorage.getItem(SAVED_PRINTER_IDS_KEY);
    if (!savedIdsString) {
      setIsReconnectingPrinter(false);
      return;
    };

    const reconnect = async () => {
      if (!navigator.bluetooth?.getDevices) {
        setIsReconnectingPrinter(false);
        return;
      }
      
      console.log("Mencoba menyambung ulang ke printer tersimpan...");
      const savedIds = JSON.parse(savedIdsString) as string[];
      const permittedDevices = await navigator.bluetooth.getDevices();
      
      for(const savedId of savedIds) {
          const savedDevice = permittedDevices.find(d => d.id === savedId);
          if (savedDevice) {
            try {
              await _connectToDeviceAndSetState(savedDevice);
              toast({ title: "Printer Tersambung Otomatis", description: `Terhubung kembali ke ${savedDevice.name}` });
            } catch (error) {
              console.error("Gagal menyambung ulang otomatis:", error);
            }
          }
      }
      setIsReconnectingPrinter(false);
    };

    reconnect();
  }, [_connectToDeviceAndSetState]);
    
  const printToAllPrinters = async (data: Uint8Array) => {
    if (activePrinters.length === 0) {
        toast({ title: "Tidak Ada Printer Terhubung", variant: "destructive" });
        return false;
    }

    let allPrintedSuccessfully = true;
    const chunkSize = 100;

    for (const printer of activePrinters) {
        try {
            if (!printer.server.connected) await printer.server.connect();

            for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, i + chunkSize);
                await printer.characteristic.writeValueWithoutResponse(chunk);
            }
            console.log(`Berhasil mengirim ke printer: ${printer.device.name}`);
        } catch (error: any) {
            allPrintedSuccessfully = false;
            toast({ title: `Gagal Mencetak ke ${printer.device.name}`, description: error.message, variant: "destructive" });
            console.error(`Printing error on ${printer.device.name}:`, error);
        }
    }
    
    if (allPrintedSuccessfully) {
        toast({ title: "Berhasil Mencetak", description: `Struk dikirim ke ${activePrinters.length} printer.` });
    }
    return allPrintedSuccessfully;
  }

  const printReceipt = async (order: Order): Promise<boolean> => {
    const receiptData = await generateReceiptBytes(order, settings);
    return await printToAllPrinters(receiptData);
  };

  const printBoxOrderReceipt = async (order: BoxOrder): Promise<boolean> => {
    const receiptData = await generateBoxOrderReceiptBytes(order, settings);
    return await printToAllPrinters(receiptData);
  };

  const value: AppContextType = {
    isLoading, isAppDataLoading, session, profile, stocks, orders, boxOrders, tables, settings, staffList: settings.staffList || [],
    activePrinters, isReconnectingPrinter, addStock, updateStock, deleteStock, bulkImportStocks, addOrder, updateOrderStatus,
    updateBoxOrderStatus,
    updateSettings, addStaff, removeStaff, printReceipt, printBoxOrderReceipt, connectBluetoothPrinter, disconnectPrinter,
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