'use client';

/**
 * useCart — Hook compartido para gestión del carrito de compras.
 *
 * Diseñado para ser usado en apps/web. Encapsula la lógica de estado del
 * carrito que podría necesitar ser compartida con componentes del admin
 * (ej. creación de ordenes manuales).
 *
 * La implementación completa vive en apps/web/src/store; este hook
 * provee la interfaz pública tipada que el Blueprint requiere.
 *
 * @module @pranakaia/hooks/use-cart
 */
import { useCallback, useState } from 'react';

export interface CartItem {
  productId: string;
  variantId: string;
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface UseCartReturn extends CartState {
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

/**
 * Hook de carrito de compras.
 * Para el storefront completo usa el store de Zustand en apps/web/src/store.
 * Este hook es una versión standalone para contextos que no tienen acceso al
 * store global (ej. componentes de admin creando órdenes manuales).
 */
export function useCart(initialItems: CartItem[] = []): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>(initialItems);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === newItem.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === newItem.variantId ? { ...i, quantity: i.quantity + newItem.quantity } : i,
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.variantId !== variantId));
      return;
    }
    setItems((prev) => prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return {
    items,
    total: calculateTotal(items),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
