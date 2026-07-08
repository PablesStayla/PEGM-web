import { ValueObject } from '@pranakaia/shared-kernel';
import { z } from 'zod';

/**
 * Zod schema for validating external inventory data from supplier APIs.
 *
 * @example
 * ```ts
 * const parsed = ExternalInventorySchema.parse(rawData);
 * ```
 */
export const ExternalInventorySchema = z.object({
  supplierId: z.string(),
  externalProductId: z.string(),
  stockLevel: z.number().int().min(0),
  lastCheckedAt: z.date(),
});

export type ExternalInventory = z.infer<typeof ExternalInventorySchema>;

/**
 * Value Object wrapping external supplier inventory data.
 *
 * Tracks stock levels reported by external suppliers (e.g., AliExpress)
 * with staleness detection for cache invalidation.
 *
 * @example
 * ```ts
 * const vo = ExternalInventoryVO.fromPrimitives({
 *   supplierId: 'sup_1',
 *   externalProductId: 'ext_42',
 *   stockLevel: 100,
 *   lastCheckedAt: new Date(),
 * });
 * if (vo.isStale()) { /* re-fetch from supplier *\/ }
 * ```
 */
export class ExternalInventoryVO extends ValueObject<ExternalInventory> {
  /**
   * Creates an ExternalInventoryVO from primitive data, validating with Zod.
   *
   * @param props - Raw inventory data from external source.
   * @returns Validated value object.
   */
  static fromPrimitives(props: ExternalInventory): ExternalInventoryVO {
    ExternalInventorySchema.parse(props);
    return new ExternalInventoryVO(props);
  }

  /** Current stock level reported by the supplier. */
  get stockLevel(): number {
    return this.value.stockLevel;
  }

  /** Timestamp of the last stock check. */
  get lastCheckedAt(): Date {
    return this.value.lastCheckedAt;
  }

  /**
   * Checks if the inventory data is stale (older than threshold).
   *
   * @param thresholdMs - Staleness threshold in milliseconds. Defaults to 1 hour.
   *
   * @example
   * ```ts
   * if (vo.isStale(7200000)) { /* older than 2h *\/ }
   * ```
   */
  isStale(thresholdMs = 3600000): boolean {
    return Date.now() - this.value.lastCheckedAt.getTime() > thresholdMs;
  }

  /** Serializes to plain object. */
  toPrimitives(): ExternalInventory {
    return { ...this.value };
  }
}
