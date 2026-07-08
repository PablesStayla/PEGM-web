import { describe, expect, it } from 'vitest';
import { OrderStatus, OrderStatusApi, OrderStatusHelper } from './order-status.vo';

describe('OrderStatus', () => {
  // ── canTransitionTo ───────────────────────────────────────────────────

  describe('canTransitionTo()', () => {
    it('should allow PENDING → CONFIRMED', () => {
      expect(OrderStatusHelper.canTransitionTo(OrderStatus.PENDING, OrderStatus.CONFIRMED)).toBe(
        true,
      );
    });

    it('should allow PENDING → CANCELLED', () => {
      expect(OrderStatusHelper.canTransitionTo(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(
        true,
      );
    });

    it('should allow CONFIRMED → PROCESSING', () => {
      expect(OrderStatusHelper.canTransitionTo(OrderStatus.CONFIRMED, OrderStatus.PROCESSING)).toBe(
        true,
      );
    });

    it('should allow PROCESSING → SHIPPED', () => {
      expect(OrderStatusHelper.canTransitionTo(OrderStatus.PROCESSING, OrderStatus.SHIPPED)).toBe(
        true,
      );
    });

    it('should allow SHIPPED → DELIVERED', () => {
      expect(OrderStatusHelper.canTransitionTo(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).toBe(
        true,
      );
    });

    it('should allow DELIVERED → COMPLETED', () => {
      expect(OrderStatusHelper.canTransitionTo(OrderStatus.DELIVERED, OrderStatus.COMPLETED)).toBe(
        true,
      );
    });

    it('should allow DELIVERED → REFUNDED', () => {
      expect(OrderStatusHelper.canTransitionTo(OrderStatus.DELIVERED, OrderStatus.REFUNDED)).toBe(
        true,
      );
    });

    it('should allow COMPLETED → REFUNDED', () => {
      expect(OrderStatusHelper.canTransitionTo(OrderStatus.COMPLETED, OrderStatus.REFUNDED)).toBe(
        true,
      );
    });

    it('should reject invalid transition: PENDING → SHIPPED', () => {
      expect(OrderStatusHelper.canTransitionTo(OrderStatus.PENDING, OrderStatus.SHIPPED)).toBe(
        false,
      );
    });

    it('should reject invalid transition: SHIPPED → PENDING', () => {
      expect(OrderStatusHelper.canTransitionTo(OrderStatus.SHIPPED, OrderStatus.PENDING)).toBe(
        false,
      );
    });

    it('should reject any transition from CANCELLED', () => {
      expect(OrderStatusHelper.canTransitionTo(OrderStatus.CANCELLED, OrderStatus.PENDING)).toBe(
        false,
      );
      expect(OrderStatusHelper.canTransitionTo(OrderStatus.CANCELLED, OrderStatus.CONFIRMED)).toBe(
        false,
      );
    });

    it('should reject any transition from REFUNDED', () => {
      expect(OrderStatusHelper.canTransitionTo(OrderStatus.REFUNDED, OrderStatus.COMPLETED)).toBe(
        false,
      );
    });
  });

  // ── canCancel ─────────────────────────────────────────────────────────

  describe('canCancel()', () => {
    it('should allow cancel from PENDING', () => {
      expect(OrderStatusHelper.canCancel(OrderStatus.PENDING)).toBe(true);
    });

    it('should allow cancel from CONFIRMED', () => {
      expect(OrderStatusHelper.canCancel(OrderStatus.CONFIRMED)).toBe(true);
    });

    it('should allow cancel from PROCESSING', () => {
      expect(OrderStatusHelper.canCancel(OrderStatus.PROCESSING)).toBe(true);
    });

    it('should NOT allow cancel from SHIPPED', () => {
      expect(OrderStatusHelper.canCancel(OrderStatus.SHIPPED)).toBe(false);
    });

    it('should NOT allow cancel from DELIVERED', () => {
      expect(OrderStatusHelper.canCancel(OrderStatus.DELIVERED)).toBe(false);
    });

    it('should NOT allow cancel from COMPLETED', () => {
      expect(OrderStatusHelper.canCancel(OrderStatus.COMPLETED)).toBe(false);
    });

    it('should NOT allow cancel from already CANCELLED', () => {
      expect(OrderStatusHelper.canCancel(OrderStatus.CANCELLED)).toBe(false);
    });
  });

  // ── isFinal ───────────────────────────────────────────────────────────

  describe('isFinal()', () => {
    it('should be final for COMPLETED', () => {
      expect(OrderStatusHelper.isFinal(OrderStatus.COMPLETED)).toBe(true);
    });

    it('should be final for CANCELLED', () => {
      expect(OrderStatusHelper.isFinal(OrderStatus.CANCELLED)).toBe(true);
    });

    it('should be final for REFUNDED', () => {
      expect(OrderStatusHelper.isFinal(OrderStatus.REFUNDED)).toBe(true);
    });

    it('should NOT be final for PENDING', () => {
      expect(OrderStatusHelper.isFinal(OrderStatus.PENDING)).toBe(false);
    });

    it('should NOT be final for SHIPPED', () => {
      expect(OrderStatusHelper.isFinal(OrderStatus.SHIPPED)).toBe(false);
    });
  });

  // ── isPaid ────────────────────────────────────────────────────────────

  describe('isPaid()', () => {
    it('should be paid for CONFIRMED', () => {
      expect(OrderStatusHelper.isPaid(OrderStatus.CONFIRMED)).toBe(true);
    });

    it('should be paid for PROCESSING', () => {
      expect(OrderStatusHelper.isPaid(OrderStatus.PROCESSING)).toBe(true);
    });

    it('should be paid for SHIPPED', () => {
      expect(OrderStatusHelper.isPaid(OrderStatus.SHIPPED)).toBe(true);
    });

    it('should be paid for DELIVERED', () => {
      expect(OrderStatusHelper.isPaid(OrderStatus.DELIVERED)).toBe(true);
    });

    it('should be paid for COMPLETED', () => {
      expect(OrderStatusHelper.isPaid(OrderStatus.COMPLETED)).toBe(true);
    });

    it('should NOT be paid for PENDING', () => {
      expect(OrderStatusHelper.isPaid(OrderStatus.PENDING)).toBe(false);
    });

    it('should NOT be paid for CANCELLED', () => {
      expect(OrderStatusHelper.isPaid(OrderStatus.CANCELLED)).toBe(false);
    });

    it('should NOT be paid for REFUNDED', () => {
      expect(OrderStatusHelper.isPaid(OrderStatus.REFUNDED)).toBe(false);
    });
  });

  // ── OrderStatusApi delegation ─────────────────────────────────────────

  describe('OrderStatusApi', () => {
    it('should delegate canTransitionTo', () => {
      expect(OrderStatusApi.canTransitionTo(OrderStatus.PENDING, OrderStatus.CONFIRMED)).toBe(
        OrderStatusHelper.canTransitionTo(OrderStatus.PENDING, OrderStatus.CONFIRMED),
      );
    });

    it('should delegate canCancel', () => {
      expect(OrderStatusApi.canCancel(OrderStatus.PENDING)).toBe(
        OrderStatusHelper.canCancel(OrderStatus.PENDING),
      );
    });

    it('should delegate isFinal', () => {
      expect(OrderStatusApi.isFinal(OrderStatus.COMPLETED)).toBe(
        OrderStatusHelper.isFinal(OrderStatus.COMPLETED),
      );
    });

    it('should delegate isPaid', () => {
      expect(OrderStatusApi.isPaid(OrderStatus.CONFIRMED)).toBe(
        OrderStatusHelper.isPaid(OrderStatus.CONFIRMED),
      );
    });
  });
});
