/**
 * Abandoned Cart Recovery Service - Fellow Level Architecture
 *
 * Implements Command Pattern for cart operations and Strategy Pattern
 * for tier classification. Extensible and testable.
 *
 * @module lib/carts/abandoned-cart-service
 * @version 2.0
 * @since 2026-09-04
 */

import { and, cartItems, carts, db, eq, inArray, lte, sql } from '@pranakaia/infrastructure/db';

// ============================================================================
// Domain Types
// ============================================================================

export interface AbandonedCart {
  id: string;
  userId: string | null;
  status: string;
  updatedAt: Date;
}

export interface CartWithItemCount extends AbandonedCart {
  itemCount: number;
}

export interface RecoveryTier {
  name: 'tier1' | 'tier2' | 'tier3';
  minHours: number;
  maxHours: number | null;
}

export interface RecoveryStats {
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
  markedAbandoned: number;
}

export interface RecoveryResult {
  success: boolean;
  message: string;
  dryRun: boolean;
  criteria: {
    hoursInactive: number;
    batchSize: number;
    thresholdDate: string;
  };
  stats: RecoveryStats;
  processedCount: number;
  timestamp: string;
}

// ============================================================================
// Strategy Pattern: Tier Classification
// ============================================================================

/**
 * Strategy for classifying carts into recovery tiers
 */
interface TierClassificationStrategy {
  classify(cart: AbandonedCart, referenceTime: number): RecoveryTier['name'] | null;
}

/**
 * Hours-based tier classification
 * - Tier 1: 24-47 hours
 * - Tier 2: 48-71 hours
 * - Tier 3: 72+ hours
 */
class HoursBasedTierStrategy implements TierClassificationStrategy {
  private readonly TIER_1_MIN_HOURS = 24;
  private readonly TIER_2_MIN_HOURS = 48;
  private readonly TIER_3_MIN_HOURS = 72;

  classify(cart: AbandonedCart, referenceTime: number): RecoveryTier['name'] | null {
    const updatedAtMs = new Date(cart.updatedAt).getTime();
    const ageHours = (referenceTime - updatedAtMs) / (1000 * 60 * 60);

    if (ageHours >= this.TIER_3_MIN_HOURS) {
      return 'tier3';
    }
    if (ageHours >= this.TIER_2_MIN_HOURS) {
      return 'tier2';
    }
    if (ageHours >= this.TIER_1_MIN_HOURS) {
      return 'tier1';
    }
    return null;
  }
}

// ============================================================================
// Command Pattern: Cart Operations
// ============================================================================

/**
 * Command interface for cart operations
 */
interface CartCommand {
  execute(): Promise<unknown>;
}

/**
 * Command to fetch stale active carts
 */
class FetchStaleCartsCommand implements CartCommand {
  constructor(
    private readonly thresholdDate: Date,
    private readonly batchSize: number,
  ) {}

  async execute(): Promise<AbandonedCart[]> {
    return db
      .select({
        id: carts.id,
        userId: carts.userId,
        status: carts.status,
        updatedAt: carts.updatedAt,
      })
      .from(carts)
      .where(and(eq(carts.status, 'active'), lte(carts.updatedAt, this.thresholdDate)))
      .orderBy(carts.updatedAt)
      .limit(this.batchSize);
  }
}

/**
 * Command to fetch item counts for carts
 */
class FetchItemCountsCommand implements CartCommand {
  constructor(private readonly cartIds: string[]) {}

  async execute(): Promise<Map<string, number>> {
    if (this.cartIds.length === 0) {
      return new Map();
    }

    const rows = await db
      .select({
        cartId: cartItems.cartId,
        count: sql<number>`count(*)`,
      })
      .from(cartItems)
      .where(inArray(cartItems.cartId, this.cartIds))
      .groupBy(cartItems.cartId);

    return new Map(rows.map((row) => [row.cartId, Number(row.count)]));
  }
}

/**
 * Command to mark carts as abandoned
 */
class MarkAbandonedCommand implements CartCommand {
  constructor(private readonly cartIds: string[]) {}

