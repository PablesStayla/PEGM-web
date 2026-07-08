'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatCLP } from '@/lib/format';
import { useCartStore } from '@/store';

export function SlideOverCart() {
  const { items, isOpen, total, toggleCart, removeItem, updateQuantity, getItemCount } =
    useCartStore();
  const [hasMounted, setHasMounted] = useState(false);
  const count = hasMounted ? getItemCount() : 0;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        toggleCart();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, toggleCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={toggleCart}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed right-0 top-0 bottom-0 z-[61] w-full max-w-md cart-glass shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-prana-green" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tu Carrito</h2>
                {count > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-prana-green/10 text-prana-green text-xs font-bold">
                    {count}
                  </span>
                )}
              </div>
              <button
                onClick={toggleCart}
                className="rounded-full h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/10 transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="w-20 h-20 rounded-full bg-prana-green/5 flex items-center justify-center mb-4">
                      <ShoppingBag className="h-8 w-8 text-prana-green/30" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Tu carrito está vacío
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Descubre nuestros productos premium para tu cultivo indoor
                    </p>
                    <Link
                      href="/products"
                      onClick={() => toggleCart()}
                      className="btn-prana-primary inline-flex items-center justify-center gap-2"
                    >
                      Explorar Productos
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                </div>
              ) : (
                <ul className="divide-y divide-white/10">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const productImage = item.product.images?.[0] ?? null;
                      return (
                        <motion.li
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="px-6 py-4"
                        >
                          <div className="flex gap-4">
                            {/* Image */}
                            <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden glass-morphism border-white/20">
                              {productImage ? (
                                <Image
                                  src={productImage}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                  <ShoppingBag className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {item.product.name}
                              </h4>
                              {item.variant && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {item.variant}
                                </p>
                              )}
                              <p className="text-sm font-bold text-prana-green mt-1">
                                {formatCLP(item.product.price)}
                              </p>

                              {/* Quantity controls */}
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:bg-white/10 transition-colors"
                                    aria-label="Disminuir cantidad"
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>
                                  <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:bg-white/10 transition-colors"
                                    aria-label="Aumentar cantidad"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                  aria-label={`Eliminar ${item.product.name}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/10 px-6 py-6 space-y-4 bg-prana-green/5">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Total Estimado
                  </span>
                  <span className="text-2xl font-bold text-prana-green">{formatCLP(total)}</span>
                </div>

                {/* Free shipping notice */}
                {total < 80000 && (
                  <div className="bg-prana-green/5 rounded-xl px-4 py-3 border border-prana-green/10">
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                      Añade{' '}
                      <span className="font-bold text-prana-green">{formatCLP(80000 - total)}</span>{' '}
                      para <span className="text-prana-green font-semibold">Envío Gratis</span>
                    </p>
                    <div className="relative h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-linear-to-r from-prana-green to-prana-green-dark rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((total / 80000) * 100, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}
                {total >= 80000 && (
                  <div className="bg-prana-green/10 rounded-xl px-4 py-3 text-center border border-prana-green/20">
                    <p className="text-xs font-bold text-prana-green uppercase tracking-wider">
                      ✨ Envío gratis incluido ✨
                    </p>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3 pt-2">
                  <Link
                    href="/checkout"
                    onClick={() => toggleCart()}
                    className="flex items-center justify-center gap-2 w-full bg-linear-to-r from-prana-gold to-prana-gold-dark text-black font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(197,160,89,0.3)] hover:shadow-[0_8px_30px_rgba(197,160,89,0.4)] transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm uppercase tracking-widest"
                  >
                    Finalizar Compra
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => toggleCart()}
                    className="flex items-center justify-center w-full text-gray-500 hover:text-prana-green dark:text-gray-400 dark:hover:text-prana-green py-2 rounded-xl text-xs font-medium transition-colors uppercase tracking-widest"
                  >
                    Revisar Carrito Completo
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
