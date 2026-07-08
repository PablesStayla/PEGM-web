import 'reflect-metadata';
import type { InventoryService } from '@pranakaia/inventory';
import { AuditService, Result } from '@pranakaia/shared-kernel';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildCart, MOCK_CUSTOMER_ID } from './checkout.helpers';
import { CheckoutService } from './checkout.service';
import type { CheckoutPaymentService } from './checkout-payment.service';
import type { CheckoutValidator } from './checkout-validator.service';
import type { OrderService } from './orders/order.service';

describe('CheckoutService - Orchestration', () => {
  let checkoutService: CheckoutService;
  let createOrderMock: ReturnType<typeof vi.fn>;
  let reserveStockMock: ReturnType<typeof vi.fn>;
  let releaseStockMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    AuditService.configureWriter(vi.fn());
    createOrderMock = vi.fn().mockResolvedValue(Result.ok({ id: 'order-1', orderNumber: 'ORD-1' }));
    reserveStockMock = vi
      .fn()
      .mockResolvedValue(Result.ok([{ productId: 'p1', quantity: 1, name: 'Item 1' }]));
    releaseStockMock = vi.fn().mockResolvedValue(Result.ok(undefined));

    const orderService = { createOrder: createOrderMock } as unknown as OrderService;
    const inventoryService = {
      reserveStockForOrder: reserveStockMock,
      releaseStockForOrder: releaseStockMock,
    } as unknown as InventoryService;

    // We can use real or mocked sub-services
    const validator = {
      validateCartContents: vi.fn().mockResolvedValue(Result.ok(undefined)),
    } as unknown as CheckoutValidator;
    const paymentService = {
      initiatePayment: vi
        .fn()
        .mockResolvedValue(Result.ok({ order: { id: 'order-1' }, sessionUrl: 'url' })),
    } as unknown as CheckoutPaymentService;

    checkoutService = new CheckoutService(
      orderService,
      inventoryService,
      validator,
      paymentService,
    );
  });

  afterEach(() => {
    AuditService.configureWriter(undefined);
  });

  it('coordina el proceso de checkout exitosamente', async () => {
    const cart = buildCart(MOCK_CUSTOMER_ID);
    const result = await checkoutService.processCheckout(cart, { email: 't@t.com', address: {} });

    expect(result.success).toBe(true);
    expect(reserveStockMock).toHaveBeenCalled();
    expect(createOrderMock).toHaveBeenCalled();
  });

  it('libera stock si falla la creacion de la orden', async () => {
    createOrderMock.mockResolvedValue(Result.err(new Error('fail')));
    const cart = buildCart(MOCK_CUSTOMER_ID);

    await checkoutService.processCheckout(cart, { email: 't@t.com', address: {} });

    expect(releaseStockMock).toHaveBeenCalled();
  });
});
