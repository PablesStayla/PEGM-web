import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExternalInventoryVO } from './external-inventory';

describe('ExternalInventoryVO', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should detect stale inventory after the threshold', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

    const vo = ExternalInventoryVO.fromPrimitives({
      supplierId: crypto.randomUUID(),
      externalProductId: 'sku-1',
      stockLevel: 12,
      lastCheckedAt: new Date('2026-01-01T10:30:00.000Z'),
    });

    expect(vo.isStale()).toBe(true);
    expect(vo.stockLevel).toBe(12);
  });

  it('should return fresh when checked within threshold', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

    const vo = ExternalInventoryVO.fromPrimitives({
      supplierId: crypto.randomUUID(),
      externalProductId: 'sku-3',
      stockLevel: 4,
      lastCheckedAt: new Date('2026-01-01T11:30:00.000Z'),
    });

    expect(vo.isStale()).toBe(false);
  });

  it('should round-trip primitives', () => {
    const input = {
      supplierId: crypto.randomUUID(),
      externalProductId: 'sku-2',
      stockLevel: 7,
      lastCheckedAt: new Date('2026-01-01T11:45:00.000Z'),
    };

    const vo = ExternalInventoryVO.fromPrimitives(input);

    expect(vo.toPrimitives()).toEqual(input);
  });
});
