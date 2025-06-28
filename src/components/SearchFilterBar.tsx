// src/components/SearchFilterBar.tsx

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart } from 'lucide-react';

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  cartItemCount: number;
  onViewCartClick: () => void;
}

export default function SearchFilterBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  cartItemCount,
  onViewCartClick
}: SearchFilterBarProps) {
  return (
    <div className='space-y-4'>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                placeholder="Cari menu..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
                />
            </div>
            
            {cartItemCount > 0 && (
                <Button onClick={onViewCartClick} className="w-full sm:w-auto shrink-0">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Lihat Keranjang
                <Badge variant="secondary" className="ml-2">{cartItemCount}</Badge>
                </Button>
            )}
        </div>
        
        {/* --- FITUR BARU: Filter Kategori Cepat --- */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange('all')}
            >
                Semua
            </Button>
            {categories.map(category => (
                <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onCategoryChange(category)}
                    className="shrink-0"
                >
                    {category}
                </Button>
            ))}
        </div>
    </div>
  );
}