import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Product } from '@/types';

interface ComparisonStore {
  items: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  isInComparison: (productId: string) => boolean;
  clearComparison: () => void;
  canAddMore: () => boolean;
}

const MAX_COMPARISON_ITEMS = 4;

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToComparison: (product) => {
        const { items } = get();
        if (items.length >= MAX_COMPARISON_ITEMS) {
          return;
        }
        if (!items.find((item) => item.id === product.id)) {
          set({ items: [...items, product] });
        }
      },

      removeFromComparison: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      isInComparison: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      clearComparison: () => set({ items: [] }),

      canAddMore: () => get().items.length < MAX_COMPARISON_ITEMS,
    }),
    {
      name: 'pranakaia-comparison',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
