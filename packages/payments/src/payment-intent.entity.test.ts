import { Money } from '@pranakaia/shared-kernel';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  PaymentAuthorized,
  PaymentCancelled,
  PaymentCaptured,
  PaymentFailed,
  PaymentInitiated,
  PaymentRefunded,
} from '../events/payment.events';
import { PaymentIntent, PaymentMethod } from './payment-intent.entity';

const createTestPayment = (): PaymentIntent => {
  const result = PaymentIntent.create({
    orderId: 'order-123',
    amount: Money.create(100, 'USD').unwrap(),
    currency: 'USD',
    method: PaymentMethod.CREDIT_CARD,
  });
  if (!result.success) {
    throw result.error;
  }
  return result.value;
};

describe('PaymentIntent Entity - Creation', () => {
  describe('creation', () => {
    it('should create payment intent', () => {
      const payment = createTestPayment();

      expect(payment.orderId).toBe('order-123');
      expect(payment.amount.amount).toBe(100);
      expect(payment.status).toBe('PENDING');
    });

    it('should emit PaymentInitiated event', () => {
      const result = PaymentIntent.create({
        orderId: 'order-123',
        amount: Money.create(100, 'USD').unwrap(),
        currency: 'USD',
        method: PaymentMethod.CREDIT_CARD,
      });

      if (result.success) {
        const events = result.value.getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(PaymentInitiated);
      }
    });

    it('should reject negative amount', () => {
      const result = PaymentIntent.create({
        orderId: 'order-123',
        amount: Money.create(-10, 'USD').unwrap(),
        currency: 'USD',
        method: PaymentMethod.CREDIT_CARD,
      });

      expect(result.success).toBe(false);
    });

    it('should reject zero amount', () => {
      const result = PaymentIntent.create({
        orderId: 'order-123',
        amount: Money.create(0, 'USD').unwrap(),
        currency: 'USD',
        method: PaymentMethod.CREDIT_CARD,
      });

      expect(result.success).toBe(false);
    });
  });
});

describe('PaymentIntent Entity - Authorization', () => {
  let payment: PaymentIntent;

  beforeEach(() => {
    payment = createTestPayment();
  });

  describe('authorize', () => {
    it('should authorize payment', () => {
      const result = payment.authorize();

      expect(result.success).toBe(true);
      expect(payment.status).toBe('AUTHORIZED');
    });

    it('should emit PaymentAuthorized event', () => {
      payment.clearEvents();
      payment.authorize();

      const events = payment.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PaymentAuthorized);
    });

    it('should fail if already captured', () => {
      payment.authorize();
      payment.capture();

      const result = payment.authorize();
      expect(result.success).toBe(false);
    });

    it('should fail if already cancelled', () => {
      payment.cancel();

      const result = payment.authorize();
      expect(result.success).toBe(false);
    });
  });
});

describe('PaymentIntent Entity - Capture & Refund', () => {
  let payment: PaymentIntent;

  beforeEach(() => {
    payment = createTestPayment();
  });

  describe('capture', () => {
    it('should capture authorized payment', () => {
      payment.authorize();
      const result = payment.capture();

      expect(result.success).toBe(true);
      expect(payment.status).toBe('CAPTURED');
    });

    it('should emit PaymentCaptured event', () => {
      payment.authorize();
      payment.clearEvents();
      payment.capture();

      const events = payment.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PaymentCaptured);
    });

    it('should fail if not authorized', () => {
      const result = payment.capture();

      expect(result.success).toBe(false);
    });
  });

  describe('refund', () => {
    it('should refund captured payment', () => {
      payment.authorize();
      payment.capture();
      const result = payment.refund();

      expect(result.success).toBe(true);
      expect(payment.status).toBe('REFUNDED');
    });

    it('should emit PaymentRefunded event', () => {
      payment.authorize();
      payment.capture();
      payment.clearEvents();
      payment.refund();

      const events = payment.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PaymentRefunded);
    });
  });
});

describe('PaymentIntent Entity - Cancel & Failure', () => {
  let payment: PaymentIntent;

  beforeEach(() => {
    payment = createTestPayment();
  });

  describe('cancel', () => {
    it('should cancel payment', () => {
      const result = payment.cancel();

      expect(result.success).toBe(true);
      expect(payment.status).toBe('CANCELLED');
    });

    it('should emit PaymentCancelled event', () => {
      payment.clearEvents();
      payment.cancel();

      const events = payment.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PaymentCancelled);
    });

    it('should fail if already captured', () => {
      payment.authorize();
      payment.capture();

      const result = payment.cancel();
      expect(result.success).toBe(false);
    });
  });

  describe('fail', () => {
    it('should fail payment', () => {
      const result = payment.fail('Payment failed');

      expect(result.success).toBe(true);
      expect(payment.status).toBe('FAILED');
    });

    it('should emit PaymentFailed event', () => {
      payment.clearEvents();
      payment.fail('Test failure');

      const events = payment.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PaymentFailed);
    });
  });
});
