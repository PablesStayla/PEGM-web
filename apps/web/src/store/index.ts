import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createLogger } from '@/lib/logger';
import type { Address, Product, User } from '@/types';

const log = createLogger({ module: 'store' });

// ── Types ───────────────────────────────────────────────────────────────────────

export interface StoreCartItem {
  id: string;
  product: Product;
  quantity: number;
  variant?: string;
}

export interface Order {
  id: string;
  items: StoreCartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: Address;
  trackingNumber?: string;
}

type SortOption = 'featured' | 'price_low' | 'price_high' | 'newest';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function calculateTotal(items: StoreCartItem[]): number {
  return items.reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0);
}

// ── Cart Store ────────────────────────────────────────────────────────────────

interface CartStore {
  items: StoreCartItem[];
  isOpen: boolean;
  total: number;
  addItem: (product: Product, quantity?: number, variant?: string) => Promise<void>;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      total: 0,

      addItem: async (product, quantity, variant) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (item) => item.product.id === product.id && item.variant === variant,
        );

        // Fix: avoid direct mutation — always produce a new array
        const updatedItems =
          existingIndex > -1
            ? items.map((item, idx) =>
                idx === existingIndex
                  ? { ...item, quantity: item.quantity + (quantity ?? 1) }
                  : item,
              )
            : [
                ...items,
                {
                  id: `${product.id}-${variant ?? 'default'}-${Date.now()}`,
                  product,
                  quantity: quantity ?? 1,
                  ...(variant !== undefined ? { variant } : {}),
                },
              ];

        set({ items: updatedItems, total: calculateTotal(updatedItems) });

        log.debug('Cart item added (optimistic)', {
          productId: product.id,
          quantity,
          variant,
          newTotal: calculateTotal(updatedItems),
        });

        // Server-side persistence (fire-and-forget with rollback on error)
        try {
          const { addToCart } = await import('@/app/actions/cart');
          await addToCart(product.id, quantity ?? 1);
          log.info('Cart synced with server', { productId: product.id });
        } catch (error) {
          log.error('Failed to sync cart with server — rolling back', {
            productId: product.id,
            error: error instanceof Error ? error.message : String(error),
          });
          // Rollback to previous state
          set({ items, total: calculateTotal(items) });
        }
      },

      removeItem: (itemId) => {
        const { items } = get();
        const removedItem = items.find((item) => item.id === itemId);
        const updatedItems = items.filter((item) => item.id !== itemId);

        set({ items: updatedItems, total: calculateTotal(updatedItems) });

        log.debug('Cart item removed', { itemId, productId: removedItem?.product.id });

        if (removedItem) {
          import('@/app/actions/cart')
            .then(({ removeFromCart }) =>
              removeFromCart(removedItem.product.id).catch((error) => {
                log.error('Failed to sync cart removal', {
                  itemId,
                  error: error instanceof Error ? error.message : String(error),
                });
              }),
            )
            .catch(void 0);
        }
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const { items } = get();
        const targetItem = items.find((item) => item.id === itemId);
        const updatedItems = items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        );

        set({ items: updatedItems, total: calculateTotal(updatedItems) });

        log.debug('Cart quantity updated', { itemId, quantity });

        if (targetItem) {
          import('@/app/actions/cart')
            .then(({ updateCartQuantity }) =>
              updateCartQuantity(targetItem.product.id, quantity).catch((error) => {
                log.error('Failed to sync cart quantity', {
                  itemId,
                  error: error instanceof Error ? error.message : String(error),
                });
              }),
            )
            .catch(void 0);
        }
      },

      clearCart: () => {
        log.info('Cart cleared');
        set({ items: [], total: 0 });
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'pranakaia-cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// ── Product Store ──────────────────────────────────────────────────────────────

interface ProductStore {
  products: Product[];
  filteredProducts: Product[];
  categories: string[];
  currentCategory: string;
  sortBy: SortOption;
  searchQuery: string;
  loading: boolean;
  setProducts: (products: Product[]) => void;
  setCategories: (categories: string[]) => void;
  filterByCategory: (category: string) => void;
  sortProducts: (sortBy: SortOption) => void;
  setSortBy: (sortBy: SortOption) => void;
  searchProducts: (query: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  filteredProducts: [],
  categories: ['all'],
  currentCategory: 'all',
  sortBy: 'featured',
  searchQuery: '',
  loading: false,

  setProducts: (products) => {
    const productCategories = [
      ...new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c))),
    ];
    const categories = ['all', ...productCategories];
    log.debug('Products loaded into store', {
      count: products.length,
      categories: categories.length,
    });
    set({ products, filteredProducts: products, categories });
    get().filterByCategory(get().currentCategory);
  },

  setCategories: (categories) => set({ categories: ['all', ...categories] }),

  filterByCategory: (category) => {
    const { products, searchQuery } = get();
    let filtered = category === 'all' ? products : products.filter((p) => p.category === category);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    set({ currentCategory: category, filteredProducts: filtered });
    get().sortProducts(get().sortBy);
  },

  sortProducts: (sortBy) => {
    const { filteredProducts } = get();
    let sorted: Product[];

    switch (sortBy) {
      case 'price_low':
        sorted = [...filteredProducts].sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        sorted = [...filteredProducts].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted = [...filteredProducts].sort((a, b) => {
          const dateA = (a as Product & { createdAt?: string }).createdAt;
          const dateB = (b as Product & { createdAt?: string }).createdAt;
          if (dateA && dateB) {
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          }
          return b.id.localeCompare(a.id);
        });
        break;
      default:
        sorted = [...filteredProducts].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    set({ sortBy, filteredProducts: sorted });
  },

  setSortBy: (sortBy) => get().sortProducts(sortBy),

  searchProducts: (query) => {
    log.debug('Product search', { query });
    set({ searchQuery: query });
    get().filterByCategory(get().currentCategory);
  },

  setLoading: (loading) => set({ loading }),
}));

