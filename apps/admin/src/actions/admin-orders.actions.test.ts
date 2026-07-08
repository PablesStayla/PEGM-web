import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockWithRLS = vi.hoisted(() => vi.fn());
const mockLoggerError = vi.hoisted(() => vi.fn());
const mockLoggerWarn = vi.hoisted(() => vi.fn());

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    and: vi.fn(actual.and),
    asc: vi.fn(actual.asc),
    count: vi.fn(() => 'count'),
    desc: vi.fn(actual.desc),
    eq: vi.fn(actual.eq),
    ilike: vi.fn(actual.ilike),
    or: vi.fn(actual.or),
    relations: vi.fn(),
  };
});

vi.mock('@pranakaia/infrastructure/db', () => ({
  orderItems: {
    id: 'id',
    orderId: 'orderId',
    productId: 'productId',
    quantity: 'quantity',
    unitPrice: 'unitPrice',
    subtotal: 'subtotal',
  },
  orderStatusEnum: {
    enumValues: [
      'PENDING',
      'PAID',
      'PROCESSING',
      'FULFILLING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED',
      'FAILED',
    ],
  },
  orders: {
    id: 'id',
    orderNumber: 'orderNumber',
    status: 'status',
    paymentStatus: 'paymentStatus',
    total: 'total',
    guestEmail: 'guestEmail',
    createdAt: 'createdAt',
    userId: 'userId',
    trackingNumber: 'trackingNumber',
    trackingUrl: 'trackingUrl',
    updatedAt: 'updatedAt',
  },
  products: {
    id: 'id',
    name: 'name',
  },
  users: {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
  },
  withRLS: mockWithRLS,
}));

vi.mock('@/lib/safe-action', () => ({
  adminActionClient: {
    schema: (_schema: unknown) => ({
      action: (handler: unknown) => handler,
    }),
    action: (handler: unknown) => handler,
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue([]),
            })),
          })),
        })),
      })),
    })),
    update: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@pranakaia/email', () => ({
  OrderStatusUpdateEmail: () => null,
  sendEmail: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/security/audit', () => ({
  ADMIN_AUDIT_EVENTS: {
    ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
    ORDER_CSV_EXPORTED: 'ORDER_CSV_EXPORTED',
  },
  logAdminAuditEvent: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: mockLoggerError,
    warn: mockLoggerWarn,
  },
}));

import {
  exportAdminOrdersCsvAction,
  getAdminOrdersAction,
  updateOrderStatusAction,
} from './admin-orders.actions';

describe('admin orders actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve fallback con data vacÃ­a cuando getAdminOrdersAction falla en RLS', async () => {
    mockWithRLS.mockRejectedValueOnce(new Error('db unavailable'));

    const result = await getAdminOrdersAction({
      parsedInput: {
        page: 2,
        pageSize: 15,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'all',
        paymentStatus: 'all',
      },
      ctx: { user: { id: 'admin-user' } },
    } as never);

    expect(result.success).toBe(false);
    expect(result.data).toEqual([]);
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.pageSize).toBe(15);
    expect(mockLoggerError).toHaveBeenCalled();
  });

  it('rechaza actualizaciÃ³n con estado invÃ¡lido', async () => {
    await expect(
      updateOrderStatusAction({
        parsedInput: {
          orderId: 'order-1',
          status: 'INVALID_STATUS',
        },
        ctx: { user: { id: 'admin-user' } },
      } as never),
    ).rejects.toThrow('Invalid order status');
  });

  it('rechaza actualizaciÃ³n si no hay usuario autenticado', async () => {
    await expect(
      updateOrderStatusAction({
        parsedInput: {
          orderId: 'order-1',
          status: 'PAID',
        },
        ctx: {},
      } as never),
    ).rejects.toThrow('Not authenticated');
  });

  it('exporta Ã³rdenes a CSV con datos bÃ¡sicos', async () => {
    const csvRows = [
      {
        id: 'order-id-1',
        orderNumber: 'PK-1001',
        status: 'PAID',
        paymentStatus: 'PAID',
        total: '12990',
        guestEmail: null,
        createdAt: new Date('2026-03-10T12:00:00.000Z'),
        customerFirstName: 'Ana',
        customerLastName: 'Perez',
        customerEmail: 'ana@correo.cl',
      },
    ];

    // Mock withRLS to return csvRows directly instead of executing callback
    mockWithRLS.mockImplementationOnce(async () => {
      return csvRows;
    });

    const result = await exportAdminOrdersCsvAction({
      parsedInput: {
        search: '',
        status: 'all',
        paymentStatus: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      ctx: { user: { id: 'admin-user' } },
    } as never);

    expect(result.success).toBe(true);
    expect(result.data.exportedCount).toBe(1);
    expect(result.data.truncated).toBe(false);
    expect(result.data.csvContent).toContain('order_number');
    expect(result.data.csvContent).toContain('PK-1001');
  });

  it('retorna error de negocio cuando exportAdminOrdersCsvAction falla', async () => {
    mockWithRLS.mockRejectedValueOnce(new Error('csv export failed'));

    const result = await exportAdminOrdersCsvAction({
      parsedInput: {
        status: 'all',
        paymentStatus: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      ctx: { user: { id: 'admin-user' } },
    } as never);

    expect(result.success).toBe(false);
    expect(result.error).toContain('csv export failed');
    expect(mockLoggerError).toHaveBeenCalled();
  });
});
