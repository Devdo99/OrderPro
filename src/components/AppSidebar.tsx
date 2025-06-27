// src/components/AppSidebar.tsx

import { Settings, FileText, ShoppingCart, List, Wheat, Utensils, Home, LogOut, UserCircle, Package } from 'lucide-react'; // Pastikan 'Package' di-import
import { NavLink } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { useApp } from '@/contexts/AppContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Buat Pesanan', url: '/orders', icon: ShoppingCart },
  { title: 'Daftar Pesanan', url: '/order-list', icon: List },
  { title: 'Pesanan Nasi Kotak', url: '/box-orders', icon: Package } // <-- TAMBAHKAN BARIS INI
];

const masterDataItems = [
    { title: 'Produk', url: '/products', icon: Utensils },
    { title: 'Bahan', url: '/ingredients', icon: Wheat },
]

const otherMenuItems = [
    { title: 'Laporan', url: '/reports', icon: FileText },
    { title: 'Pengaturan', url: '/settings', icon: Settings },
]

export function AppSidebar() {
  const { auth, profile, settings, isAppDataLoading } = useApp();

  const handleLogout = async () => {
      await auth.signOut();
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) => 
    `flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${ 
      isActive 
      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-inner' 
      : 'hover:bg-sidebar-accent/20 text-sidebar-foreground/80 hover:text-sidebar-foreground'
    }`;
  
  return (
    <Sidebar className="w-64 transition-all duration-300 bg-sidebar border-r border-sidebar-border shadow-lg flex flex-col">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        {isAppDataLoading ? (
            <Skeleton className="h-6 w-3/4" />
        ) : (
            <h2 className="text-xl font-semibold text-sidebar-foreground">{settings.restaurantName}</h2>
        )}
        
        {isAppDataLoading ? (
            <div className="flex items-center gap-3 mt-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        ) : profile && (
            <div className="flex items-center gap-3 mt-4">
                <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                        {(profile.full_name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold text-sidebar-foreground">{profile.full_name || 'Pengguna'}</p>
                    <p className="text-xs text-sidebar-foreground/70 capitalize">{profile.role}</p>
                </div>
            </div>
        )}
      </SidebarHeader>
      
      <SidebarContent className="p-3 flex-1">
          <SidebarGroup>
              <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
              <SidebarMenu className="space-y-1">
                  {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                          <NavLink to={item.url} className={getNavCls}>
                              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                              <span className="truncate">{item.title}</span>
                          </NavLink>
                      </SidebarMenuItem>
                  ))}
              </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
              <SidebarGroupLabel>Master Data</SidebarGroupLabel>
              <SidebarMenu className="space-y-1">
                  {masterDataItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                          <NavLink to={item.url} className={getNavCls}>
                              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                              <span className="truncate">{item.title}</span>
                          </NavLink>
                      </SidebarMenuItem>
                  ))}
              </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
              <SidebarGroupLabel>Administrasi</SidebarGroupLabel>
              <SidebarMenu className="space-y-1">
                {otherMenuItems.map((item) => (
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

      <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/20" onClick={handleLogout}>
              <LogOut className="mr-3 h-5 w-5" />
              Keluar
          </Button>
      </SidebarFooter>
    </Sidebar>
  );
}