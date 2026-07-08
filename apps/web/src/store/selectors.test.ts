import { describe, expect, it } from 'vitest';
import type { StoreCartItem } from './index';

/**
 * Unit tests for pure cart selector functions.
 * These are deterministic and require no mocks.
 */

function calculateTotal(items: StoreCartItem[]): number {
  return items.reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0);
}

function getItemCount(items: StoreCartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

const makeItem = (id: string, price: number, quantity: number): StoreCartItem => ({
  id,
  product: {
    id,
    name: `Product ${id}`,
    price,
    slug: id,
    stock: 99,
    images: [],
    tags: [],
    featured: false,
  } as never,
  quantity,
});

describe('Cart selectors', () => {
  describe('calculateTotal', () => {
    it('returns 0 for empty cart', () => {
      expect(calculateTotal([])).toBe(0);
    });

    it('calculates total for single item', () => {
      expect(calculateTotal([makeItem('a', 10_000, 1)])).toBe(10_000);
    });

    it('calculates total for multiple items with multiple quantities', () => {
      const items = [makeItem('a', 10_000, 2), makeItem('b', 5_000, 3)];
      expect(calculateTotal(items)).toBe(35_000); // 20k + 15k
    });

    it('handles zero price gracefully', () => {
      expect(calculateTotal([makeItem('free', 0, 5)])).toBe(0);
    });

    it('handles large Chilean peso amounts without floating point drift', () => {
      const items = [makeItem('a', 999_990, 3)];
      expect(calculateTotal(items)).toBe(2_999_970);
    });
  });

  describe('getItemCount', () => {
    it('returns 0 for empty cart', () => {
      expect(getItemCount([])).toBe(0);
    });

    it('returns total quantity across all items', () => {
      const items = [makeItem('a', 1_000, 3), makeItem('b', 2_000, 7)];
      expect(getItemCount(items)).toBe(10);
    });

    it('returns 1 for a single item with quantity 1', () => {
      expect(getItemCount([makeItem('x', 1_000, 1)])).toBe(1);
    });
  });
});
