'use client';

import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/store/wishlist';
import type { Product } from '@/types';

interface WishlistButtonProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function WishlistButton({
  product,
  size = 'md',
  showLabel = false,
  className,
}: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full transition-all',
        'hover:scale-110 active:scale-95',
        inWishlist ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500',
        className,
      )}
      aria-label={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Heart
        className={cn(sizeClasses[size], 'transition-all')}
        fill={inWishlist ? 'currentColor' : 'none'}
      />
      {showLabel && (
        <span className="text-sm font-medium">
          {inWishlist ? 'En favoritos' : 'Agregar a favoritos'}
        </span>
      )}
    </button>
  );
}
