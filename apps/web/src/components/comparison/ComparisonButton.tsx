'use client';

import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useComparisonStore } from '@/store/comparison';
import type { Product } from '@/types';

interface ComparisonButtonProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ComparisonButton({
  product,
  size = 'md',
  showLabel = false,
  className,
}: ComparisonButtonProps) {
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } =
    useComparisonStore();
  const inComparison = isInComparison(product.id);
  const canAdd = canAddMore();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inComparison) {
      removeFromComparison(product.id);
    } else if (canAdd) {
      addToComparison(product);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      disabled={!inComparison && !canAdd}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full transition-all',
        'hover:scale-110 active:scale-95',
        inComparison
          ? 'text-primary-600 hover:text-primary-700'
          : canAdd
            ? 'text-gray-400 hover:text-primary-600'
            : 'text-gray-300 cursor-not-allowed',
        className,
      )}
      aria-label={inComparison ? 'Quitar de comparación' : 'Agregar a comparación'}
      title={
        !inComparison && !canAdd
          ? 'Máximo 4 productos para comparar'
          : inComparison
            ? 'Quitar de comparación'
            : 'Agregar a comparación'
      }
    >
      <Scale className={cn(sizeClasses[size], 'transition-all')} />
      {showLabel && (
        <span className="text-sm font-medium">{inComparison ? 'En comparación' : 'Comparar'}</span>
      )}
    </button>
  );
}
