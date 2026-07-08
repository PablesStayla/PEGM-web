import { Result } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from '@/providers/container';
import { getInventoryStatsAction, updateStockAction } from './index';

// Mock the container
vi.mock('@/providers/container', () => ({
  container: {
    inventoryService: {
      getInventoryStats: vi.fn(),
      updateStock: vi.fn(),
    },
  },
}));

// Mock the action client to skip middleware during tests if needed,
// or mock the auth provider it depends on.
vi.mock('@/providers/auth/server-session', () => ({
  serverAuthProvider: {
    requireAdmin: vi.fn().mockResolvedValue({ id: 'test-admin', role: 'admin' }),
  },
}));

describe('Inventory Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInventoryStatsAction', () => {
    it('should return stats on success', async () => {
      const mockStats = { totalStock: 100, activeProducts: 10 };
      (container.inventoryService.getInventoryStats as any).mockResolvedValue(Result.ok(mockStats));

      const result = await getInventoryStatsAction();

      expect(result?.data).toEqual(mockStats);
      expect(container.inventoryService.getInventoryStats).toHaveBeenCalled();
    });

    it('should throw AdminUIError on failure', async () => {
      (container.inventoryService.getInventoryStats as any).mockResolvedValue(
        Result.err(new Error('Domain Error')),
      );

      // next-safe-action catches the error and returns it in serverError
      const result = await getInventoryStatsAction();

      expect(result?.serverError).toBeDefined();
    });
  });

  describe('updateStockAction', () => {
    it('should update stock correctly', async () => {
      const input = { productId: 'prod-1', quantity: 50, reason: 'Restock' };
      (container.inventoryService.updateStock as any).mockResolvedValue(
        Result.ok({ id: 'prod-1', stockQuantity: 50 }),
      );

      const result = await updateStockAction(input);

      expect(result?.data?.stockQuantity).toBe(50);
      expect(container.inventoryService.updateStock).toHaveBeenCalledWith('prod-1', 50, 'Restock');
    });
  });
});
