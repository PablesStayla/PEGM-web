import { describe, expect, it, vi } from 'vitest';
import { getRelatedProducts, getSearchSuggestions, searchProducts } from './search';

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

const mockProducts = vi.hoisted(() => [
  {
    id: '1',
    name: 'Panel LED Quantum 240W',
    description: 'Full spectrum indoor LED',
    category: 'IluminaciÃ³n',
    price: 250_000,
    stock: 5,
    featured: true,
    tags: ['led', 'indoor'],
    slug: 'panel-led',
    images: [],
  },
  {
    id: '2',
    name: 'Sustrato Light Mix 50L',
    description: 'Mezcla ligera para esquejes',
    category: 'Sustratos',
    price: 18_000,
    stock: 20,
    featured: false,
    tags: ['tierra', 'orgÃ¡nico'],
    slug: 'sustrato',
    images: [],
  },
  {
    id: '3',
    name: 'Fertilizante FloraciÃ³n NPK',
    description: 'NÃºtrientes base floraciÃ³n',
    category: 'Nutrientes',
    price: 25_000,
    stock: 0,
    featured: false,
    tags: ['nutrientes', 'floracion'],
    slug: 'fertilizante',
    images: [],
  },
  {
    id: '4',
    name: 'Kit Cultivo Indoor 80x80',
    description: 'Kit completo carpa + ventilaciÃ³n',
    category: 'Kits',
    price: 150_000,
    stock: 3,
    featured: true,
    tags: ['indoor', 'kit'],
    slug: 'kit-indoor',
    images: [],
  },
]);

vi.mock('../products', () => ({
  getAllProducts: vi.fn().mockResolvedValue(mockProducts),
}));

describe('searchProducts()', () => {
  it('returns all products when query is empty', async () => {
    const result = await searchProducts('');
    expect(result.hits).toHaveLength(4);
    expect(result.nbHits).toBe(4);
  });

  it('filters by name (case-insensitive)', async () => {
    const result = await searchProducts('LED');
    expect(
      result.hits.every((h) => h.name.toLowerCase().includes('led') || h.tags?.includes('led')),
    ).toBe(true);
  });

  it('filters by accent-insensitive query (Nutricion matches NutriciÃ³n)', async () => {
    const result = await searchProducts('floracion');
    expect(result.hits.length).toBeGreaterThan(0);
  });

  it('applies category filter', async () => {
    const result = await searchProducts('', { category: 'Kits' });
    expect(result.hits).toHaveLength(1);
    expect(result.hits[0].category).toBe('Kits');
  });

  it('applies priceRange filter', async () => {
    const result = await searchProducts('', { priceRange: [0, 30_000] });
    expect(result.hits.every((h) => h.price <= 30_000)).toBe(true);
  });

  it('applies inStock filter', async () => {
    const result = await searchProducts('', { inStock: true });
    expect(result.hits.every((h) => (h.stock ?? 0) > 0)).toBe(true);
  });

  it('applies featured filter', async () => {
    const result = await searchProducts('', { featured: true });
    expect(result.hits.every((h) => h.featured)).toBe(true);
  });

  it('paginates correctly', async () => {
    const result = await searchProducts('', undefined, { hitsPerPage: 2, page: 0 });
    expect(result.hits).toHaveLength(2);
    expect(result.nbPages).toBe(2);
  });

  it('returns processingTimeMs as a number', async () => {
    const result = await searchProducts('led');
    expect(typeof result.processingTimeMs).toBe('number');
  });
});

describe('getSearchSuggestions()', () => {
  it('returns empty array for queries shorter than 2 chars', async () => {
    expect(await getSearchSuggestions('l')).toEqual([]);
    expect(await getSearchSuggestions('')).toEqual([]);
  });

  it('returns matching product names', async () => {
    const suggestions = await getSearchSuggestions('led');
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0]).toContain('LED');
  });
});

describe('getRelatedProducts()', () => {
  it('returns products in the same category', async () => {
    // Kit Cultivo is in Kits, should not return itself
    const related = await getRelatedProducts('4');
    expect(related.every((p) => p.id !== '4')).toBe(true);
  });

  it('returns empty array for unknown product id', async () => {
    expect(await getRelatedProducts('nonexistent')).toEqual([]);
  });
});
