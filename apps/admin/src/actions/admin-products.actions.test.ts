import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDbSelect = vi.hoisted(() => vi.fn());
const mockDbUpdate = vi.hoisted(() => vi.fn());
const mockDbTransaction = vi.hoisted(() => vi.fn());
const mockLoggerError = vi.hoisted(() => vi.fn());

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
    inArray: vi.fn(actual.inArray),
    or: vi.fn(actual.or),
    sql: vi.fn((...args) => ({ sql: args })),
    relations: vi.fn(),
  };
});

vi.mock('@pranakaia/db', () => ({
  categories: {
    id: 'id',
    name: 'name',
    slug: 'slug',
  },
  productImages: {
    productId: 'productId',
    url: 'url',
    altText: 'altText',
    displayOrder: 'displayOrder',
    isMain: 'isMain',
  },
  productStatusEnum: {
    enumValues: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'OUT_OF_STOCK'],
  },
  products: {
    id: 'id',
    sku: 'sku',
    name: 'name',
    slug: 'slug',
    description: 'description',
    shortDescription: 'shortDescription',
    basePrice: 'basePrice',
    salePrice: 'salePrice',
    costPrice: 'costPrice',
    stockQuantity: 'stockQuantity',
    lowStockThreshold: 'lowStockThreshold',
    status: 'status',
    isFeatured: 'isFeatured',
    categoryId: 'categoryId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  users: {
    id: 'id',
    tenantId: 'tenantId',
    storeId: 'storeId',
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => mockDbSelect(...args),
    update: (...args: unknown[]) => mockDbUpdate(...args),
    transaction: (...args: unknown[]) => mockDbTransaction(...args),
  },
}));

vi.mock('@/lib/safe-action', () => ({
  adminActionClient: {
    schema: (_schema: unknown) => ({
      action: (handler: unknown) => handler,
    }),
    action: (handler: unknown) => handler,
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/security/audit', () => ({
  ADMIN_AUDIT_EVENTS: {
    PRODUCT_STATUS_CHANGED: 'PRODUCT_STATUS_CHANGED',
    PRODUCT_UPDATED: 'PRODUCT_UPDATED',
    PRODUCT_ARCHIVED: 'PRODUCT_ARCHIVED',
    INVENTORY_UPDATED: 'INVENTORY_UPDATED',
    PRODUCT_CREATED: 'PRODUCT_CREATED',
  },
  logAdminAuditEvent: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: mockLoggerError,
  },
}));

import { getAdminProducts, toggleProductActive } from './admin-products';

describe('admin products actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve fallback de productos vacÃ­o cuando getAdminProducts falla', async () => {
    mockDbSelect.mockImplementationOnce(() => {
      throw new Error('db unavailable');
    });

    const result = await getAdminProducts({
      parsedInput: {
        page: 1,
        pageSize: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      ctx: { user: { id: 'admin-user' } },
    } as never);

    expect(result.success).toBe(false);
    expect(result.data).toEqual([]);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.pageSize).toBe(20);
    expect(mockLoggerError).toHaveBeenCalled();
  });

  it('rechaza toggleProductActive sin usuario autenticado', async () => {
    await expect(
      toggleProductActive({
        parsedInput: { productId: 'prod-1' },
        ctx: {},
      } as never),
    ).rejects.toThrow('Not authenticated');
  });

  it('lanza error cuando el producto no existe al hacer toggle', async () => {
    mockDbSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    await expect(
      toggleProductActive({
        parsedInput: { productId: 'prod-missing' },
        ctx: { user: { id: 'admin-user' } },
      } as never),
    ).rejects.toThrow('Product not found');

    expect(mockLoggerError).toHaveBeenCalled();
  });
});
