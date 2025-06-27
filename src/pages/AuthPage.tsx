// src/pages/AuthPage.tsx

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
    const { auth } = useApp();
    const [loading, setLoading] = useState(false);

    // State dipisahkan untuk setiap form agar tidak bentrok
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerFullName, setRegisterFullName] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await auth.signIn({ email: loginEmail, password: loginPassword });
        if (error) {
            toast({ title: "Gagal Login", description: error.message, variant: "destructive" });
        }
        // Tidak perlu toast sukses, karena akan otomatis redirect
        setLoading(false);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await auth.signUp({ 
            email: registerEmail, 
            password: registerPassword, 
            options: {
                data: {
                    full_name: registerFullName
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
        <div className="min-h-screen w-full flex items-center justify-center bg-secondary p-4">
            <div className="text-center absolute top-8">
                {/* Anda bisa menaruh logo di sini */}
                <h1 className="text-4xl font-bold text-primary">OrderPro</h1>
                <p className="text-muted-foreground">Manajemen Restoran Profesional</p>
            </div>
            <Tabs defaultValue="login" className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Masuk</TabsTrigger>
                    <TabsTrigger value="register">Daftar Akun</TabsTrigger>
                </TabsList>

                {/* --- FORM LOGIN --- */}
                <TabsContent value="login">
                    <Card>
                        <form onSubmit={handleLogin}>
                            <CardHeader>
                                <CardTitle>Selamat Datang Kembali</CardTitle>
                                <CardDescription>Masuk ke akun Anda untuk melanjutkan.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input id="login-email" type="email" placeholder="email@contoh.com" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="login-password">Kata Sandi</Label>
                                    <Input id="login-password" type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Masuk
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                {/* --- FORM DAFTAR --- */}
                <TabsContent value="register">
                    <Card>
                        <form onSubmit={handleSignUp}>
                            <CardHeader>
                                <CardTitle>Buat Akun Baru</CardTitle>
                                <CardDescription>Akun baru akan memiliki peran sebagai Karyawan.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="full-name">Nama Lengkap</Label>
                                    <Input id="full-name" type="text" placeholder="John Doe" required value={registerFullName} onChange={e => setRegisterFullName(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="register-email">Email</Label>
                                    <Input id="register-email" type="email" placeholder="email@contoh.com" required value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="register-password">Kata Sandi</Label>
                                    <Input id="register-password" type="password" minLength={6} placeholder="Minimal 6 karakter" required value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Daftarkan Akun
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}