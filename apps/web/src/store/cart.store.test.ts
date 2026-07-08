import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCartStore } from './index';

// â€”â€” Mock dynamic imports (server actions) â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”

const mockAddToCart = vi.fn().mockResolvedValue(undefined);
const mockRemoveFromCart = vi.fn().mockResolvedValue(undefined);
const mockUpdateCartQuantity = vi.fn().mockResolvedValue(undefined);

vi.mock('@/app/actions/cart', () => ({
  addToCart: mockAddToCart,
  removeFromCart: mockRemoveFromCart,
  updateCartQuantity: mockUpdateCartQuantity,
}));

// â€”â€” Mock logger to prevent console noise in tests â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// â€”â€” Mock localStorage â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// â€”â€” Sample fixtures â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”

const makeProduct = (overrides?: Partial<{ id: string; price: number; name: string }>) => ({
  id: overrides?.id ?? 'prod-001',
  name: overrides?.name ?? 'LED Vipar Spectra 300W',
  price: overrides?.price ?? 79_990,
  description: 'Panel LED full-spectrum para cultivo indoor',
  category: 'IluminaciÃ³n',
  stock: 10,
  images: ['https://example.com/led.jpg'],
  tags: ['led', 'indoor'],
  featured: false,
  slug: overrides?.id ?? 'led-vipar-300w',
});

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCartStore.setState({ items: [], isOpen: false, total: 0 });
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  // â”€â”€ addItem â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('addItem', () => {
    it('adds a new item to an empty cart', async () => {
      const product = makeProduct();
      await useCartStore.getState().addItem(product);

      const { items, total } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].product.id).toBe(product.id);
      expect(items[0].quantity).toBe(1);
      expect(total).toBe(79_990);
    });

    it('increments quantity when adding an existing product (same variant)', async () => {
      const product = makeProduct();
      await useCartStore.getState().addItem(product, 2);
      await useCartStore.getState().addItem(product, 3);

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(5);
    });

    it('adds separate cart items for different variants of the same product', async () => {
      const product = makeProduct();
      await useCartStore.getState().addItem(product, 1, 'small');
      await useCartStore.getState().addItem(product, 1, 'large');

      expect(useCartStore.getState().items).toHaveLength(2);
    });

    it('recalculates total correctly after adding multiple items', async () => {
      const p1 = makeProduct({ id: 'a', price: 10_000 });
      const p2 = makeProduct({ id: 'b', price: 25_000 });

      await useCartStore.getState().addItem(p1, 2);
      await useCartStore.getState().addItem(p2, 1);

      expect(useCartStore.getState().total).toBe(45_000); // 2*10k + 1*25k
    });

    it('does NOT mutate existing items array (immutability)', async () => {
      const product = makeProduct();
      await useCartStore.getState().addItem(product, 1);

      const snapshot = useCartStore.getState().items;
      await useCartStore.getState().addItem(product, 1);

      // The original snapshot reference must not have changed
      expect(snapshot[0].quantity).toBe(1);
      expect(useCartStore.getState().items[0].quantity).toBe(2);
    });

    it('calls server addToCart action', async () => {
      const product = makeProduct();
      await useCartStore.getState().addItem(product, 1);

      expect(mockAddToCart).toHaveBeenCalledOnce();
      expect(mockAddToCart).toHaveBeenCalledWith(product.id, 1);
    });

    it('rolls back optimistic update when server sync fails', async () => {
      mockAddToCart.mockRejectedValueOnce(new Error('Network error'));
      const product = makeProduct();
      await useCartStore.getState().addItem(product);

      // Cart should be empty after rollback
      const { items, total } = useCartStore.getState();
      expect(items).toHaveLength(0);
      expect(total).toBe(0);
    });
  });

  // â”€â”€ removeItem â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('removeItem', () => {
    it('removes an item from the cart', async () => {
      const product = makeProduct();
      await useCartStore.getState().addItem(product);
      const { items } = useCartStore.getState();
      useCartStore.getState().removeItem(items[0].id);

      expect(useCartStore.getState().items).toHaveLength(0);
      expect(useCartStore.getState().total).toBe(0);
    });

    it('recalculates total correctly after removal', async () => {
      const p1 = makeProduct({ id: 'a', price: 10_000 });
      const p2 = makeProduct({ id: 'b', price: 20_000 });
      await useCartStore.getState().addItem(p1);
      await useCartStore.getState().addItem(p2);

      const itemToRemove = useCartStore.getState().items.find((i) => i.product.id === 'a')!;
      useCartStore.getState().removeItem(itemToRemove.id);

      expect(useCartStore.getState().total).toBe(20_000);
    });

    it('does nothing when itemId is not found', () => {
      useCartStore.getState().removeItem('nonexistent-id');
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  // â”€â”€ updateQuantity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('updateQuantity', () => {
    it('updates quantity for an existing item', async () => {
      const product = makeProduct({ price: 10_000 });
      await useCartStore.getState().addItem(product, 1);
      const { items } = useCartStore.getState();

      useCartStore.getState().updateQuantity(items[0].id, 5);

      expect(useCartStore.getState().items[0].quantity).toBe(5);
      expect(useCartStore.getState().total).toBe(50_000);
    });

    it('removes item when quantity is set to 0', async () => {
      const product = makeProduct();
      await useCartStore.getState().addItem(product);
      const { items } = useCartStore.getState();

      useCartStore.getState().updateQuantity(items[0].id, 0);

      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('removes item when quantity is negative', async () => {
      const product = makeProduct();
      await useCartStore.getState().addItem(product);
      const { items } = useCartStore.getState();

      useCartStore.getState().updateQuantity(items[0].id, -1);

      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  // â”€â”€ clearCart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('clearCart', () => {
    it('removes all items and resets total to 0', async () => {
      const p1 = makeProduct({ id: 'a' });
      const p2 = makeProduct({ id: 'b', price: 5_000 });
      await useCartStore.getState().addItem(p1);
      await useCartStore.getState().addItem(p2);

      useCartStore.getState().clearCart();

      expect(useCartStore.getState().items).toHaveLength(0);
      expect(useCartStore.getState().total).toBe(0);
    });
  });

  // â”€â”€ getItemCount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('getItemCount', () => {
    it('returns 0 for an empty cart', () => {
      expect(useCartStore.getState().getItemCount()).toBe(0);
    });

    it('returns the sum of all item quantities', async () => {
      const p1 = makeProduct({ id: 'a' });
      const p2 = makeProduct({ id: 'b', price: 5_000 });
      await useCartStore.getState().addItem(p1, 3);
      await useCartStore.getState().addItem(p2, 2);

      expect(useCartStore.getState().getItemCount()).toBe(5);
    });
  });

  // â”€â”€ toggleCart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('toggleCart', () => {
    it('toggles isOpen from false to true', () => {
      expect(useCartStore.getState().isOpen).toBe(false);
      useCartStore.getState().toggleCart();
      expect(useCartStore.getState().isOpen).toBe(true);
    });

    it('toggles isOpen back to false on second call', () => {
      useCartStore.getState().toggleCart();
      useCartStore.getState().toggleCart();
      expect(useCartStore.getState().isOpen).toBe(false);
    });
  });
});
