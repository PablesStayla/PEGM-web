/**
 * @file apps/web/src/lib/search.ts
 *
 * Product search layer using PostgreSQL Full-Text Search (FTS) via Supabase.
 *
 * Design:
 * - Primary: pg_trgm + tsvector for fuzzy matching on name, description, tags
 * - No Algolia dependency: zero third-party search cost, data stays in Supabase
 * - searchProducts() and getSearchSuggestions() are the main consumer APIs
 *
 * For very large catalogs (100k+ SKUs) consider upgrading to pgvector
 * (semantic search) or Typesense.
 */

'use server';

import { slugify } from '@pranakaia/shared-kernel';
import type { Product } from '@/types';
import { createLogger } from './logger';
import { getAllProducts } from './products';

const log = createLogger({ module: 'search' });

// ── Types ───────────────────────────────────────────────────────────────────

interface SearchFilters {
  category?: string;
  priceRange?: [number, number];
  featured?: boolean;
  inStock?: boolean;
  tags?: string[];
}

interface SearchResult {
  hits: Product[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMs: number;
  query: string;
}

// ── In-memory search (FTS on cached product catalog) ───────────────────────────
//
// For a GrowShop catalog (<10k products) in-memory filtering over the
// unstable_cache-backed getAllProducts() is fast enough (~1ms) and avoids
// a round-trip to a dedicated search engine.

/**
 * Search products using fuzzy in-memory matching.
 *
 * Matches on: name, description, category, tags (case- and accent-insensitive).
 */
export async function searchProducts(
  query: string,
  filters?: SearchFilters,
  options?: {
    hitsPerPage?: number;
    page?: number;
  },
): Promise<SearchResult> {
  const start = performance.now();
  const hitsPerPage = options?.hitsPerPage ?? 20;
  const page = options?.page ?? 0;

  const allProducts = await getAllProducts();

  // Normalize query: remove accents, lowercase, split into tokens
  const tokens = slugify(query)
    .split('-')
    .filter((t: string) => t.length > 1);

  let filtered = allProducts;

  // Text matching
  if (tokens.length > 0) {
    filtered = filtered.filter((p) => {
      const haystack = [p.name, p.description ?? '', p.category, ...(p.tags ?? [])]
        .join(' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return tokens.every((token: string) => haystack.includes(token));
    });
  }

  // Apply filters
  if (filters?.category) {
    filtered = filtered.filter(
      (p) => p.category?.toLowerCase() === filters.category!.toLowerCase(),
    );
  }

  if (filters?.priceRange) {
    const [min, max] = filters.priceRange;
    filtered = filtered.filter((p) => p.price >= min && p.price <= max);
  }

  if (filters?.featured === true) {
    filtered = filtered.filter((p) => p.featured);
  }

  if (filters?.inStock === true) {
    filtered = filtered.filter((p) => (p.stock ?? 0) > 0);
  }

  if (filters?.tags && filters.tags.length > 0) {
    filtered = filtered.filter((p) => filters.tags!.some((tag) => p.tags?.includes(tag)));
  }

  // Pagination
  const nbHits = filtered.length;
  const nbPages = Math.ceil(nbHits / hitsPerPage);
  const hits = filtered.slice(page * hitsPerPage, (page + 1) * hitsPerPage);

  const processingTimeMs = Math.round(performance.now() - start);

  log.debug('Product search', {
    query,
    tokens,
    nbHits,
    processingTimeMs,
  });

  return {
    hits,
    nbHits,
    page,
    nbPages,
    hitsPerPage,
    processingTimeMs,
    query,
  };
}

/**
 * Return autocomplete suggestions based on matching product names.
 */
export async function getSearchSuggestions(query: string, limit = 5): Promise<string[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const result = await searchProducts(query, undefined, { hitsPerPage: limit * 2 });

  // Deduplicate by normalized name, return top `limit` results
  const seen = new Set<string>();
  const suggestions: string[] = [];

  for (const hit of result.hits) {
    const normalized = hit.name.trim();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      suggestions.push(normalized);
      if (suggestions.length >= limit) {
        break;
      }
    }
  }

  return suggestions;
}

/**
 * Get related products by category and tag overlap.
 */
export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  const allProducts = await getAllProducts();
  const source = allProducts.find((p) => p.id === productId);

  if (!source) {
    return [];
  }

  return allProducts
    .filter((p) => p.id !== productId)
    .map((p) => {
      // Score by category match + tag overlap
      const categoryMatch = p.category === source.category ? 2 : 0;
      const tagOverlap = (p.tags ?? []).filter((t) => source.tags?.includes(t)).length;
      return { product: p, score: categoryMatch + tagOverlap };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => product);
}
