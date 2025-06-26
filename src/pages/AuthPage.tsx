// src/pages/AuthPage.tsx

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
    const { auth } = useApp();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(''); // <-- State baru untuk nama lengkap

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await auth.signIn({ email, password });
        if (error) {
            toast({ title: "Gagal Login", description: error.message, variant: "destructive" });
        }
        setLoading(false);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await auth.signUp({ 
            email, 
            password, 
            options: {
                data: {
                    full_name: fullName // <-- Kirim nama lengkap saat mendaftar
                }
            }
        });
        if (error) {
            toast({ title: "Gagal Mendaftar", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Pendaftaran Berhasil", description: "Silakan cek email Anda untuk verifikasi." });
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
            <Tabs defaultValue="login" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Daftar</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    {/* ... (Form Login tetap sama) ... */}
                </TabsContent>
                <TabsContent value="register">
                     <form onSubmit={handleSignUp}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Buat Akun Baru</CardTitle>
                                <CardDescription>Daftarkan akun baru untuk tim Anda.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* --- INPUT BARU UNTUK NAMA LENGKAP --- */}
                                <div className="space-y-2">
                                    <Label htmlFor="full-name">Nama Lengkap</Label>
                                    <Input id="full-name" type="text" placeholder="John Doe" required value={fullName} onChange={e => setFullName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-email">Email</Label>
                                    <Input id="new-email" type="email" placeholder="email@contoh.com" required value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">Kata Sandi</Label>
                                    <Input id="new-password" type="password" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Daftarkan Akun
                                </Button>
                            </CardContent>
                        </Card>
                    </form>
                </TabsContent>
            </Tabs>
        </div>
    );
}