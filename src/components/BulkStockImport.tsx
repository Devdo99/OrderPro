// src/components/BulkStockImport.tsx

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StockItem } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface BulkStockImportProps {
  stockType: 'BAHAN' | 'PRODUK';
  onGenerateTemplate: () => void;
}

function ImportContent({ stockType, onGenerateTemplate, onFinished }: BulkStockImportProps & { onFinished: () => void }) {
    const { bulkImportStocks } = useApp();
    const [csvData, setCsvData] = useState('');

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
            const reader = new FileReader();
            reader.onload = (e) => setCsvData(e.target?.result as string);
            reader.readAsText(file);
        } else {
            toast({ title: 'Format File Salah', description: 'Silakan pilih file CSV', variant: 'destructive' });
        }
    };

    const parseCSV = (csvText: string): Omit<StockItem, 'id' | 'lastUpdated'>[] => {
        // ... (Fungsi parseCSV tetap sama)
        const lines = csvText.trim().split(/\r\n|\n/);
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        
        const headerMap: { [key: string]: number } = {};
        headers.forEach((header, index) => {
            headerMap[header] = index;
        });

        const requiredHeaders = ['name', 'category'];
        if (!requiredHeaders.every(h => headers.includes(h))) {
            toast({ title: 'Header Tidak Sesuai', description: 'Pastikan file CSV memiliki kolom "name" dan "category".', variant: 'destructive'});
            return [];
        }
        
        return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const item: any = { 
            type: stockType,
            name: values[headerMap['name']] || '',
            category: values[headerMap['category']] || '',
            unit: values[headerMap['unit']] || 'pcs',
            currentStock: parseInt(values[headerMap['currentstock']]) || 0,
            minStock: parseInt(values[headerMap['minstock']]) || 0,
        };
        
        return item;
        }).filter(item => item.name && item.category);
    };

    const handleImport = () => {
        if (!csvData) {
            toast({ title: 'Tidak Ada Data', description: 'Silakan unggah file CSV terlebih dahulu', variant: 'destructive' });
            return;
        }
        try {
            const stocksData = parseCSV(csvData);
            if (stocksData.length === 0) {
                toast({ title: 'Data Tidak Valid', description: 'Pastikan format CSV sesuai template dan berisi data', variant: 'destructive' });
                return;
            }
            bulkImportStocks(stocksData);
            toast({ title: 'Import Berhasil', description: `${stocksData.length} item berhasil ditambahkan`, });
            onFinished();
            setCsvData('');
        } catch (error) {
            toast({ title: 'Import Gagal', description: 'Terjadi kesalahan saat memproses file. Pastikan formatnya benar.', variant: 'destructive' });
            console.error("CSV Import Error:", error);
        }
    };

    return (
        <>
            <div className="space-y-4 p-4">
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                    <p>Gunakan fitur ini untuk menambah banyak {stockType === 'BAHAN' ? 'bahan' : 'produk'} sekaligus dari file CSV.</p>
                    {stockType === 'PRODUK' && <p className="font-semibold mt-1">Catatan: Resep harus ditambahkan manual setelah import.</p>}
                </div>
                <Button onClick={onGenerateTemplate} variant="outline" className="w-full"><Download className="mr-2 h-4 w-4" /> Unduh Template CSV</Button>
                <div className="space-y-2">
                    <Label htmlFor="csvFile">Unggah File CSV</Label>
                    <Input id="csvFile" type="file" accept=".csv" onChange={handleFileUpload} />
                </div>
            </div>
            <DrawerFooter className="pt-2 flex-row gap-2">
                <DrawerClose asChild><Button variant="outline" className="flex-1">Batal</Button></DrawerClose>
                <Button onClick={handleImport} disabled={!csvData} className="flex-1"><FileSpreadsheet className="mr-2 h-4 w-4" /> Import Data</Button>
            </DrawerFooter>
        </>
    );
}


export default function BulkStockImport(props: BulkStockImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const onFinished = () => setIsOpen(false);

  const DialogComponent = isMobile ? Drawer : Dialog;
  const DialogTriggerComponent = isMobile ? DrawerTrigger : DialogTrigger;
  const DialogContentComponent = isMobile ? DrawerContent : DialogContent;
  
  return (
    <DialogComponent open={isOpen} onOpenChange={setIsOpen}>
      <DialogTriggerComponent asChild>
        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import {props.stockType === 'BAHAN' ? 'Bahan' : 'Produk'}</Button>
      </DialogTriggerComponent>
      <DialogContentComponent className="sm:max-w-lg p-0 md:p-6">
        <DialogHeader className="p-4 md:p-0">
            <DialogTitle>Import Massal untuk {props.stockType === 'BAHAN' ? 'Bahan' : 'Produk'}</DialogTitle>
        </DialogHeader>
        <ImportContent {...props} onFinished={onFinished} />
      </DialogContentComponent>
    </DialogComponent>
  );
}