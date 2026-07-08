import { Money } from '@pranakaia/shared-kernel';
import { describe, expect, it } from 'vitest';
import {
  PaymentAuthorized,
  PaymentCaptured,
  PaymentCreated,
  PaymentFailed,
  PaymentRefunded,
} from '../events/payment.events';
import { type CreatePaymentProps, Payment } from './payment.entity';
import { PaymentId } from './payment-id.vo';
import { PaymentMethod } from './payment-method.vo';
import { PaymentStatus } from './payment-status.vo';

describe('Payment Entity — Transition Tests', () => {
  const createProps: CreatePaymentProps = {
    id: PaymentId.generate(),
    orderId: 'order_1',
    customerId: 'cust_1',
    amount: Money.zero('CLP'),
    method: PaymentMethod.FLOW,
  };

  const freshPayment = () => Payment.create(createProps).getValue();

  // ── Lifecycle: PENDING → AUTHORIZED → CAPTURED → REFUNDED ─────────────

  describe('happy path', () => {
    it('should transition PENDING → AUTHORIZED → CAPTURED → REFUNDED', () => {
      const payment = freshPayment();
      expect(payment.status).toBe(PaymentStatus.PENDING);

      // Authorize
      const authResult = payment.authorize('ext_sess_123');
      expect(authResult.isSuccess).toBe(true);
      expect(payment.status).toBe(PaymentStatus.AUTHORIZED);
      expect(payment.externalId).toBe('ext_sess_123');
      expect(payment.isAuthorized).toBe(true);
      expect(payment.canCapture).toBe(true);

      // Capture
      const captureResult = payment.capture();
      expect(captureResult.isSuccess).toBe(true);
      expect(payment.status).toBe(PaymentStatus.CAPTURED);
      expect(payment.isCaptured).toBe(true);
      expect(payment.canRefund).toBe(true);

      // Refund
      const refundResult = payment.refund();
      expect(refundResult.isSuccess).toBe(true);
      expect(payment.status).toBe(PaymentStatus.REFUNDED);
      expect(payment.isRefunded).toBe(true);
    });
  });

  // ── Invalid transitions ───────────────────────────────────────────────

  describe('invalid transitions', () => {
    it('should fail to authorize from non-PENDING status', () => {
      const payment = freshPayment();
      payment.authorize('ext_1');
      const result = payment.authorize('ext_2'); // Already AUTHORIZED
      expect(result.isFailure).toBe(true);
    });

    it('should fail to capture from PENDING (must authorize first)', () => {
      const payment = freshPayment();
      const result = payment.capture();
      expect(result.isFailure).toBe(true);
      expect(payment.status).toBe(PaymentStatus.PENDING);
    });

    it('should fail to capture from CAPTURED (already captured)', () => {
      const payment = freshPayment();
      payment.authorize('ext_1');
      payment.capture();
      const result = payment.capture();
      expect(result.isFailure).toBe(true);
    });

    it('should fail to refund from PENDING', () => {
      const payment = freshPayment();
      const result = payment.refund();
      expect(result.isFailure).toBe(true);
    });

    it('should fail to refund from AUTHORIZED', () => {
      const payment = freshPayment();
      payment.authorize('ext_1');
      const result = payment.refund();
      expect(result.isFailure).toBe(true);
    });

    it('should fail to refund from REFUNDED (already refunded)', () => {
      const payment = freshPayment();
      payment.authorize('ext_1');
      payment.capture();
      payment.refund();
      const result = payment.refund();
      expect(result.isFailure).toBe(true);
    });
  });

  // ── fail() path ───────────────────────────────────────────────────────

  describe('fail()', () => {
    it('should transition to FAILED from PENDING', () => {
      const payment = freshPayment();
      payment.fail('card_declined');
      expect(payment.status).toBe(PaymentStatus.FAILED);
      expect(payment.isFailed).toBe(true);
    });

    it('should emit PaymentFailed event', () => {
      const payment = freshPayment();
      payment.clearEvents();
      payment.fail('insufficient_funds');
      const events = payment.events;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PaymentFailed);
    });
  });

  // ── Domain events ─────────────────────────────────────────────────────

  describe('domain events', () => {
    it('should emit PaymentCreated on creation', () => {
      const payment = freshPayment();
      const createdEvents = payment.events.filter((e) => e instanceof PaymentCreated);
      expect(createdEvents).toHaveLength(1);
    });

    it('should emit PaymentAuthorized on authorize', () => {
      const payment = freshPayment();
      payment.clearEvents();
      payment.authorize('ext_1');
      const events = payment.events;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PaymentAuthorized);
    });

    it('should emit PaymentCaptured on capture', () => {
      const payment = freshPayment();
      payment.authorize('ext_1');
      payment.clearEvents();
      payment.capture();
      const events = payment.events;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PaymentCaptured);
    });

    it('should emit PaymentRefunded on refund', () => {
      const payment = freshPayment();
      payment.authorize('ext_1');
      payment.capture();
      payment.clearEvents();
      payment.refund();
      const events = payment.events;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PaymentRefunded);
    });

    it('should accumulate events across transitions', () => {
      const payment = freshPayment();
      payment.authorize('ext_1');
      payment.capture();
      expect(payment.events.length).toBeGreaterThanOrEqual(3); // Created + Authorized + Captured
    });

    it('should clear events', () => {
      const payment = freshPayment();
      payment.clearEvents();
      expect(payment.events).toHaveLength(0);
    });
  });

  // ── toPrimitives() ────────────────────────────────────────────────────

  describe('toPrimitives()', () => {
    it('should serialize all fields', () => {
      const payment = freshPayment();
      const p = payment.toPrimitives();
      expect(p.orderId).toBe('order_1');
      expect(p.customerId).toBe('cust_1');
      expect(p.method).toBe(PaymentMethod.FLOW);
      expect(p.status).toBe(PaymentStatus.PENDING);
      expect(p.externalId).toBeNull();
      expect(p.authorizedAt).toBeNull();
      expect(p.failureReason).toBeNull();
    });

    it('should include timestamps after transitions', () => {
      const payment = freshPayment();
      payment.authorize('ext_1');
      payment.capture();
      const p = payment.toPrimitives();
      expect(p.authorizedAt).toBeTruthy();
      expect(p.capturedAt).toBeTruthy();
    });
  });

  // ── Status predicate consistency ──────────────────────────────────────

  describe('status predicates', () => {
    it('should have exactly one true predicate per status', () => {
      const payment = freshPayment();
      const predicates = [
        payment.isPending,
        payment.isAuthorized,
        payment.isCaptured,
        payment.isFailed,
        payment.isRefunded,
      ];
      expect(predicates.filter(Boolean)).toHaveLength(1);

      payment.authorize('ext_1');
      const afterAuth = [
        payment.isPending,
        payment.isAuthorized,
        payment.isCaptured,
        payment.isFailed,
        payment.isRefunded,
      ];
      expect(afterAuth.filter(Boolean)).toHaveLength(1);

      payment.capture();
      const afterCapture = [
        payment.isPending,
        payment.isAuthorized,
        payment.isCaptured,
        payment.isFailed,
        payment.isRefunded,
      ];
      expect(afterCapture.filter(Boolean)).toHaveLength(1);
    });
  });
});
