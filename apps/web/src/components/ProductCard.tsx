'use client';

import { Badge } from '@pranakaia/ui';
import { motion } from 'framer-motion';
import { Eye, ShoppingCart, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useCallback, useState } from 'react';
import { scaleUp } from '@/lib/animations';
import { formatCLP, formatDiscount } from '@/lib/format';
import { useCartActions } from '@/store/selectors';
import type { Product } from '@/types';
import { ComparisonButton } from './comparison/ComparisonButton';
import { QuickViewModal } from './lazy'; // Lazy-loaded for better performance
import { StockBadge } from './product/StockBadge';
import { WishlistButton } from './wishlist/WishlistButton';

interface ProductCardProps {
  product: Product;
}

// Memoized to prevent re-renders when parent updates
export const ProductCard = memo(function ProductCard({ product }: Readonly<ProductCardProps>) {
  const { name, price } = product;
  const imageUrl = product.image || product.images?.[0] || '/placeholder-product.jpg';
  const discountBadge = product.originalPrice ? formatDiscount(product.originalPrice, price) : null;
  const [showQuickView, setShowQuickView] = useState(false);
  const { addItem } = useCartActions();

  // Memoize callbacks to prevent re-creating on every render
  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowQuickView(true);
  }, []);

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      addItem(product, 1);
    },
    [addItem, product],
  );

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        whileHover="hover"
        variants={scaleUp}
        data-testid="product-card"
        className="group relative"
      >
        <Link
          href={`/products/${product.slug}`}
          className="block relative overflow-hidden rounded-2xl border border-white/10 glass-morphism transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(74,222,128,0.1)]"
        >
          {/* Action Buttons Overlay */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <div className="glass-morphism rounded-full p-2.5 shadow-xl border-white/30 hover:scale-110 transition-transform">
              <WishlistButton product={product} size="sm" />
            </div>
            <div className="glass-morphism rounded-full p-2.5 shadow-xl border-white/30 hover:scale-110 transition-transform">
              <ComparisonButton product={product} size="sm" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {product.featured && (
              <Badge className="bg-linear-to-r from-prana-gold to-prana-gold-dark text-black font-bold border-none shadow-lg px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                Coleccionista
              </Badge>
            )}
            {discountBadge && (
              <Badge variant="destructive" className="font-bold shadow-lg px-3 py-1">
                {discountBadge}
              </Badge>
            )}
          </div>

          <div className="aspect-square overflow-hidden relative">
            <Image
              src={imageUrl}
              alt={name}
              width={500}
              height={500}
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
              sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmZGY0Ii8+PC9zdmc+"
              priority={false}
              quality={85}
              loading="lazy"
            />

            {/* Quick Actions on Hover */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <button
                  type="button"
                  onClick={handleQuickView}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 backdrop-blur-md text-white border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  <Eye className="w-4 h-4 text-prana-gold" />
                  GOCE RÁPIDO
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  aria-label={`Agregar ${name} al carrito`}
                  className="flex items-center justify-center p-3 bg-prana-gold text-black rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-sm font-black text-white uppercase tracking-widest line-clamp-2 leading-tight min-h-10 group-hover:text-prana-gold transition-colors duration-500">
              {name}
            </h3>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-xl font-black text-prana-gold tracking-tighter">
                  {formatCLP(price)}
                </p>
                {product.originalPrice && product.originalPrice > price && (
                  <p className="text-xs text-gray-400 line-through">
                    {formatCLP(product.originalPrice)}
                  </p>
                )}
              </div>

              {product.stock !== undefined && <StockBadge stock={product.stock} />}
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
});
