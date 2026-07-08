import { faker } from '@faker-js/faker';
import { IVA_RATE, makeChileanAddress, makeOrderNumber } from './order-factory.fixtures';
import type {
  CreateOrderOptions,
  PaymentMethod,
  PaymentStatus,
  TestOrder,
  TestOrderItem,
} from './order-factory.types';

export * from './order-factory.types';

/**
 * Create a single mock order.
 */
export function createMockOrder(options: CreateOrderOptions = {}): TestOrder {
  const subtotal = options.totalAmount ?? faker.number.int({ min: 5_000, max: 300_000 });
  const shipping = faker.number.int({ min: 2_490, max: 9_990 });
  const tax = Math.round(subtotal * IVA_RATE);
  const createdAt = faker.date.past({ years: 1 });

  return {
    id: faker.string.uuid(),
    orderNumber: makeOrderNumber(createdAt),
    userId: options.userId ?? faker.string.uuid(),
    status: options.status ?? 'PENDING',
    subtotal,
    shipping,
    tax,
    total: subtotal + shipping + tax,
    currency: 'CLP',
    paymentMethod: faker.helpers.arrayElement<PaymentMethod>(['flow', 'stripe', 'bank_transfer']),
    paymentStatus: faker.helpers.arrayElement<PaymentStatus>(['PENDING', 'PAID']),
    shippingAddress: makeChileanAddress(),
    billingAddress: makeChileanAddress(),
    notes: '',
    metadata: {},
    createdAt,
    updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
  };
}

/**
 * Create mock order line items.
 */
export function createMockOrderItems(count: number, orderId: string): TestOrderItem[] {
  return Array.from({ length: count }, () => {
    const unitPrice = faker.number.int({ min: 2_000, max: 150_000 });
    const quantity = faker.number.int({ min: 1, max: 5 });
    const productName = faker.helpers.arrayElement([
      'Panel LED Quantum 240W',
      'Sustrato Light Mix 50L',
      'Fertilizante Floración 1L',
      'Extractor Inline 200mm',
      'Filtro Carbón 150mm',
    ]);
    return {
      id: faker.string.uuid(),
      orderId,
      productId: faker.string.uuid(),
      productName,
      productSku: `PK-${faker.string.alphanumeric(3).toUpperCase()}-${faker.string.alphanumeric(6).toUpperCase()}`,
      quantity,
      unitPrice,
      subtotal: unitPrice * quantity,
      metadata: {},
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 }),
    };
  });
}

/** Create a complete order with line items. */
export function createMockOrderWithItems(options: CreateOrderOptions = {}) {
  const order = createMockOrder(options);
  const items = createMockOrderItems(options.itemsCount ?? 3, order.id);
  return { order, items };
}

/** Create a paid order. */
export function createPaidOrder(options: CreateOrderOptions = {}): TestOrder {
  return createMockOrder({ ...options, status: 'PAID' });
}

/** Create a cancelled order. */
export function createCancelledOrder(options: CreateOrderOptions = {}): TestOrder {
  return createMockOrder({ ...options, status: 'CANCELLED' });
}

/** Create a dropship order. */
export function createMockDropshipOrder(options: CreateOrderOptions = {}) {
  const order = createMockOrder(options);
  return {
    ...order,
    metadata: {
      dropshipping: true,
      supplierId: faker.string.uuid(),
      supplierOrderId: `PROV-${faker.string.numeric(8)}`,
    },
  };
}
