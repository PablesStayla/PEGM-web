'use client';

import { Button } from '@pranakaia/ui';
import { Plus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store';
import type { Product } from '@/types';

interface FrequentlyBoughtTogetherProps {
  mainProduct: Product;
  suggestedProducts: Product[];
  className?: string;
}

export function FrequentlyBoughtTogether({
  mainProduct,
  suggestedProducts,
  className,
}: FrequentlyBoughtTogetherProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set([mainProduct.id, ...suggestedProducts.map((p) => p.id)]),
  );
  const { addItem } = useCartStore();

  const toggleProduct = (productId: string) => {
    if (productId === mainProduct.id) {
      return; // Main product always selected
    }

    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const allProducts = [mainProduct, ...suggestedProducts];
  const selectedProductsList = allProducts.filter((p) => selectedProducts.has(p.id));
  const totalPrice = selectedProductsList.reduce((sum, p) => sum + p.price, 0);
  const totalOriginalPrice = selectedProductsList.reduce(
    (sum, p) => sum + (p.originalPrice || p.price),
    0,
  );
  const savings = totalOriginalPrice - totalPrice;

  const handleAddAllToCart = () => {
    selectedProductsList.forEach((product) => {
      addItem(product, 1);
    });
  };

  if (suggestedProducts.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="luxury-card p-6 md:p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-prana-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase text-xs opacity-60 mb-8 tracking-[0.2em]">
          Alquimia de Cultivo (Frecuentes)
        </h3>

        {/* Products Grid */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {allProducts.map((product, index) => {
            const isSelected = selectedProducts.has(product.id);
            const isMainProduct = product.id === mainProduct.id;

            return (
              <div key={product.id} className="flex items-center gap-4">
                {/* Product Card */}
                <button
                  onClick={() => toggleProduct(product.id)}
                  disabled={isMainProduct}
                  className="relative group"
                >
                  <div
                    className={`relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-2 transition-all duration-500 ${
                      isSelected
                        ? 'border-prana-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                        : 'border-white/10 opacity-40 grayscale hover:grayscale-0'
                    } ${!isMainProduct && 'cursor-pointer hover:border-prana-gold/50'}`}
                  >
                    <Image
                      src={product.images?.[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {!isMainProduct && (
                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                          isSelected ? 'opacity-0' : 'opacity-100 bg-black/40'
                        }`}
                      >
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <Plus className="w-5 h-5 text-gray-700" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Checkbox */}
                  {!isMainProduct && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProduct(product.id)}
                        className="w-5 h-5 text-prana-gold bg-black/40 border-white/20 rounded focus:ring-prana-gold"
                      />
                    </div>
                  )}
                </button>

                {/* Plus Icon */}
                {index < allProducts.length - 1 && (
                  <Plus className="w-6 h-6 text-gray-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Products Info */}
        <div className="space-y-3 mb-8 bg-black/20 p-4 rounded-xl border border-white/5">
          {selectedProductsList.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between text-xs font-black uppercase tracking-widest"
            >
              <span className="text-prana-base-100/40 line-clamp-1">{product.name}</span>
              <span className="text-white">{formatPrice(product.price)}</span>
            </div>
          ))}
        </div>

        {/* Total and CTA */}
        <div className="border-t border-white/5 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-prana-base-100/30 mb-2">
                Valor Total de Kit ({selectedProductsList.length} items)
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-prana-gold tracking-tighter">
                  {formatPrice(totalPrice)}
                </span>
                {savings > 0 && (
                  <span className="text-sm text-prana-base-100/20 line-through font-mono">
                    {formatPrice(totalOriginalPrice)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-1 animate-pulse">
                  Ahorro de Gremio: {formatPrice(savings)}
                </p>
              )}
            </div>

            <Button onClick={handleAddAllToCart} className="btn-luxury w-full md:w-auto h-14 px-10">
              <ShoppingCart className="w-5 h-5" />
              AGREGAR KIT COMPLETO
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
