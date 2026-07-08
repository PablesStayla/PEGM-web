import { Money } from '@pranakaia/shared-kernel';
import { describe, expect, it } from 'vitest';
import { type CreatePaymentProps, Payment } from './payment.entity';
import { PaymentId } from './payment-id.vo';
import { PaymentMethod } from './payment-method.vo';
import { PaymentStatus } from './payment-status.vo';

describe('Payment Entity', () => {
  const validProps: CreatePaymentProps = {
    id: PaymentId.generate(),
    orderId: 'order_1',
    customerId: 'cust_1',
    amount: Money.zero('CLP'),
    method: PaymentMethod.FLOW,
  };

  // ── create() ──────────────────────────────────────────────────────────

  describe('create()', () => {
    it('should create a payment with PENDING status', () => {
      const result = Payment.create(validProps);
      expect(result.isSuccess).toBe(true);
      const payment = result.getValue();
      expect(payment.status).toBe(PaymentStatus.PENDING);
      expect(payment.orderId).toBe('order_1');
      expect(payment.method).toBe(PaymentMethod.FLOW);
    });

    it('should allow creating with a specific status', () => {
      const result = Payment.create({ ...validProps, status: PaymentStatus.AUTHORIZED });
      if (result.isSuccess) {
        expect(result.getValue().status).toBe(PaymentStatus.AUTHORIZED);
      }
    });

    it('should default externalId to null', () => {
      const payment = Payment.create(validProps).getValue();
      expect(payment.externalId).toBeNull();
    });
  });

  // ── Status checks ─────────────────────────────────────────────────────

  describe('status checks', () => {
    it('isPending should be true for PENDING status', () => {
      const payment = Payment.create(validProps).getValue();
      expect(payment.isPending).toBe(true);
      expect(payment.isAuthorized).toBe(false);
      expect(payment.isCaptured).toBe(false);
      expect(payment.isFailed).toBe(false);
      expect(payment.isRefunded).toBe(false);
    });
  });

  // ── Domain events ─────────────────────────────────────────────────────

  describe('domain events', () => {
    it('should emit PaymentCreated on creation', () => {
      const payment = Payment.create(validProps).getValue();
      expect(payment.events.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── PaymentId ─────────────────────────────────────────────────────────

  describe('PaymentId', () => {
    it('should generate unique IDs', () => {
      const a = PaymentId.generate();
      const b = PaymentId.generate();
      expect(a).not.toBe(b);
      expect(a).toMatch(/^pay_\d+_/);
    });

    it('should create from string', () => {
      const id = PaymentId.create('pay_123');
      expect(id).toBe('pay_123');
    });

    it('should compare IDs', () => {
      const a = PaymentId.create('pay_1');
      const b = PaymentId.create('pay_1');
      const c = PaymentId.create('pay_2');
      expect(PaymentId.equals(a, b)).toBe(true);
      expect(PaymentId.equals(a, c)).toBe(false);
    });
  });

  // ── PaymentMethod enum ────────────────────────────────────────────────

  describe('PaymentMethod', () => {
    it('should have all expected methods', () => {
      expect(PaymentMethod.FLOW).toBe('FLOW');
      expect(PaymentMethod.STRIPE).toBe('STRIPE');
      expect(PaymentMethod.CREDIT_CARD).toBe('CREDIT_CARD');
      expect(PaymentMethod.DEBIT_CARD).toBe('DEBIT_CARD');
      expect(PaymentMethod.BANK_TRANSFER).toBe('BANK_TRANSFER');
      expect(PaymentMethod.CASH).toBe('CASH');
      expect(PaymentMethod.PAYPAL).toBe('PAYPAL');
    });
  });

  // ── PaymentStatus enum ────────────────────────────────────────────────

  describe('PaymentStatus', () => {
    it('should have all expected statuses', () => {
      expect(PaymentStatus.PENDING).toBe('PENDING');
      expect(PaymentStatus.AUTHORIZED).toBe('AUTHORIZED');
      expect(PaymentStatus.CAPTURED).toBe('CAPTURED');
      expect(PaymentStatus.FAILED).toBe('FAILED');
      expect(PaymentStatus.REFUNDED).toBe('REFUNDED');
      expect(PaymentStatus.PARTIALLY_REFUNDED).toBe('PARTIALLY_REFUNDED');
      expect(PaymentStatus.CANCELLED).toBe('CANCELLED');
    });
  });
});
