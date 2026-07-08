'use client';

import { Button } from '@pranakaia/ui';
import { ShoppingBag } from 'lucide-react';
import { memo, useCallback, useTransition } from 'react';
import { useCartStore } from '@/store';
import type { Product } from '@/types';

interface AddToCartButtonProps {
  product: Product;
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

// Memoized to prevent re-renders when parent updates
export const AddToCartButton = memo(function AddToCartButton({
  product,
  variant = 'secondary',
  size = 'default',
  className,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { addItem } = useCartStore();

  const handleAddToCart = useCallback(() => {
    startTransition(async () => {
      try {
        await addItem(product, 1);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('cart:item-added', {
              detail: { product, message: `${product.name} agregado al carrito` },
            }),
          );
        }
      } catch (error) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('notification:error', {
              detail: {
                message: error instanceof Error ? error.message : 'Error al agregar al carrito',
              },
            }),
          );
        }
      }
    });
  }, [addItem, product]);

  const isOutOfStock = product.stock === 0;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={isPending || isOutOfStock}
      aria-label={`Agregar ${product.name} al carrito`}
    >
      <ShoppingBag className="w-4 h-4 mr-2" aria-hidden="true" />
      {isPending ? 'Agregando...' : isOutOfStock ? 'Agotado' : 'Agregar al Carrito'}
    </Button>
  );
});
