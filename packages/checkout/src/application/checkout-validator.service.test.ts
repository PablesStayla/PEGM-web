import 'reflect-metadata';
import type { IProductRepository } from '@pranakaia/catalog';
import { AuditService, Result } from '@pranakaia/shared-kernel';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildCart, buildProduct, MOCK_CUSTOMER_ID } from './checkout.helpers';
import { CheckoutValidator } from './checkout-validator.service';

describe('CheckoutValidator', () => {
  let validator: CheckoutValidator;
  let findProductByIdMock: ReturnType<typeof vi.fn>;
  let auditLogs: any[];

  beforeEach(() => {
    auditLogs = [];
    AuditService.configureWriter(async (entry) => auditLogs.push(entry));
    findProductByIdMock = vi.fn().mockResolvedValue(Result.ok(buildProduct()));
    const productRepository = { findById: findProductByIdMock } as unknown as IProductRepository;
    validator = new CheckoutValidator(productRepository);
  });

  afterEach(() => {
    AuditService.configureWriter(undefined);
  });

  it('valida exitosamente un carrito con items correctos', async () => {
    const cart = buildCart(MOCK_CUSTOMER_ID, 10_000, 1);
    const result = await validator.validateCartContents(cart);
    expect(result.success).toBe(true);
  });

  it('rechaza un carrito vacio', async () => {
    const emptyCart = buildCart(MOCK_CUSTOMER_ID, 10_000, 0);
    const result = await validator.validateCartContents(emptyCart);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('CART_EMPTY');
  });

  it('rechaza cuando un producto no existe', async () => {
    findProductByIdMock.mockResolvedValue(Result.ok(null));
    const cart = buildCart(MOCK_CUSTOMER_ID, 10_000, 1);
    const result = await validator.validateCartContents(cart);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('rechaza cuando hay mismatch de precio', async () => {
    findProductByIdMock.mockResolvedValue(Result.ok(buildProduct(11_000)));
    const cart = buildCart(MOCK_CUSTOMER_ID, 10_000, 1);
    const result = await validator.validateCartContents(cart);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('PRICE_MISMATCH');
    expect(auditLogs.some((entry) => entry.action === 'checkout_failed')).toBe(true);
  });
});
