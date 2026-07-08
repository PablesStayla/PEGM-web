'use client';

import { Button } from '@pranakaia/ui';
import type { Variants } from 'framer-motion';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Leaf, ShoppingCart, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '@/store';
import type { Product } from '@/types';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const { addItem } = useCartStore();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // --- Empty state: catálogo aún sin productos ---
  if (products.length === 0) {
    return (
      <section className="py-24 bg-prana-base-50 dark:bg-prana-base-950 relative overflow-hidden section-divide-top section-divide-bottom">
        {/* Decorative subtle background gradient */}
        <div className="absolute inset-0 bg-mesh-forest opacity-10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-prana-gold/5 to-transparent pointer-events-none" />

        <div className="max-w-350 mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="inline-block text-prana-gold text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Selección Única
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Destacados Premium
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              Equipamiento de grado profesional para asegurar resultados extraordinarios.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center py-20 px-8 rounded-4xl border border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-sm relative overflow-hidden"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a4d2e]/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative w-24 h-24 rounded-4xl bg-linear-to-br from-prana-gold/10 to-prana-emerald/10 flex items-center justify-center mb-8 border border-prana-gold/20 shadow-inner">
              <Leaf className="w-10 h-10 text-prana-gold" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a4d2e]/5 border border-[#1a4d2e]/10 dark:bg-prana-gold/10 dark:border-prana-gold/20 text-[#1a4d2e] dark:text-prana-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Próximamente</span>
            </div>

            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center tracking-tight">
              Catálogo en Preparación
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-lg mb-10 text-lg font-light leading-relaxed">
              Estamos integrando la tecnología más avanzada y los insumos de mayor pureza para tu
              próximo cultivo indoor.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-[#081c15] text-white hover:bg-[#1a4d2e] dark:bg-white dark:text-[#081c15] dark:hover:bg-gray-100 transition-all duration-300 rounded-2xl px-10 py-7 h-auto text-base group shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <Link href="/products">
                Explorar Colección
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  // --- Grid con productos reales ---
  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product, 1);
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  return (
    <section className="py-24 bg-prana-base-50 dark:bg-prana-base-950 relative overflow-hidden section-divide-top section-divide-bottom">
      {/* Subtle decorative background */}
      <div className="absolute inset-0 bg-mesh-forest opacity-10" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-prana-gold/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className="inline-block text-prana-gold text-xs font-bold tracking-[0.2em] uppercase mb-4">
            Selección Única
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Destacados Premium
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Equipamiento y suministros de élite para cultivadores exigentes.
          </p>
        </motion.div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-10 mb-20">
          {products.map((product, index) => {
            const productImage = product.images?.[0] ?? null;
            const productHref = `/products/${product.slug ?? product.id}`;
            const isAdded = addedIds.has(product.id);
            return (
              <motion.div
                key={product.id}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={cardVariants}
                className="h-full"
              >
                <div className="group relative flex flex-col h-full bg-transparent p-1">
                  {/* Subtle Glow Background behind card */}
                  <div className="absolute inset-0 bg-prana-gold/5 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 rounded-3xl" />

                  {/* Image Container with Aspect Ratio */}
                  <Link
                    href={productHref}
                    className="block relative aspect-[4/5] rounded-3xl overflow-hidden bg-prana-base-50 dark:bg-prana-base-950 mb-6 border border-transparent group-hover:border-prana-gold/30 transition-all duration-500 shadow-sm group-hover:shadow-2xl group-hover:shadow-prana-gold/10"
                  >
                    {/* Hover Overlay: Dark Glass */}
                    <div className="absolute inset-0 bg-black/5 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

                    {productImage ? (
                      <Image
                        src={productImage}
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Leaf className="w-16 h-16 text-prana-green/10" />
                      </div>
                    )}

                    {/* Premium Badges */}
                    <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                      {product.featured && (
                        <div className="px-3 py-1.5 rounded-xl bg-white/10 dark:bg-black/40 backdrop-blur-xl text-prana-gold text-[9px] font-black tracking-[0.2em] uppercase shadow-xl border border-white/20 dark:border-prana-gold/30">
                          SOTA Select
                        </div>
                      )}
                    </div>

                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-5 right-5 z-20 px-3 py-1.5 rounded-xl bg-prana-gold text-prana-base-950 text-[10px] font-black tracking-widest shadow-xl">
                        -
                        {Math.round(
                          ((product.originalPrice - product.price) / product.originalPrice) * 100,
                        )}
                        %
                      </div>
                    )}

                    {/* Quick Add Button Panel: Advanced Glassmorphism */}
                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20">
                      <Button
                        className={`w-full h-14 rounded-2xl backdrop-blur-2xl shadow-2xl transition-all duration-500 font-bold text-xs ${
                          isAdded
                            ? 'bg-prana-green-emerald text-white border border-prana-green-emerald/50'
                            : 'bg-white/10 dark:bg-black/60 text-white border border-white/20 hover:bg-prana-gold hover:text-prana-base-950 hover:border-prana-gold'
                        }`}
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        <AnimatePresence mode="wait">
                          {isAdded ? (
                            <motion.span
                              key="added"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="flex items-center justify-center gap-2"
                            >
                              <Check className="h-4 w-4" />
                              <span className="tracking-[0.1em] uppercase">En el Carrito</span>
                            </motion.span>
                          ) : (
                            <motion.span
                              key="add"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center justify-center gap-2"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              <span className="tracking-[0.1em] uppercase">Añadir al Carro</span>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Button>
                    </div>
                  </Link>

                  {/* Product Details (External to image) */}
                  <div className="flex flex-col grow px-3">
                    <div className="text-[9px] text-prana-gold font-black uppercase tracking-[0.3em] mb-3 opacity-70">
                      {product.category || 'Colección SOTA'}
                    </div>

                    <Link href={productHref} className="mb-4 block group/title">
                      <h3 className="text-lg font-bold text-prana-base-900 dark:text-white group-hover/title:text-gradient-gold transition-all duration-300 leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-prana-base-100 dark:border-white/5">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-black text-prana-base-900 dark:text-white">
                            ${product.price.toLocaleString('es-CL')}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm font-medium text-prana-base-100/40 line-through">
                              ${product.originalPrice.toLocaleString('es-CL')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Global CTA */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            asChild
            size="lg"
            className="btn-luxury group text-lg px-12 py-8 h-auto border-0 text-white! shadow-gold/20"
          >
            <Link href="/products">
              <span className="relative z-10 flex items-center font-bold">
                Explorar Colección Completa
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
