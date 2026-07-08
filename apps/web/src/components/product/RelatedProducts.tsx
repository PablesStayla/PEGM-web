'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface RelatedProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function RelatedProducts({
  products,
  title = 'También te puede gustar',
  subtitle,
  className,
}: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        direction === 'left'
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      setTimeout(checkScroll, 300);
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={cn('py-12', className)}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gradient-gold lowercase tracking-tighter">
              {title}
            </h2>
            {subtitle && (
              <p className="text-prana-base-100/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                {subtitle}
              </p>
            )}
          </div>

          {/* Navigation Buttons - Desktop */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                'p-3 rounded-full border transition-all duration-300',
                canScrollLeft
                  ? 'border-prana-gold text-prana-gold bg-prana-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:bg-prana-gold/10'
                  : 'border-white/5 text-white/10 cursor-not-allowed',
              )}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={cn(
                'p-3 rounded-full border transition-all duration-300',
                canScrollRight
                  ? 'border-prana-gold text-prana-gold bg-prana-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:bg-prana-gold/10'
                  : 'border-white/5 text-white/10 cursor-not-allowed',
              )}
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product.id} className="flex-none w-[280px] snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Scroll Indicator - Mobile */}
      <div className="flex md:hidden justify-center gap-2 mt-8">
        {Array.from({ length: Math.ceil(products.length / 2) }).map((_, index) => (
          <div key={index} className="w-8 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className={cn(
                'h-full bg-prana-gold transition-all duration-500',
                index === 0 ? 'w-full' : 'w-0',
              )}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
