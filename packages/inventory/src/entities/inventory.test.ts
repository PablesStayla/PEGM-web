import { ProductIdHelper } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it } from 'vitest';
import { Inventory, InventoryId } from '../domain/entities/inventory.entity';
import {
  InventoryAdjusted,
  InventoryReleased,
  InventoryReserved,
  StockCounted,
} from '../domain/events/inventory.events';

const createTestInventory = (
  overrides?: Partial<{ quantity: number; reserved: number; safetyStock: number }>,
) => ({
  id: InventoryId.generate(),
  productId: ProductIdHelper.generate(),
  sku: 'TEST-SKU-001',
  quantity: overrides?.quantity ?? 100,
  reserved: overrides?.reserved ?? 0,
  safetyStock: overrides?.safetyStock ?? 10,
  location: 'MAIN_WAREHOUSE',
});

describe('Inventory Aggregate - Core Logic', () => {
  describe('Creation & Validation', () => {
    it('should create valid inventory', () => {
      const props = createTestInventory();
      const result = Inventory.create(props);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.getValue().sku).toBe('TEST-SKU-001');
        expect(result.getValue().available).toBe(90); // 100 - 0 - 10
      }
    });

    it('should reject negative quantities on creation', () => {
      expect(Inventory.create(createTestInventory({ quantity: -1 })).success).toBe(false);
      expect(Inventory.create(createTestInventory({ reserved: -1 })).success).toBe(false);
      expect(Inventory.create(createTestInventory({ safetyStock: -1 })).success).toBe(false);
    });
  });

  describe('Stock Operations', () => {
    let inventory: Inventory;

    beforeEach(() => {
      const result = Inventory.create(createTestInventory());
      if (result.success) {
        inventory = result.getValue();
      }
    });

    it('should reserve stock and apply event', () => {
      const result = inventory.reserveStock(30, 'order-123');

      expect(result.success).toBe(true);
      expect(inventory.reserved).toBe(30);
      expect(inventory.available).toBe(60);

      const events = inventory.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(InventoryReserved);
    });

    it('should fail to reserve more than available', () => {
      const result = inventory.reserveStock(95); // Available is 90
      expect(result.success).toBe(false);
    });

    it('should release reserved stock and apply event', () => {
      inventory.reserveStock(50);
      inventory.markCommitted(); // Clear previous events

      const result = inventory.releaseReserved(20);
      expect(result.success).toBe(true);
      expect(inventory.reserved).toBe(30);

      const events = inventory.getUncommittedEvents();
      expect(events[0]).toBeInstanceOf(InventoryReleased);
    });

    it('should consume reserved stock', () => {
      inventory.reserveStock(50);
      inventory.markCommitted();

      const result = inventory.consumeStock(20);
      expect(result.success).toBe(true);
      expect(inventory.reserved).toBe(30);
      expect(inventory.quantity).toBe(80);

      const events = inventory.getUncommittedEvents();
      expect(events[0]).toBeInstanceOf(StockCounted);
    });

    it('should adjust stock (add/remove) and apply events', () => {
      inventory.markCommitted();

      inventory.addStock(50);
      expect(inventory.quantity).toBe(150);

      inventory.removeStock(20);
      expect(inventory.quantity).toBe(130);

      const events = inventory.getUncommittedEvents();
      expect(events).toHaveLength(2);
      expect(events[0]).toBeInstanceOf(InventoryAdjusted);
      expect(events[1]).toBeInstanceOf(InventoryAdjusted);
    });

    it('should fail to remove more than available', () => {
      // quantity 100, safety 10, available 90
      const result = inventory.removeStock(95);
      expect(result.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero quantity available', () => {
      const result = Inventory.create(createTestInventory({ quantity: 10, safetyStock: 10 }));
      if (!result.success) {
        return;
      }
      const inv = result.getValue();

      expect(inv.available).toBe(0);
      expect(inv.reserveStock(1).success).toBe(false);
    });

    it('should calculate safety buffer properties', () => {
      const result = Inventory.create(createTestInventory({ quantity: 100, safetyStock: 25 }));
      if (!result.success) {
        return;
      }
      const inv = result.getValue();

      expect(inv.getSafetyBuffer().percentage).toBe(25);
      expect(inv.getSafetyBuffer().absolute).toBe(25);
    });

    it('should calculate safety buffer properties', () => {
      const result = Inventory.create(createTestInventory({ quantity: 100, safetyStock: 25 }));
      if (!result.success) {
        throw result.errorValue;
      }
      const inv = result.getValue();
      const buffer = inv.getSafetyBuffer();
      expect(buffer.percentage).toBe(25);
      expect(buffer.absolute).toBe(25);
    });
  });
});
