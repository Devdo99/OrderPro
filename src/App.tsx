// src/App.tsx

import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./contexts/AppContext";
import { ThemeProvider } from "./components/ThemeProvider";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

// Lazy load komponen halaman
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderListPage = lazy(() => import("./pages/OrderList"));
const Customers = lazy(() => import("./pages/Customers"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Ingredients = lazy(() => import("./pages/Ingredients"));
const Products = lazy(() => import("./pages/Products"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const BoxOrdersPage = lazy(() => import('./pages/BoxOrdersPage'));
const BoxOrderForm = lazy(() => import('./pages/BoxOrderForm')); // <-- Impor Halaman Baru

const LoadingScreen = () => (
    <div className="flex-1 flex items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
);

// Komponen baru untuk rute yang dilindungi
const ProtectedRoutes = () => {
    return (
        <Layout>
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/order-list" element={<OrderListPage />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/ingredients" element={<Ingredients />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/box-orders" element={<BoxOrdersPage />} />
                    {/* DAFTARKAN RUTE BARU DI SINI */}
                    <Route path="/box-orders/new" element={<BoxOrderForm />} /> 
                    <Route path="/stock" element={<Navigate to="/products" replace />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </Layout>
    );
};

// Komponen utama aplikasi yang mengatur rute
function AppRouter() {
    const { session, isLoading } = useApp();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <BrowserRouter future={{ v7_startTransition: true }}>
            <Routes>
                {session ? (
                    <Route path="/*" element={<ProtectedRoutes />} />
                ) : (
                    <Route path="*" element={<Suspense fallback={<LoadingScreen/>}><AuthPage /></Suspense>} />
                )}
            </Routes>
        </BrowserRouter>
    );
}

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="food-manager-theme">
    <AppProvider>
      <AppRouter />
      <ShadcnToaster />
      <SonnerToaster />
    </AppProvider>
  </ThemeProvider>
);

export default App;