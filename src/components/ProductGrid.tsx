import { StockItem } from '@/types';
import ProductCard from './ProductCard';
import { useApp } from '@/contexts/AppContext';

interface ProductGridProps {
  products: StockItem[]; // Ini sekarang adalah daftar produk
  getQuantityInCart: (stockId: string) => number;
  onQuantityChange: (stockId: string, quantity: number) => void;
  onProductClick: (product: StockItem) => void;
}

export default function ProductGrid({
  products,
  getQuantityInCart,
  onQuantityChange,
  onProductClick,
}: ProductGridProps) {
  const { getProducibleQuantity } = useApp();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-1">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          // --- PERUBAHAN: Kirim stok yang bisa dibuat ke kartu produk ---
          availableStock={getProducibleQuantity(product.id)}
          quantityInCart={getQuantityInCart(product.id)}
          onQuantityChange={(quantity) => onQuantityChange(product.id, quantity)}
          onProductClick={() => onProductClick(product)}
        />
      ))}
      {products.length === 0 && (
        <div className="col-span-full flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">Tidak ada produk ditemukan</p>
            <p className="text-sm">Coba ubah filter pencarian</p>
          </div>
        </div>
      )}
    </div>
  );
}