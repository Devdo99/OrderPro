
import { useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PasswordProtectionProps {
  children: ReactNode;
  requiredPassword: string;
  title: string;
}

export default function PasswordProtection({ children, requiredPassword, title }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === requiredPassword) {
      setIsAuthenticated(true);
      setIsDialogOpen(false);
      setPassword('');
      toast({
        title: 'Akses Berhasil',
        description: `Selamat datang di ${title}`,
      });
    } else {
      toast({
        title: 'Sandi Salah',
        description: 'Silakan coba lagi',
        variant: 'destructive',
      });
      setPassword('');
    }
  };

  const handleAccessRequest = () => {
    if (!isAuthenticated) {
      setIsDialogOpen(true);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Lock className="h-16 w-16 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-700">Area Terbatas</h2>
        <p className="text-gray-500 text-center">
          Anda memerlukan sandi untuk mengakses {title}
        </p>
        <Button onClick={handleAccessRequest}>
          Masukkan Sandi
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Masukkan Sandi
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Sandi untuk {title}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan sandi"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Masuk
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
