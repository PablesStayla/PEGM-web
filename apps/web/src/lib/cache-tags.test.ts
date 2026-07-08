import { describe, expect, it } from 'vitest';
import { buildCacheKey, CACHE_DURATION, CACHE_TAGS, getProductTags } from './cache-tags';

describe('CACHE_TAGS', () => {
  describe('static tags', () => {
    it('products tag is a non-empty string', () => {
      expect(typeof CACHE_TAGS.products).toBe('string');
      expect(CACHE_TAGS.products.length).toBeGreaterThan(0);
    });

    it('orders tag is a non-empty string', () => {
      expect(typeof CACHE_TAGS.orders).toBe('string');
    });

    it('featuredProducts tag is a non-empty string', () => {
      expect(typeof CACHE_TAGS.featuredProducts).toBe('string');
    });
  });

  describe('factory functions', () => {
    it('productById includes the id', () => {
      expect(CACHE_TAGS.productById('prod-123')).toContain('prod-123');
    });

    it('productBySlug includes the slug', () => {
      expect(CACHE_TAGS.productBySlug('panel-led')).toContain('panel-led');
    });

    it('productsByCategory includes the category', () => {
      expect(CACHE_TAGS.productsByCategory('IluminaciÃ³n')).toContain('IluminaciÃ³n');
    });

    it('orderById includes the id', () => {
      expect(CACHE_TAGS.orderById('order-456')).toContain('order-456');
    });

    it('ordersByUser includes the userId', () => {
      expect(CACHE_TAGS.ordersByUser('user-789')).toContain('user-789');
    });

    it('cart includes the userId', () => {
      expect(CACHE_TAGS.cart('u-001')).toContain('u-001');
    });

    it('different ids produce different tags', () => {
      expect(CACHE_TAGS.productById('a')).not.toBe(CACHE_TAGS.productById('b'));
    });
  });
});

describe('CACHE_DURATION', () => {
  it('REALTIME < FAST < STANDARD < LONG < WEEK', () => {
    expect(CACHE_DURATION.REALTIME).toBeLessThan(CACHE_DURATION.FAST);
    expect(CACHE_DURATION.FAST).toBeLessThan(CACHE_DURATION.STANDARD);
    expect(CACHE_DURATION.STANDARD).toBeLessThan(CACHE_DURATION.LONG);
    expect(CACHE_DURATION.LONG).toBeLessThan(CACHE_DURATION.WEEK);
  });

  it('REALTIME is 60 seconds', () => {
    expect(CACHE_DURATION.REALTIME).toBe(60);
  });

  it('STANDARD is 3600 seconds (1 hour)', () => {
    expect(CACHE_DURATION.STANDARD).toBe(3600);
  });
});

describe('buildCacheKey()', () => {
  it('joins base and tags with colons', () => {
    expect(buildCacheKey('user', 'profile', 'u-001')).toBe('user:profile:u-001');
  });

  it('works with a single base and no extra tags', () => {
    expect(buildCacheKey('products')).toBe('products');
  });
});

describe('getProductTags()', () => {
  const product = {
    id: 'prod-001',
    slug: 'panel-led',
    category: 'IluminaciÃ³n',
    tags: ['led', 'indoor'],
  };

  it('includes the products base tag', () => {
    expect(getProductTags(product)).toContain(CACHE_TAGS.products);
  });

  it('includes productById tag', () => {
    expect(getProductTags(product)).toContain(CACHE_TAGS.productById('prod-001'));
  });

  it('includes productBySlug tag', () => {
    expect(getProductTags(product)).toContain(CACHE_TAGS.productBySlug('panel-led'));
  });

  it('includes productsByCategory tag', () => {
    expect(getProductTags(product)).toContain(CACHE_TAGS.productsByCategory('IluminaciÃ³n'));
  });

  it('includes a tag for each product tag', () => {
    const tags = getProductTags(product);
    expect(tags).toContain(CACHE_TAGS.productsByTag('led'));
    expect(tags).toContain(CACHE_TAGS.productsByTag('indoor'));
  });

  it('works when product has no tags', () => {
    expect(() => getProductTags({ ...product, tags: undefined })).not.toThrow();
  });
});
