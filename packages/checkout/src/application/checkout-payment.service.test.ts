import 'reflect-metadata';
import type { PaymentGateway } from '@pranakaia/payments';
import { AuditService, DomainError, Money, Result } from '@pranakaia/shared-kernel';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildCart, MOCK_CUSTOMER_ID } from './checkout.helpers';
import { CheckoutPaymentService } from './checkout-payment.service';

describe('CheckoutPaymentService', () => {
  let paymentService: CheckoutPaymentService;
  let createSessionMock: ReturnType<typeof vi.fn>;
  let auditLogs: any[];

  beforeEach(() => {
    auditLogs = [];
    AuditService.configureWriter(async (entry) => auditLogs.push(entry));
    createSessionMock = vi.fn().mockResolvedValue(
      Result.ok({
        url: 'https://pay.example.com/session-1',
        sessionId: 'session-1',
      }),
    );
    const paymentGateway = { createSession: createSessionMock } as unknown as PaymentGateway;
    paymentService = new CheckoutPaymentService(paymentGateway);
  });

  afterEach(() => {
    AuditService.configureWriter(undefined);
  });

  it('inicia el pago exitosamente', async () => {
    const cart = buildCart(MOCK_CUSTOMER_ID);
    const pricing = {
      total: Money.create(10000, 'CLP').value!,
      subtotal: Money.create(10000, 'CLP').value!,
      tax: Money.create(0, 'CLP').value!,
      shipping: Money.create(0, 'CLP').value!,
    };

    const result = await paymentService.initiatePayment(
      { id: 'order-1' as any },
      cart,
      { email: 'test@example.com', address: {} },
      pricing,
    );

    expect(result.success).toBe(true);
    expect(result.value.sessionUrl).toBe('https://pay.example.com/session-1');
    expect(auditLogs.some((l) => l.action === 'payment_initiated')).toBe(true);
  });

  it('maneja errores de la pasarela de pago', async () => {
    createSessionMock.mockResolvedValue(
      Result.err(new DomainError('Gateway Down', 'GATEWAY_ERROR')),
    );

    const cart = buildCart(MOCK_CUSTOMER_ID);
    const result = await paymentService.initiatePayment(
      { id: 'order-1' as any },
      cart,
      { email: 'test@example.com', address: {} },
      { total: Money.create(10000, 'CLP').value! } as any,
    );

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('PAYMENT_FAILED');
    expect(auditLogs.some((l) => l.action === 'checkout_failed')).toBe(true);
  });
});
