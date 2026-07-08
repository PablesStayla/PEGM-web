import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => cleanup());

// Mock server-only package
vi.mock('server-only', () => ({}));

// Mock next-safe-action
vi.mock('next-safe-action', () => ({
  createSafeActionClient: () => {
    const client = {
      schema: (_schema: unknown) => ({
        action: (handler: unknown) => handler,
      }),
      action: (handler: unknown) => handler,
      use: vi.fn((_fn: unknown) => client),
    };
    return client;
  },
  DEFAULT_SERVER_ERROR_MESSAGE: 'An error occurred',
}));

// Mock environment variables for Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

// Mock @pranakaia/infrastructure/db
vi.mock('@pranakaia/infrastructure/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
  users: { id: 'id', tenantId: 'tenantId', storeId: 'storeId' },
  products: {
    id: 'id',
    sku: 'sku',
    name: 'name',
    slug: 'slug',
    description: 'description',
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
  categories: { id: 'id', name: 'name', slug: 'slug' },
  productImages: {
    productId: 'productId',
    url: 'url',
    altText: 'altText',
    displayOrder: 'displayOrder',
    isMain: 'isMain',
  },
  productStatusEnum: { enumValues: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'OUT_OF_STOCK'] },
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
  withRLS: vi.fn(),
}));

// Mock @pranakaia/infrastructure/auth/middleware
vi.mock('@pranakaia/infrastructure/auth/middleware', () => ({
  updateSession: vi.fn((_request) => {
    const { NextResponse } = require('next/server');
    return Promise.resolve(NextResponse.next());
  }),
}));

// Mock @pranakaia/infrastructure/logger
vi.mock('@pranakaia/infrastructure/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock @pranakaia/infrastructure/email
vi.mock('@pranakaia/infrastructure/email', () => ({
  OrderStatusUpdateEmail: () => null,
  sendEmail: vi.fn(),
}));
