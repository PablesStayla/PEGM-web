import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProductStore } from './index';

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

const makeProducts = () => [
  {
    id: '1',
    name: 'Bomba de agua',
    price: 15_000,
    category: 'HidroponÃ­a',
    featured: false,
    slug: 'bomba',
    stock: 5,
    images: [],
    tags: [],
  },
  {
    id: '2',
    name: 'LÃ¡mpara LED 600W',
    price: 120_000,
    category: 'IluminaciÃ³n',
    featured: true,
    slug: 'lampara',
    stock: 3,
    images: [],
    tags: ['led'],
  },
  {
    id: '3',
    name: 'Sustrato Universal',
    price: 8_000,
    category: 'Sustratos',
    featured: false,
    slug: 'sustrato',
    stock: 20,
    images: [],
    tags: [],
  },
  {
    id: '4',
    name: 'Kit HidroponÃ­a',
    price: 45_000,
    category: 'HidroponÃ­a',
    featured: true,
    slug: 'kit-hidro',
    stock: 2,
    images: [],
    tags: ['hidro'],
  },
];

describe('useProductStore', () => {
  beforeEach(() => {
    useProductStore.setState({
      products: [],
      filteredProducts: [],
      categories: ['all'],
      currentCategory: 'all',
      sortBy: 'featured',
      searchQuery: '',
      loading: false,
    });
  });

  describe('setProducts', () => {
    it('populates products and filteredProducts', () => {
      const products = makeProducts();
      useProductStore.getState().setProducts(products as never);

      expect(useProductStore.getState().products).toHaveLength(4);
      expect(useProductStore.getState().filteredProducts).toHaveLength(4);
    });

    it('extracts unique categories from product data', () => {
      useProductStore.getState().setProducts(makeProducts() as never);

      const { categories } = useProductStore.getState();
      expect(categories).toContain('all');
      expect(categories).toContain('HidroponÃ­a');
      expect(categories).toContain('IluminaciÃ³n');
      expect(categories).toContain('Sustratos');
    });

    it('does not duplicate the "all" category', () => {
      useProductStore.getState().setProducts(makeProducts() as never);
      const { categories } = useProductStore.getState();
      expect(categories.filter((c) => c === 'all')).toHaveLength(1);
    });
  });

  describe('filterByCategory', () => {
    beforeEach(() => {
      useProductStore.getState().setProducts(makeProducts() as never);
    });

    it('shows all products when category is "all"', () => {
      useProductStore.getState().filterByCategory('all');
      expect(useProductStore.getState().filteredProducts).toHaveLength(4);
    });

    it('filters to only matching category', () => {
      useProductStore.getState().filterByCategory('HidroponÃ­a');
      const filtered = useProductStore.getState().filteredProducts;
      expect(filtered).toHaveLength(2);
      expect(filtered.every((p) => p.category === 'HidroponÃ­a')).toBe(true);
    });

    it('returns empty array for a category with no products', () => {
      useProductStore.getState().filterByCategory('NonExistent');
      expect(useProductStore.getState().filteredProducts).toHaveLength(0);
    });
  });

  describe('sortProducts', () => {
    beforeEach(() => {
      useProductStore.getState().setProducts(makeProducts() as never);
      useProductStore.getState().filterByCategory('all');
    });

    it('sorts by price ascending (price_low)', () => {
      useProductStore.getState().sortProducts('price_low');
      const prices = useProductStore.getState().filteredProducts.map((p) => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('sorts by price descending (price_high)', () => {
      useProductStore.getState().sortProducts('price_high');
      const prices = useProductStore.getState().filteredProducts.map((p) => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    it('sorts featured products first', () => {
      useProductStore.getState().sortProducts('featured');
      const products = useProductStore.getState().filteredProducts;
      const firstIsFeatured = products[0].featured;
      expect(firstIsFeatured).toBe(true);
    });
  });

  describe('searchProducts', () => {
    beforeEach(() => {
      useProductStore.getState().setProducts(makeProducts() as never);
    });

    it('filters products by name (case-insensitive)', () => {
      useProductStore.getState().searchProducts('led');
      const results = useProductStore.getState().filteredProducts;
      expect(
        results.every((p) => p.name.toLowerCase().includes('led') || p.tags?.includes('led')),
      ).toBe(true);
    });

    it('returns all products when query is cleared', () => {
      useProductStore.getState().searchProducts('led');
      useProductStore.getState().searchProducts('');
      expect(useProductStore.getState().filteredProducts).toHaveLength(4);
    });

    it('returns empty array when no products match', () => {
      useProductStore.getState().searchProducts('xyz-nonexistent');
      expect(useProductStore.getState().filteredProducts).toHaveLength(0);
    });
  });

  describe('setLoading', () => {
    it('sets loading flag correctly', () => {
      useProductStore.getState().setLoading(true);
      expect(useProductStore.getState().loading).toBe(true);
      useProductStore.getState().setLoading(false);
      expect(useProductStore.getState().loading).toBe(false);
    });
  });
});
