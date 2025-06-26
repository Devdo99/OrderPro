
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Users, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface CustomerStaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customer?: string;
    selectedStaff: string;
    orderNotes?: string;
    orderType: string;
  }) => void;
  tableNumber?: string;
}

export default function CustomerStaffDialog({ isOpen, onClose, onSubmit, tableNumber }: CustomerStaffDialogProps) {
  const { staffList, settings } = useApp();
  const [customer, setCustomer] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(settings.defaultStaffName || staffList[0] || 'Staff');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderType, setOrderType] = useState((settings.orderTypes && settings.orderTypes.length > 0) ? settings.orderTypes[0] : 'Dine In');

  const orderTypesOptions = settings.orderTypes && settings.orderTypes.length > 0 ? settings.orderTypes : ['Dine In', 'Take Away', 'Delivery'];

  const handleSubmit = () => {
    // Ensure we have a valid staff selection
    const finalStaff = selectedStaff || staffList[0] || 'Staff';
    
    console.log('Submitting customer data:', {
      customer: customer || undefined,
      selectedStaff: finalStaff,
      orderNotes: orderNotes || undefined,
      orderType
    });

    onSubmit({
      customer: customer || undefined,
      selectedStaff: finalStaff,
      orderNotes: orderNotes || undefined,
      orderType
    });
  };

  const handleClose = () => {
    setCustomer('');
    setSelectedStaff(settings.defaultStaffName || staffList[0] || 'Staff');
    setOrderNotes('');
    setOrderType((settings.orderTypes && settings.orderTypes.length > 0) ? settings.orderTypes[0] : 'Dine In');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <User className="h-7 w-7" />
            Data Pesanan {tableNumber && `- ${tableNumber}`}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Informasi Pesanan</h2>
              <p className="text-gray-600">Masukkan data pelanggan dan detail pesanan</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="orderType">Jenis Pesanan *</Label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis pesanan" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderTypesOptions.filter(type => type && type.trim() !== '').map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="staff">Staff *</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.filter(staff => staff && staff.trim() !== '').map(staff => (
                      <SelectItem key={staff} value={staff}>
                        {staff}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customer">Nama Pelanggan</Label>
                <Input
                  id="customer"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Masukkan nama pelanggan (opsional)"
                  className="text-lg p-3"
                />
              </div>

              <div>
                <Label htmlFor="orderNotes">Catatan Pesanan</Label>
                <Textarea
                  id="orderNotes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Tambahkan catatan untuk keseluruhan pesanan..."
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1 h-12">
                Batal
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1 h-12 text-lg"
                disabled={!selectedStaff || selectedStaff.trim() === ''}
              >
                Lanjutkan ke Menu
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
