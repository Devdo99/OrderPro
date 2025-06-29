// src/pages/Settings.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { Save, Loader2, Users, Plus, Trash2, Bluetooth, AlertCircle, Printer, XCircle, Zap, ZapOff } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Settings() {
  const appContext = useApp();
  
  if (!appContext || !appContext.profile) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Memuat pengaturan...</p>
      </div>
    );
  }

  const { 
    settings, updateSettings, addStaff, removeStaff, 
    connectBluetoothPrinter, disconnectPrinter, reconnectPrinter,
    activePrinters, savedPrinters, isReconnectingPrinter, profile 
  } = appContext;
  
  const userRole = profile.role?.toUpperCase() || 'EMPLOYEE';

  const [formData, setFormData] = useState(appContext.settings);
  const [newStaffName, setNewStaffName] = useState('');
  const [btError, setBtError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.bluetooth) {
        setBtError("Web Bluetooth tidak didukung di browser ini. Gunakan Google Chrome.");
    } else if (!window.isSecureContext) {
        setBtError("Fitur Bluetooth hanya berfungsi di koneksi aman (localhost atau https).");
    } else {
        setBtError(null);
    }
  }, []);

  useEffect(() => {
    if (appContext.settings) {
      setFormData(appContext.settings);
    }
  }, [appContext.settings]);

  const handleSave = () => {
    updateSettings(formData);
  };
  
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStaffName.trim() && !formData.staffList.includes(newStaffName.trim())) {
      addStaff(newStaffName.trim());
      setNewStaffName('');
    }
  };

  const handleRemoveStaff = (nameToRemove: string) => {
    removeStaff(nameToRemove);
  };
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {userRole === 'MANAGER' && (
        <>
            <Card>
                <CardHeader><CardTitle>Informasi Restoran</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                <div><Label>Nama Restoran</Label><Input value={formData.restaurantName} onChange={(e) => setFormData(p => ({ ...p!, restaurantName: e.target.value }))} /></div>
                <div><Label>Alamat</Label><Textarea value={formData.address} onChange={(e) => setFormData(p => ({ ...p!, address: e.target.value }))} /></div>
                <div><Label>Nomor Telepon</Label><Input value={formData.phone} onChange={(e) => setFormData(p => ({ ...p!, phone: e.target.value }))} /></div>
                <div><Label>Jumlah Meja</Label><Input type="number" min={0} value={formData.numberOfTables} onChange={(e) => setFormData(p => ({ ...p!, numberOfTables: Number(e.target.value) }))} /></div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Manajemen Staff</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                    <Label htmlFor="defaultStaff">Staff Default</Label>
                    <Select value={formData.defaultStaffName || ''} onValueChange={(value) => setFormData(p => ({ ...p!, defaultStaffName: value }))}>
                        <SelectTrigger id="defaultStaff"><SelectValue /></SelectTrigger>
                        <SelectContent>{formData.staffList.map(staff => <SelectItem key={staff} value={staff}>{staff}</SelectItem>)}</SelectContent>
                    </Select>
                    </div>
                    <div className="space-y-2">
                    <Label>Daftar Staff</Label>
                    {formData.staffList.length > 0 ? (
                        <div className="space-y-2 rounded-lg border p-3">
                        {formData.staffList.map(staff => (
                            <div key={staff} className="flex items-center justify-between">
                            <span>{staff}</span>
                            <Button size="sm" variant="ghost" onClick={() => handleRemoveStaff(staff)} disabled={formData.staffList.length <= 1}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                            </div>
                        ))}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">Belum ada staff.</p>}
                    </div>
                    <form onSubmit={handleAddStaff} className="flex items-end gap-2">
                    <div className="flex-1">
                        <Label htmlFor="newStaffName">Tambah Staff Baru</Label>
                        <Input id="newStaffName" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} placeholder="Nama staff baru"/>
                    </div>
                    <Button type="submit"><Plus className="mr-2 h-4 w-4"/> Tambah</Button>
                    </form>
                </CardContent>
            </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Printer className="h-5 w-5" />Pengaturan Cetak</CardTitle>
          <CardDescription>Kelola printer dan pengaturan cetak struk.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {userRole === 'MANAGER' && (
                <>
                    <div>
                        <Label htmlFor="receiptFooter">Teks Footer Struk</Label>
                        <Input id="receiptFooter" value={formData.receiptFooter || ''} onChange={(e) => setFormData(p => ({ ...p!, receiptFooter: e.target.value }))} placeholder="Contoh: Terima kasih!"/>
                    </div>
                    <div>
                        <Label htmlFor="paperSize">Ukuran Kertas Printer</Label>
                        <Select value={formData.paperSize} onValueChange={(value: '58mm' | '80mm') => setFormData(p => ({...p!, paperSize: value}))}>
                            <SelectTrigger id="paperSize"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="58mm">58mm</SelectItem>
                                <SelectItem value="80mm">80mm</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="autoPrint" className="flex flex-col gap-1">
                        <span>Cetak Struk Otomatis</span>
                        <span className="font-normal text-sm text-muted-foreground">Otomatis cetak setelah pesanan disimpan.</span>
                    </Label>
                    <Switch id="autoPrint" checked={formData.autoPrintReceipt} onCheckedChange={(checked) => setFormData(p => ({ ...p!, autoPrintReceipt: checked }))} />
                    </div>
                </>
            )}
           
           <div>
              <Label>Printer Bluetooth</Label>
              <div className='space-y-2 mt-2'>
                {isReconnectingPrinter && (
                   <div className="flex items-center justify-center p-3 bg-gray-100 text-gray-800 rounded-lg border">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                      <span>Mencari printer tersimpan...</span>
                   </div>
                )}

                {/* --- TAMPILAN BARU: Daftar Printer Tersimpan --- */}
                {savedPrinters.length > 0 ? (
                    <div className="space-y-2 border rounded-lg p-3">
                        {savedPrinters.map(p => {
                            const isActive = activePrinters.some(ap => ap.device.id === p.id);
                            return (
                                <div key={p.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bluetooth className={`h-4 w-4 ${isActive ? 'text-green-600' : 'text-muted-foreground'}`}/>
                                        <span className='font-medium'>{p.name || 'Printer Tanpa Nama'}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                                            {isActive ? 'Terhubung' : 'Terputus'}
                                        </span>
                                    </div>
                                    {isActive ? (
                                        <Button size="sm" variant="destructive" onClick={() => disconnectPrinter(p.id)}><ZapOff className="mr-2 h-4 w-4"/>Putuskan</Button>
                                    ) : (
                                        <Button size="sm" variant="outline" onClick={() => reconnectPrinter(p)}><Zap className="mr-2 h-4 w-4"/>Sambungkan Ulang</Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-sm text-center text-muted-foreground p-4 border-dashed border-2 rounded-lg">
                        Tidak ada printer yang pernah terhubung.
                    </div>
                )}
                
                <Button onClick={connectBluetoothPrinter} variant="outline" className="w-full" disabled={!!btError}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Hubungkan Printer Baru
                </Button>
              </div>

              {btError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Tombol Tidak Aktif</AlertTitle>
                  <AlertDescription>{btError}</AlertDescription>
                </Alert>
              )}
          </div>
        </CardContent>
      </Card>
      
      {userRole === 'MANAGER' && (
        <div className="flex justify-center">
            <Button onClick={handleSave} size="lg"><Save className="mr-2" /> Simpan Semua Pengaturan</Button>
        </div>
      )}
    </div>
  );
}