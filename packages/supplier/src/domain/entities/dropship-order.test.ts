import { Money } from '@pranakaia/shared-kernel';
import { describe, expect, it } from 'vitest';
import { DropshipOrderEntity } from './dropship-order';

describe('DropshipOrderEntity', () => {
  it('should create a pending dropship order', () => {
    const cost = Money.zero('CLP');
    const result = DropshipOrderEntity.create({
      tenantId: 'tenant-1',
      orderId: 'order-1',
      orderItemId: 'item-1',
      supplierId: 'supplier-1',
      supplierProductId: 'supplier-product-1',
      productId: 'product-1',
      quantity: 2,
      unitCost: cost,
      shippingAddress: { city: 'Santiago' },
      notes: 'test',
      autoSubmit: false,
    });

    expect(result.isSuccess).toBe(true);
    const order = result.getValue();
    expect(order.status).toBe('PENDING');
    expect(order.isTerminal()).toBe(false);
    expect(order.canRetry()).toBe(false);
    expect(order.toPrimitives().totalCost.amount).toBe(0);
  });

  it('should track failure retries and terminal state', () => {
    const cost = Money.zero('CLP');
    const result = DropshipOrderEntity.create({
      tenantId: 'tenant-1',
      orderId: 'order-1',
      orderItemId: 'item-1',
      supplierId: 'supplier-1',
      supplierProductId: 'supplier-product-1',
      productId: 'product-1',
      quantity: 1,
      unitCost: cost,
      shippingAddress: { city: 'Santiago' },
      notes: 'test',
    });

    const order = result.getValue();
    order.markFailed('first');
    expect(order.status).toBe('FAILED');
    expect(order.canRetry()).toBe(true);

    order.markSubmitted('supplier-order-1');
    expect(order.status).toBe('SUBMITTED');
    expect(order.isTerminal()).toBe(false);

    order.markDelivered();
    expect(order.isTerminal()).toBe(true);
  });

  it('should preserve primitives on round trip', () => {
    const cost = Money.zero('CLP');
    const result = DropshipOrderEntity.create({
      tenantId: 'tenant-1',
      orderId: 'order-1',
      orderItemId: 'item-1',
      supplierId: 'supplier-1',
      supplierProductId: 'supplier-product-1',
      productId: 'product-1',
      quantity: 1,
      unitCost: cost,
      shippingAddress: { city: 'Santiago' },
    });

    const order = result.getValue();
    const primitives = order.toPrimitives();
    const rehydratedResult = DropshipOrderEntity.reconstitute(primitives);
    expect(rehydratedResult.isSuccess).toBe(true);
    const rehydrated = rehydratedResult.getValue();

    expect(rehydrated.toPrimitives()).toEqual(primitives);
  });
});
