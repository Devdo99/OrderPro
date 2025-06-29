// src/components/ProductGrid.tsx

import { StockItem } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: StockItem[];
  onProductClick: (product: StockItem) => void;
}

export default function ProductGrid({
  products,
  onProductClick,
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onProductClick={() => onProductClick(product)}
        />
      ))}
      {products.length === 0 && (
        <div className="col-span-full flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">Tidak ada produk ditemukan</p>
            <p className="text-sm">Coba ubah filter pencarian atau kategori.</p>
          </div>
        </div>
      )}
    </div>
  );
}