  async execute(): Promise<number> {
    if (this.cartIds.length === 0) {
      return 0;
    }

    const updatedRows = await db
      .update(carts)
      .set({
        status: 'abandoned',
        updatedAt: new Date(),
      })
      .where(inArray(carts.id, this.cartIds))
      .returning({ id: carts.id });

    return updatedRows.length;
  }
}

// ============================================================================
// Main Service
// ============================================================================

export interface RecoveryOptions {
  hoursInactive: number;
  batchSize: number;
  dryRun: boolean;
  now?: number;
}

/**
 * Abandoned cart recovery service implementing Command and Strategy patterns
 */
export class AbandonedCartService {
  private readonly tierStrategy: TierClassificationStrategy;

  constructor() {
    this.tierStrategy = new HoursBasedTierStrategy();
  }

  /**
   * Executes abandoned cart recovery workflow
   */
  async recover(options: RecoveryOptions): Promise<RecoveryResult> {
    const now = options.now ?? Date.now();
    const thresholdDate = new Date(now - options.hoursInactive * 60 * 60 * 1000);

    // Fetch stale carts
    const staleCarts = await new FetchStaleCartsCommand(thresholdDate, options.batchSize).execute();

    if (staleCarts.length === 0) {
      return this.buildEmptyResult(options, thresholdDate);
    }

    // Filter non-empty carts
    const nonEmptyCarts = await this.filterNonEmptyCarts(staleCarts);

    // Classify into tiers
    const stats = this.classifyIntoTiers(nonEmptyCarts, now);

    // Mark as abandoned if not dry run
    const markedCount = options.dryRun
      ? 0
      : await new MarkAbandonedCommand(nonEmptyCarts.map((c) => c.id)).execute();

    return {
      success: true,
      message: options.dryRun
        ? 'Dry-run completed. No carts were modified.'
        : 'Abandoned cart recovery executed successfully.',
      dryRun: options.dryRun,
      criteria: {
        hoursInactive: options.hoursInactive,
        batchSize: options.batchSize,
        thresholdDate: thresholdDate.toISOString(),
      },
      stats: {
        ...stats,
        markedAbandoned: markedCount,
      },
      processedCount: nonEmptyCarts.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Filters carts to only include those with items
   */
  private async filterNonEmptyCarts(carts: AbandonedCart[]): Promise<CartWithItemCount[]> {
    const cartIds = carts.map((cart) => cart.id);
    const itemCountMap = await new FetchItemCountsCommand(cartIds).execute();

    return carts
      .map((cart) => ({
        ...cart,
        itemCount: itemCountMap.get(cart.id) ?? 0,
      }))
      .filter((cart) => cart.itemCount > 0);
  }

  /**
   * Classifies carts into recovery tiers
   */
  private classifyIntoTiers(
    carts: CartWithItemCount[],
    referenceTime: number,
  ): Omit<RecoveryStats, 'markedAbandoned'> {
    const stats = {
      tier1Count: 0,
      tier2Count: 0,
      tier3Count: 0,
    };

    for (const cart of carts) {
      const tier = this.tierStrategy.classify(cart, referenceTime);
      if (tier) {
        stats[`${tier}Count`]++;
      }
    }

    return stats;
  }

  /**
   * Builds result for empty cart scenario
   */
  private buildEmptyResult(options: RecoveryOptions, thresholdDate: Date): RecoveryResult {
    return {
      success: true,
      message: 'No abandoned carts found for current threshold.',
      dryRun: options.dryRun,
      criteria: {
        hoursInactive: options.hoursInactive,
        batchSize: options.batchSize,
        thresholdDate: thresholdDate.toISOString(),
      },
      stats: {
        tier1Count: 0,
        tier2Count: 0,
        tier3Count: 0,
        markedAbandoned: 0,
      },
      processedCount: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================================
// Factory & Singleton
// ============================================================================

let serviceInstance: AbandonedCartService | null = null;

/**
 * Gets singleton instance of AbandonedCartService
 */
export function getAbandonedCartService(): AbandonedCartService {
  if (!serviceInstance) {
    serviceInstance = new AbandonedCartService();
  }
  return serviceInstance;
}

/**
 * Resets service instance (useful for testing)
 */
export function resetAbandonedCartService(): void {
  serviceInstance = null;
}
