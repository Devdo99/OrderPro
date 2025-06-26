// src/components/ProductCard.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StockItem } from '@/types';
import { Package, Plus, Minus, ShoppingCart, ListPlus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ProductCardProps {
  product: StockItem;
  availableStock: number;
  quantityInCart: number;
  onQuantityChange: (quantity: number) => void;
  onProductClick: () => void;
}

export default function ProductCard({ product, availableStock, quantityInCart, onQuantityChange, onProductClick }: ProductCardProps) {
  const isOutOfStock = availableStock === 0;
  const isLowStock = availableStock > 0 && availableStock <= (product.min_stock || 0);
  const hasVariants = product.variants && product.variants.length > 0;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.quantity-controls')) {
      return;
    }
    if (isOutOfStock) {
      toast({
          title: "Stok Habis",
          description: `Produk "${product.name}" tidak dapat dibuat saat ini.`,
          variant: "destructive",
      });
      return;
    }
    onProductClick();
  };

  return (
    <Card
      className={`group transition-all duration-200 hover:shadow-lg hover:scale-105 ${
        isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      } ${quantityInCart > 0 ? 'ring-2 ring-orange-500 bg-orange-50' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col h-full">
          <div className="relative w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center group-hover:from-orange-50 group-hover:to-orange-100 transition-colors">
            <Package className="h-10 w-10 text-gray-400 group-hover:text-orange-500 transition-colors" />
            
            {!isOutOfStock && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <div className="bg-white rounded-full p-2 shadow-lg">
                  {hasVariants ? (
                    <ListPlus className="h-5 w-5 text-orange-600" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 text-orange-600" />
                  )}
                </div>
              </div>
            )}

            {quantityInCart > 0 && (
              <div className="absolute -top-2 -right-2 bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{quantityInCart}</div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-orange-700 transition-colors">{product.name}</h3>
            <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">{product.category}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Stok: <span className="font-medium">~{availableStock}</span></span>
              {isLowStock && (<span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">Menipis</span>)}
              {isOutOfStock && (<span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Habis</span>)}
            </div>
          </div>
          
          {quantityInCart > 0 && !hasVariants && (
            <div className="quantity-controls flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onQuantityChange(Math.max(0, quantityInCart - 1)); }} className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300"><Minus className="h-3 w-3" /></Button>
                <span className="w-8 text-center text-sm font-bold text-orange-600">{quantityInCart}</span>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onQuantityChange(Math.min(availableStock, quantityInCart + 1)); }} disabled={quantityInCart >= availableStock} className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-300"><Plus className="h-3 w-3" /></Button>
              </div>
              <span className="text-xs text-gray-500 bg-orange-100 px-2 py-1 rounded">{product.unit}</span>
            </div>
          )}
          
          {!isOutOfStock && quantityInCart === 0 && (
            <div className="mt-3 text-center">
              <div className="text-xs text-gray-400 group-hover:text-orange-500 transition-colors flex items-center justify-center gap-1">
                {hasVariants ? (
                    <><ListPlus className="h-3 w-3" />Klik untuk pilih varian</>
                ) : (
                    <><ShoppingCart className="h-3 w-3" />Klik untuk tambah</>
                )}
              </div>
            </div>
          )}

          {quantityInCart > 0 && hasVariants && (
              <div className="mt-3 text-center">
                  <div className="text-xs text-orange-600 font-semibold flex items-center justify-center gap-1 bg-orange-100 p-2 rounded-md">
                      <ListPlus className="h-3 w-3" />
                      Klik untuk atur varian
                  </div>
              </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}