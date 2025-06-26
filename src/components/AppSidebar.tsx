// src/components/AppSidebar.tsx
import { Settings, FileText, ShoppingCart, List, Wheat, Utensils, Home, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { useApp } from '@/contexts/AppContext';
import { Button } from './ui/button';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Buat Pesanan', url: '/orders', icon: ShoppingCart },
  { title: 'Daftar Pesanan', url: '/order-list', icon: List },
];

const masterDataItems = [
    { title: 'Produk', url: '/products', icon: Utensils },
    { title: 'Bahan', url: '/ingredients', icon: Wheat },
]

const otherMenuItems = [
    { title: 'Laporan', url: '/reports', icon: FileText, adminOnly: true },
    { title: 'Pengaturan', url: '/settings', icon: Settings, adminOnly: true },
]

export function AppSidebar() {
  const { auth, profile } = useApp(); // <-- Ambil profile dari context

  const handleLogout = async () => {
      await auth.signOut();
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) => `flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${ isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-inner' : 'hover:bg-sidebar-accent/20 text-sidebar-foreground/80 hover:text-sidebar-foreground'}`;
  
  return (
    <Sidebar className="w-64 transition-all duration-300 bg-sidebar border-r border-sidebar-border shadow-lg flex flex-col">
        {/* ... (Header sidebar tetap sama) ... */}
      
      <SidebarContent className="p-3 flex-1">
          {/* ... (Grup Menu Utama & Master Data tetap sama) ... */}
          
          <div className="px-3 py-4">
            <hr className="border-sidebar-border" />
          </div>

          <SidebarGroup>
              <SidebarMenu className="space-y-1">
                {otherMenuItems
                    .filter(item => !item.adminOnly || profile?.role === 'admin') // <-- LOGIKA PEMBATASAN AKSES
                    .map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <NavLink to={item.url} className={getNavCls}>
                            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                            <span className="truncate">{item.title}</span>
                        </NavLink>
                    </SidebarMenuItem>
                ))}
              </SidebarMenu>
          </SidebarGroup>
      </SidebarContent>

      <div className="p-4 mt-auto border-t border-sidebar-border">
          {/* ... (Tombol Logout tetap sama) ... */}
      </div>
    </Sidebar>
  );
}