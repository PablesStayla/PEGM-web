import { describe, expect, it } from 'vitest';
import { mapCoreToUI } from './products';

/**
 * Unit tests for the mapCoreToUI() mapper function.
 * These are pure function tests â€” no mocks needed.
 */

type CoreProductInput = Parameters<typeof mapCoreToUI>[0];

function makeCoreProduct(overrides?: Partial<CoreProductInput>): CoreProductInput {
  return {
    id: 'prod-001',
    name: 'Panel LED Quantum 240W',
    slug: 'panel-led-quantum-240w',
    description: 'IluminaciÃ³n de espectro completo',
    price: { amount: 250_000, currency: 'CLP' },
    salePrice: undefined,
    images: ['https://example.com/img.jpg'],
    category: 'IluminaciÃ³n',
    stock: 10,
    isFeatured: false,
    tags: ['led', 'indoor'],
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-06-01T00:00:00.000Z'),
    ...overrides,
  } as CoreProductInput;
}

describe('mapCoreToUI()', () => {
  // â”€â”€ Basic mapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it('maps id, name, slug, description, category from core product', () => {
    const result = mapCoreToUI(makeCoreProduct());
    expect(result.id).toBe('prod-001');
    expect(result.name).toBe('Panel LED Quantum 240W');
    expect(result.slug).toBe('panel-led-quantum-240w');
    expect(result.description).toBe('IluminaciÃ³n de espectro completo');
    expect(result.category).toBe('IluminaciÃ³n');
  });

  it('maps stock and featured correctly', () => {
    const result = mapCoreToUI(makeCoreProduct({ stock: 5, isFeatured: true }));
    expect(result.stock).toBe(5);
    expect(result.featured).toBe(true);
  });

  it('defaults featured to false when isFeatured is undefined', () => {
    const result = mapCoreToUI(makeCoreProduct({ isFeatured: undefined }));
    expect(result.featured).toBe(false);
  });

  it('defaults description to empty string when undefined', () => {
    const result = mapCoreToUI(makeCoreProduct({ description: undefined }));
    expect(result.description).toBe('');
  });

  it('defaults category to "general" when empty', () => {
    const result = mapCoreToUI(makeCoreProduct({ category: '' }));
    expect(result.category).toBe('general');
  });

  it('defaults images to empty array when undefined', () => {
    const result = mapCoreToUI(makeCoreProduct({ images: undefined }));
    expect(result.images).toEqual([]);
  });

  it('preserves tags from core product', () => {
    const result = mapCoreToUI(makeCoreProduct({ tags: ['led', 'full-spectrum'] }));
    expect(result.tags).toEqual(['led', 'full-spectrum']);
  });

  it('defaults tags to empty array when undefined', () => {
    const result = mapCoreToUI(makeCoreProduct({ tags: undefined }));
    expect(result.tags).toEqual([]);
  });

  // â”€â”€ Date formatting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it('converts Date objects to ISO strings', () => {
    const result = mapCoreToUI(
      makeCoreProduct({
        createdAt: new Date('2025-01-15T10:30:00.000Z'),
        updatedAt: new Date('2025-06-20T08:00:00.000Z'),
      }),
    );
    expect(result.createdAt).toBe('2025-01-15T10:30:00.000Z');
    expect(result.updatedAt).toBe('2025-06-20T08:00:00.000Z');
  });

  it('converts string dates without throwing', () => {
    const result = mapCoreToUI(makeCoreProduct({ createdAt: '2025-03-19' as unknown as Date }));
    expect(typeof result.createdAt).toBe('string');
    expect(result.createdAt).toBe('2025-03-19');
  });

  // â”€â”€ Price logic â€” THE critical section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it('price = basePrice when no salePrice', () => {
    const result = mapCoreToUI(
      makeCoreProduct({ price: { amount: 100_000, currency: 'CLP' }, salePrice: undefined }),
    );
    expect(result.price).toBe(100_000);
    expect(result.originalPrice).toBeUndefined();
  });

  it('price = salePrice and originalPrice = basePrice when salePrice < basePrice', () => {
    const result = mapCoreToUI(
      makeCoreProduct({
        price: { amount: 100_000, currency: 'CLP' },
        salePrice: { amount: 75_000, currency: 'CLP' },
      }),
    );
    expect(result.price).toBe(75_000);
    expect(result.originalPrice).toBe(100_000);
  });

  it('no originalPrice when salePrice equals basePrice (no real discount)', () => {
    const result = mapCoreToUI(
      makeCoreProduct({
        price: { amount: 50_000, currency: 'CLP' },
        salePrice: { amount: 50_000, currency: 'CLP' },
      }),
    );
    expect(result.price).toBe(50_000);
    expect(result.originalPrice).toBeUndefined();
  });

  it('no originalPrice when salePrice > basePrice (invalid discount)', () => {
    const result = mapCoreToUI(
      makeCoreProduct({
        price: { amount: 50_000, currency: 'CLP' },
        salePrice: { amount: 60_000, currency: 'CLP' },
      }),
    );
    expect(result.price).toBe(50_000);
    expect(result.originalPrice).toBeUndefined();
  });

  it('handles price as object with amount field (core domain shape)', () => {
    const result = mapCoreToUI(makeCoreProduct({ price: { amount: 85_000, currency: 'CLP' } }));
    expect(result.price).toBe(85_000);
  });

  // â”€â”€ Slug generation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it('uses provided slug when present', () => {
    const result = mapCoreToUI(makeCoreProduct({ slug: 'my-custom-slug' }));
    expect(result.slug).toBe('my-custom-slug');
  });

  it('generates slug from name when slug is empty', () => {
    const result = mapCoreToUI(makeCoreProduct({ slug: '', name: 'Kit HidroponÃ­a Pro 2025' }));
    expect(result.slug).toBe('kit-hidroponia-pro-2025');
  });

  it('generates slug from name when slug is undefined', () => {
    const result = mapCoreToUI(
      makeCoreProduct({ slug: undefined, name: 'Sustrato Universal 50L' }),
    );
    expect(result.slug).toBe('sustrato-universal-50l');
  });
});
