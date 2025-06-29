// src/components/ProductCard.tsx

import { Card, CardContent } from '@/components/ui/card';
import { StockItem } from '@/types';
import { Package, ListPlus, ShoppingCart } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ProductCardProps {
  product: StockItem;
  onProductClick: () => void;
}

export default function ProductCard({ product, onProductClick }: ProductCardProps) {
  const { getProducibleQuantity } = useApp();
  const availableStock = getProducibleQuantity(product.id);
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= (product.min_stock || 0);
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <Card
      onClick={onProductClick}
      className={`group transition-all duration-200 hover:shadow-lg hover:border-primary border-2 border-transparent flex flex-col min-h-[220px] ${
        isOutOfStock ? 'opacity-60 cursor-not-allowed bg-secondary' : 'cursor-pointer bg-card'
      }`}
    >
      <CardContent className="p-3 flex flex-col flex-1">
        <div className="relative w-full h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center group-hover:from-orange-50 group-hover:to-orange-100 transition-colors">
          <Package className="h-10 w-10 text-gray-400 group-hover:text-orange-500 transition-colors" />
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <div className="bg-white rounded-full p-2 shadow-lg">
                {hasVariants ? <ListPlus className="h-5 w-5 text-orange-600" /> : <ShoppingCart className="h-5 w-5 text-orange-600" />}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1 flex flex-col">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-orange-700 transition-colors flex-1">{product.name}</h3>
          <p className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full inline-block self-start">{product.category}</p>
          <div className="text-xs text-foreground">
            Stok: <span className={`font-bold ${isLowStock ? 'text-amber-600' : ''} ${isOutOfStock ? 'text-red-600' : ''}`}>~{availableStock}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}