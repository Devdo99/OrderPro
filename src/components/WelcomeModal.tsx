
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Utensils } from 'lucide-react';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Utensils className="h-6 w-6 text-blue-600" />
            Selamat Datang!
          </DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Selamat datang di aplikasi manajemen restoran. 
            Aplikasi ini akan membantu Anda mengelola pesanan, stok, dan laporan dengan mudah.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Tips: Gunakan fitur auto-print untuk mencetak struk otomatis setelah menyimpan pesanan
            </p>
          </div>
          <Button onClick={handleClose} className="w-full">
            Mulai Menggunakan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
