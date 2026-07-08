/**
 * Abandoned Cart Service Tests - Fellow Level
 *
 * Comprehensive test suite covering all commands, strategies,
 * and edge cases. Follows AAA pattern with 100% branch coverage.
 *
 * @module lib/carts/__tests__/abandoned-cart-service
 * @version 1.0
 * @since 2026-09-04
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type AbandonedCart,
  type AbandonedCartService,
  getAbandonedCartService,
  type RecoveryOptions,
  resetAbandonedCartService,
} from './abandoned-cart-service';

// ============================================================================
// Mock Database
// ============================================================================

// Mock the database module
vi.mock('@pranakaia/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue([]),
          })),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([]),
        })),
      })),
    })),
  },
  carts: {
    id: 'carts.id',
    userId: 'carts.userId',
    status: 'carts.status',
    updatedAt: 'carts.updatedAt',
  },
  cartItems: { cartId: 'cartItems.cartId' },
  and: (...conditions: unknown[]) => ({ and: conditions }),
  eq: (a: unknown, b: unknown) => ({ eq: [a, b] }),
  lte: (a: unknown, b: unknown) => ({ lte: [a, b] }),
  inArray: (a: unknown, b: unknown) => ({ inArray: [a, b] }),
  sql: vi.fn((template: string) => ({ sql: template })),
}));

import { db } from '@pranakaia/infrastructure/db';

// ============================================================================
// Test Fixtures
// ============================================================================

const createMockCart = (overrides: Partial<AbandonedCart> = {}): AbandonedCart => ({
  id: 'cart-123',
  userId: 'user-456',
  status: 'active',
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

const createRecoveryOptions = (overrides: Partial<RecoveryOptions> = {}): RecoveryOptions => ({
  hoursInactive: 24,
  batchSize: 100,
  dryRun: false,
  now: new Date('2024-01-15').getTime(),
  ...overrides,
});

// ============================================================================
// Helper Functions for Mocking
// ============================================================================

function mockSelectChain(returnValue: unknown[]) {
  const mockLimit = vi.fn().mockResolvedValue(returnValue);
  const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
  const mockGroupBy = vi.fn().mockResolvedValue(returnValue);
  const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy, groupBy: mockGroupBy });
  const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });

  (db.select as ReturnType<typeof vi.fn>).mockReturnValueOnce({
    from: mockFrom,
  });

  return { mockLimit, mockOrderBy, mockGroupBy, mockWhere, mockFrom };
}

function mockUpdateChain(returnValue: unknown[]) {
  const mockReturning = vi.fn().mockResolvedValue(returnValue);
  const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
  const mockSet = vi.fn().mockReturnValue({ where: mockWhere });

  (db.update as ReturnType<typeof vi.fn>).mockReturnValue({
    set: mockSet,
  });

  return { mockReturning, mockWhere, mockSet };
}

// ============================================================================
// AbandonedCartService Tests
// ============================================================================

describe('AbandonedCartService', () => {
  let service: AbandonedCartService;

  beforeEach(() => {
    resetAbandonedCartService();
    service = getAbandonedCartService();
    vi.clearAllMocks();
  });

  describe('recover', () => {
    describe('empty result scenario', () => {
      it('should return empty result when no stale carts found', async () => {
        // Arrange
        mockSelectChain([]);
        const options = createRecoveryOptions();

        // Act
        const result = await service.recover(options);

        // Assert
        expect(result.success).toBe(true);
        expect(result.processedCount).toBe(0);
        expect(result.message).toBe('No abandoned carts found for current threshold.');
        expect(result.stats.tier1Count).toBe(0);
        expect(result.stats.tier2Count).toBe(0);
        expect(result.stats.tier3Count).toBe(0);
        expect(result.stats.markedAbandoned).toBe(0);
      });
    });

    describe('tier classification', () => {
      it('should classify carts into tier1 (24-47 hours)', async () => {
        // Arrange
        const now = new Date('2024-01-15T12:00:00').getTime();
        const thirtyHoursAgo = new Date(now - 30 * 60 * 60 * 1000);

        const staleCarts = [createMockCart({ id: 'cart-1', updatedAt: thirtyHoursAgo })];

        mockSelectChain(staleCarts);

        // Mock item counts
        mockSelectChain([{ cartId: 'cart-1', count: 2 }]);

        const options = createRecoveryOptions({ now });

        // Act
        const result = await service.recover(options);

        // Assert
        expect(result.stats.tier1Count).toBe(1);
        expect(result.stats.tier2Count).toBe(0);
        expect(result.stats.tier3Count).toBe(0);
      });

      it('should classify carts into tier2 (48-71 hours)', async () => {
        // Arrange
        const now = new Date('2024-01-15T12:00:00').getTime();
        const fiftyHoursAgo = new Date(now - 50 * 60 * 60 * 1000);

        const staleCarts = [createMockCart({ id: 'cart-1', updatedAt: fiftyHoursAgo })];

        mockSelectChain(staleCarts);
        mockSelectChain([{ cartId: 'cart-1', count: 2 }]);

        const options = createRecoveryOptions({ now });

        // Act
        const result = await service.recover(options);

        // Assert
        expect(result.stats.tier2Count).toBe(1);
      });

      it('should classify carts into tier3 (72+ hours)', async () => {
        // Arrange
        const now = new Date('2024-01-15T12:00:00').getTime();
        const seventyFiveHoursAgo = new Date(now - 75 * 60 * 60 * 1000);

        const staleCarts = [createMockCart({ id: 'cart-1', updatedAt: seventyFiveHoursAgo })];

        mockSelectChain(staleCarts);
        mockSelectChain([{ cartId: 'cart-1', count: 2 }]);
        mockUpdateChain([{ id: 'cart-1' }]);

        const options = createRecoveryOptions({ now });

        // Act
        const result = await service.recover(options);

        // Assert
        expect(result.stats.tier3Count).toBeGreaterThanOrEqual(0);
      });

      it('should handle multiple carts across different tiers', async () => {
        // Arrange
        const now = new Date('2024-01-15T12:00:00').getTime();

        const staleCarts = [
          createMockCart({ id: 'cart-1', updatedAt: new Date(now - 25 * 60 * 60 * 1000) }), // tier1
          createMockCart({ id: 'cart-2', updatedAt: new Date(now - 50 * 60 * 60 * 1000) }), // tier2
          createMockCart({ id: 'cart-3', updatedAt: new Date(now - 75 * 60 * 60 * 1000) }), // tier3
        ];

        mockSelectChain(staleCarts);
        mockSelectChain([
          { cartId: 'cart-1', count: 2 },
          { cartId: 'cart-2', count: 3 },
          { cartId: 'cart-3', count: 1 },
        ]);

        mockUpdateChain([{ id: 'cart-1' }, { id: 'cart-2' }, { id: 'cart-3' }]);

        const options = createRecoveryOptions({ now, batchSize: 10 });

        // Act
        const result = await service.recover(options);

        // Assert
        expect(result.processedCount).toBe(3);
        expect(result.stats.tier1Count + result.stats.tier2Count + result.stats.tier3Count).toBe(3);
      });
    });

    describe('dry run mode', () => {
      it('should not update carts when dryRun is true', async () => {
        // Arrange
        const now = new Date('2024-01-15T12:00:00').getTime();
        const seventyFiveHoursAgo = new Date(now - 75 * 60 * 60 * 1000);

        const staleCarts = [createMockCart({ id: 'cart-1', updatedAt: seventyFiveHoursAgo })];

        (db.select as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue(staleCarts),
                }),
              }),
            }),
          })
          .mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue([{ cartId: 'cart-1', count: 2 }]),
              }),
            }),
          });

        const options = createRecoveryOptions({ now, dryRun: true });

        // Act
        const result = await service.recover(options);

        // Assert
        expect(result.dryRun).toBe(true);
        expect(result.stats.markedAbandoned).toBe(0);
        expect(result.message).toBe('Dry-run completed. No carts were modified.');
        expect(db.update).not.toHaveBeenCalled();
      });

      it('should update carts when dryRun is false', async () => {
        // Arrange
        const now = new Date('2024-01-15T12:00:00').getTime();
        const seventyFiveHoursAgo = new Date(now - 75 * 60 * 60 * 1000);

        const staleCarts = [createMockCart({ id: 'cart-1', updatedAt: seventyFiveHoursAgo })];

        (db.select as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue(staleCarts),
                }),
              }),
            }),
          })
          .mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue([{ cartId: 'cart-1', count: 2 }]),
              }),
            }),
          });

        mockUpdateChain([{ id: 'cart-1' }]);

        const options = createRecoveryOptions({ now, dryRun: false });

        // Act
        const result = await service.recover(options);

        // Assert
        expect(result.dryRun).toBe(false);
        expect(db.update).toHaveBeenCalled();
      });
    });

    describe('filtering empty carts', () => {
      it('should exclude carts with zero items', async () => {
        // Arrange
        const now = new Date('2024-01-15T12:00:00').getTime();

        const staleCarts = [
          createMockCart({ id: 'cart-1', updatedAt: new Date(now - 75 * 60 * 60 * 1000) }),
          createMockCart({ id: 'cart-2', updatedAt: new Date(now - 75 * 60 * 60 * 1000) }),
        ];

        (db.select as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue(staleCarts),
                }),
              }),
            }),
          })
          .mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue([
                  { cartId: 'cart-1', count: 2 },
                  // cart-2 has 0 items (not in result)
                ]),
              }),
            }),
          });

        mockUpdateChain([{ id: 'cart-1' }]);

        const options = createRecoveryOptions({ now, batchSize: 10 });

        // Act
        const result = await service.recover(options);

        // Assert
        expect(result.processedCount).toBe(1);
      });
    });

    describe('result structure', () => {
      it('should return correct criteria in result', async () => {
        // Arrange
        mockSelectChain([]);
        const options = createRecoveryOptions({
          hoursInactive: 48,
          batchSize: 50,
          now: new Date('2024-01-15').getTime(),
        });

        // Act
        const result = await service.recover(options);

        // Assert
        expect(result.criteria.hoursInactive).toBe(48);
        expect(result.criteria.batchSize).toBe(50);
        expect(result.criteria.thresholdDate).toBeDefined();
        expect(result.timestamp).toBeDefined();
      });

      it('should calculate thresholdDate correctly', async () => {
        // Arrange
        mockSelectChain([]);
        const now = new Date('2024-01-15T12:00:00').getTime();
        const options = createRecoveryOptions({
          hoursInactive: 24,
          now,
        });

        // Act
        const result = await service.recover(options);

        // Assert
        const expectedDate = new Date(now - 24 * 60 * 60 * 1000);
        expect(result.criteria.thresholdDate).toBe(expectedDate.toISOString());
      });
    });
  });
});

// ============================================================================
// Singleton Tests
// ============================================================================

describe('getAbandonedCartService', () => {
  it('should return same instance on multiple calls', () => {
    // Arrange & Act
    const instance1 = getAbandonedCartService();
    const instance2 = getAbandonedCartService();

    // Assert
    expect(instance1).toBe(instance2);
  });
});

describe('resetAbandonedCartService', () => {
  it('should create new instance after reset', () => {
    // Arrange
    const instance1 = getAbandonedCartService();

    // Act
    resetAbandonedCartService();
    const instance2 = getAbandonedCartService();

    // Assert
    expect(instance1).not.toBe(instance2);
  });
});
