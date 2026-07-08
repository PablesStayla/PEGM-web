import { ProductIdHelper } from '@pranakaia/shared-kernel';
import { describe, expect, it } from 'vitest';
import {
  InventoryAdjusted,
  InventoryReleased,
  InventoryReserved,
  StockCounted,
} from '../events/inventory.events';
import { Inventory, InventoryId } from './inventory.entity';

const createInventory = (
  overrides?: Partial<{ quantity: number; reserved: number; safetyStock: number }>,
) =>
  Inventory.create({
    id: InventoryId.generate(),
    productId: ProductIdHelper.generate(),
    sku: 'TEST-SKU-001',
    quantity: overrides?.quantity ?? 100,
    reserved: overrides?.reserved ?? 0,
    safetyStock: overrides?.safetyStock ?? 10,
    location: 'MAIN_WAREHOUSE',
  });

describe('Inventory Aggregate — Deep Tests', () => {
  // ── Validation ────────────────────────────────────────────────────────

  describe('create() validation', () => {
    it('should reject negative quantity', () => {
      expect(createInventory({ quantity: -1 }).isFailure).toBe(true);
    });

    it('should reject negative reserved', () => {
      expect(createInventory({ reserved: -1 }).isFailure).toBe(true);
    });

    it('should reject negative safetyStock', () => {
      expect(createInventory({ safetyStock: -1 }).isFailure).toBe(true);
    });

    it('should accept zero safetyStock', () => {
      const result = createInventory({ safetyStock: 0 });
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().available).toBe(100); // 100 - 0 - 0
    });

    it('should compute available = quantity - reserved - safetyStock', () => {
      const result = createInventory({ quantity: 200, reserved: 30, safetyStock: 20 });
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().available).toBe(150); // 200 - 30 - 20
    });

    it('should clamp available to 0 (never negative)', () => {
      const result = createInventory({ quantity: 5, reserved: 3, safetyStock: 10 });
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().available).toBe(0);
    });
  });

  // ── reconstitute ──────────────────────────────────────────────────────

  describe('reconstitute()', () => {
    it('should restore from primitives', () => {
      const inv = createInventory()!.getValue();
      const primitives = inv.toPrimitives();
      const restored = Inventory.reconstitute({
        id: primitives.id as any,
        productId: primitives.productId as any,
        sku: primitives.sku,
        quantity: primitives.quantity,
        reserved: primitives.reserved,
        safetyStock: primitives.safetyStock,
        location: primitives.location,
        lastSyncAt: primitives.lastSyncAt ? new Date(primitives.lastSyncAt) : null,
      });
      expect(restored.quantity).toBe(100);
      expect(restored.available).toBe(90);
    });
  });

  // ── addStock ──────────────────────────────────────────────────────────

  describe('addStock()', () => {
    it('should increase quantity and emit InventoryAdjusted', () => {
      const inv = createInventory()!.getValue();
      inv.markCommitted();
      const result = inv.addStock(50, 'restock');
      expect(result.isSuccess).toBe(true);
      expect(inv.quantity).toBe(150);
      expect(inv.available).toBe(140);
      const events = inv.getUncommittedEvents();
      expect(events[0]).toBeInstanceOf(InventoryAdjusted);
    });

    it('should fail for zero quantity', () => {
      const inv = createInventory()!.getValue();
      expect(inv.addStock(0).isFailure).toBe(true);
    });

    it('should fail for negative quantity', () => {
      const inv = createInventory()!.getValue();
      expect(inv.addStock(-5).isFailure).toBe(true);
    });
  });

  // ── removeStock ───────────────────────────────────────────────────────

  describe('removeStock()', () => {
    it('should decrease quantity and emit InventoryAdjusted', () => {
      const inv = createInventory()!.getValue();
      inv.markCommitted();
      const result = inv.removeStock(20, 'damaged');
      expect(result.isSuccess).toBe(true);
      expect(inv.quantity).toBe(80);
    });

    it('should fail when removing more than available', () => {
      const inv = createInventory()!.getValue();
      // available = 100 - 0 - 10 = 90
      expect(inv.removeStock(91).isFailure).toBe(true);
    });

    it('should fail for zero or negative', () => {
      const inv = createInventory()!.getValue();
      expect(inv.removeStock(0).isFailure).toBe(true);
      expect(inv.removeStock(-1).isFailure).toBe(true);
    });
  });

  // ── reserveStock ──────────────────────────────────────────────────────

  describe('reserveStock()', () => {
    it('should increase reserved and emit InventoryReserved', () => {
      const inv = createInventory()!.getValue();
      inv.markCommitted();
      const result = inv.reserveStock(50, 'order_1');
      expect(result.isSuccess).toBe(true);
      expect(inv.reserved).toBe(50);
      expect(inv.available).toBe(40);
      expect(inv.getUncommittedEvents()[0]).toBeInstanceOf(InventoryReserved);
    });

    it('should fail when reserving more than available', () => {
      const inv = createInventory()!.getValue();
      // available = 90
      expect(inv.reserveStock(91).isFailure).toBe(true);
    });

    it('should fail for zero or negative', () => {
      const inv = createInventory()!.getValue();
      expect(inv.reserveStock(0).isFailure).toBe(true);
    });

    it('should allow multiple reservations up to available', () => {
      const inv = createInventory()!.getValue();
      expect(inv.reserveStock(30).isSuccess).toBe(true);
      expect(inv.reserveStock(30).isSuccess).toBe(true);
      expect(inv.reserveStock(31).isFailure).toBe(true); // only 30 left
    });
  });

  // ── releaseReserved ───────────────────────────────────────────────────

  describe('releaseReserved()', () => {
    it('should decrease reserved and emit InventoryReleased', () => {
      const inv = createInventory()!.getValue();
      inv.reserveStock(50);
      inv.markCommitted();
      const result = inv.releaseReserved(20, 'order_cancelled');
      expect(result.isSuccess).toBe(true);
      expect(inv.reserved).toBe(30);
      expect(inv.getUncommittedEvents()[0]).toBeInstanceOf(InventoryReleased);
    });

    it('should fail when releasing more than reserved', () => {
      const inv = createInventory()!.getValue();
      inv.reserveStock(10);
      expect(inv.releaseReserved(11).isFailure).toBe(true);
    });

    it('should fail for zero or negative', () => {
      const inv = createInventory()!.getValue();
      expect(inv.releaseReserved(0).isFailure).toBe(true);
    });
  });

  // ── consumeStock ──────────────────────────────────────────────────────

  describe('consumeStock()', () => {
    it('should decrease both quantity and reserved, emit StockCounted', () => {
      const inv = createInventory()!.getValue();
      inv.reserveStock(50);
      inv.markCommitted();
      const result = inv.consumeStock(20);
      expect(result.isSuccess).toBe(true);
      expect(inv.quantity).toBe(80);
      expect(inv.reserved).toBe(30);
      expect(inv.getUncommittedEvents()[0]).toBeInstanceOf(StockCounted);
    });

    it('should fail when consuming more than reserved', () => {
      const inv = createInventory()!.getValue();
      inv.reserveStock(10);
      expect(inv.consumeStock(11).isFailure).toBe(true);
    });

    it('should fail for zero or negative', () => {
      const inv = createInventory()!.getValue();
      expect(inv.consumeStock(0).isFailure).toBe(true);
    });
  });

  // ── countStock ────────────────────────────────────────────────────────

  describe('countStock()', () => {
    it('should set quantity directly and update lastSyncAt', () => {
      const inv = createInventory()!.getValue();
      inv.markCommitted();
      const result = inv.countStock(95);
      expect(result.isSuccess).toBe(true);
      expect(inv.quantity).toBe(95);
      expect(inv.lastSyncAt).not.toBeNull();
    });

    it('should fail for negative quantity', () => {
      const inv = createInventory()!.getValue();
      expect(inv.countStock(-1).isFailure).toBe(true);
    });

    it('should accept zero', () => {
      const inv = createInventory()!.getValue();
      expect(inv.countStock(0).isSuccess).toBe(true);
    });
  });

  // ── updateSafetyStock ─────────────────────────────────────────────────

  describe('updateSafetyStock()', () => {
    it('should update safety stock and recalculate available', () => {
      const inv = createInventory()!.getValue();
      const result = inv.updateSafetyStock(25);
      expect(result.isSuccess).toBe(true);
      expect(inv.safetyStock).toBe(25);
      expect(inv.available).toBe(75); // 100 - 0 - 25
    });

    it('should fail for negative', () => {
      const inv = createInventory()!.getValue();
      expect(inv.updateSafetyStock(-1).isFailure).toBe(true);
    });
  });

  // ── getSafetyBuffer ───────────────────────────────────────────────────

  describe('getSafetyBuffer()', () => {
    it('should calculate percentage correctly', () => {
      const inv = createInventory({ quantity: 200, safetyStock: 50 })!.getValue();
      const buffer = inv.getSafetyBuffer();
      expect(buffer.percentage).toBe(25);
      expect(buffer.absolute).toBe(50);
      expect(buffer.calculated).toBe(150);
    });

    it('should return 0% for zero quantity', () => {
      const inv = createInventory({ quantity: 0, safetyStock: 10 })!.getValue();
      const buffer = inv.getSafetyBuffer();
      expect(buffer.percentage).toBe(0);
    });
  });

  // ── Full workflow ─────────────────────────────────────────────────────

  describe('full order workflow', () => {
    it('should handle reserve → consume → restock cycle', () => {
      const inv = createInventory()!.getValue();
      expect(inv.available).toBe(90);

      // Customer places order
      inv.reserveStock(40, 'order_1');
      expect(inv.reserved).toBe(40);
      expect(inv.available).toBe(50);

      // Order shipped — consume reserved
      inv.consumeStock(40);
      expect(inv.reserved).toBe(0);
      expect(inv.quantity).toBe(60);
      expect(inv.available).toBe(50);

      // Restock arrives
      inv.addStock(30, 'restock');
      expect(inv.quantity).toBe(90);
      expect(inv.available).toBe(80);
    });

    it('should handle reserve → release (order cancelled)', () => {
      const inv = createInventory()!.getValue();
      inv.reserveStock(50, 'order_2');
      expect(inv.available).toBe(40);

      inv.releaseReserved(50, 'order_cancelled');
      expect(inv.reserved).toBe(0);
      expect(inv.available).toBe(90);
    });
  });
});
