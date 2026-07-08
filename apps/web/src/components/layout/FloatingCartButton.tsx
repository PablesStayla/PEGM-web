'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Package, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatCLP } from '@/lib/format';
import { useCartStore } from '@/store';

/**
 * Botón flotante de carrito para mobile.
 * Aparece cuando hay productos en el carrito.
 * Abre el slide-over cart en lugar de navegar a /cart.
 */
export function FloatingCartButton() {
  const { getItemCount, total, toggleCart } = useCartStore();
  const [hasMounted, setHasMounted] = useState(false);
  const count = hasMounted ? getItemCount() : 0;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-4 right-4 z-40 md:hidden"
        >
          <button
            type="button"
            onClick={toggleCart}
            className="flex items-center justify-between w-full bg-[#1a4d2e] hover:bg-[#2d6a4f] active:bg-[#081c15] text-white rounded-2xl px-5 py-4 shadow-xl shadow-[#1a4d2e]/30 transition-colors"
            aria-label={`Abrir carrito (${count} producto${count !== 1 ? 's' : ''})`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-prana-gold text-[#081c15] text-xs font-bold">
                  {count}
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold leading-tight">
                  {count} {count === 1 ? 'producto' : 'productos'}
                </span>
                <span className="text-xs text-white/60">Ver carrito</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{formatCLP(total)}</span>
              <Package className="h-5 w-5 text-white/40" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
