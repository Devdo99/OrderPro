// src/components/Layout.tsx

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ReactNode, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center h-full">
    <div className="flex flex-col items-center gap-4 text-gray-500">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-lg font-medium">Memuat Halaman...</p>
    </div>
  </div>
);

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0"> {/* PERBAIKAN: Menambahkan min-w-0 untuk mencegah overflow */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 shadow-sm shrink-0">
            <SidebarTrigger className="mr-4 hover:bg-gray-100" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 truncate">Management Order Makanan</h2>
            </div>
            <div className="text-sm text-gray-500 hidden md:block">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </header>

          {/* PERBAIKAN: Membungkus main content dengan container yang lebih baik */}
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto w-full h-full">
                <Suspense fallback={<LoadingFallback />}>
                {children}
                </Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}