// ── User Store ─────────────────────────────────────────────────────────────────

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  removeAddress: (id: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,

      setUser: (user) => {
        log.info('User session set', { userId: user?.id, authenticated: !!user });
        set({ user, isAuthenticated: !!user });
      },

      logout: () => {
        log.info('User logged out');
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (updates) => {
        const { user } = get();
        if (!user) {
          return;
        }
        set({ user: { ...user, ...updates } });
      },

      addAddress: (addressData) => {
        const { user } = get();
        if (!user) {
          return;
        }
        const newAddress: Address = { ...addressData, id: crypto.randomUUID() };
        set({ user: { ...user, addresses: [...(user.addresses ?? []), newAddress] } });
      },

      updateAddress: (id, updates) => {
        const { user } = get();
        if (!user) {
          return;
        }
        const addresses = (user.addresses ?? []).map((addr) =>
          addr.id === id ? { ...addr, ...updates } : addr,
        );
        set({ user: { ...user, addresses } });
      },

      removeAddress: (id) => {
        const { user } = get();
        if (!user) {
          return;
        }
        const addresses = (user.addresses ?? []).filter((addr) => addr.id !== id);
        set({ user: { ...user, addresses } });
      },
    }),
    {
      name: 'pranakaia-user',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// ── UI Store ────────────────────────────────────────────────────────────────────

interface UIStore {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: string;
  country: string;
  currency: string;
  notifications: Notification[];
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
  setCountry: (country: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      theme: 'light',
      language: 'es',
      country: 'CL',
      currency: 'CLP',
      notifications: [],

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setCountry: (country) => set({ country }),

      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        set((state) => ({ notifications: [...state.notifications, notification] }));

        setTimeout(() => get().removeNotification(notification.id), notification.duration ?? 5000);
      },

      removeNotification: (id) =>
        set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
    }),
    {
      name: 'pranakaia-ui',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
