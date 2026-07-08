import {
  categories as categoriesTable,
  productImages,
  products as productsTable,
} from '@pranakaia/infrastructure/db';
import type { SQL } from 'drizzle-orm';
import { and, asc, desc, eq, ilike, inArray, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdminPermission } from '@/lib/security/admin-rbac';
import { ADMIN_AUDIT_EVENTS, logAdminAuditEvent } from '@/lib/security/audit';
import type { AdminProductFilters } from './types';

/**
 * Product utilities and helpers for admin product actions.
 * Centralizes common logic for filtering, sorting, and permission checks.
 */

// ── Constants ────────────────────────────────────────────────────────────────

export const PRODUCT_SORT_COLUMNS = {
  createdAt: productsTable.createdAt,
  name: productsTable.name,
  basePrice: productsTable.basePrice,
  stockQuantity: productsTable.stockQuantity,
  status: productsTable.status,
  sku: productsTable.sku,
} as const;

export const ALLOWED_PRODUCT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'OUT_OF_STOCK'] as const;

// ── Types ────────────────────────────────────────────────────────────────────

export interface ResolvedProductFilters {
  search: string | undefined;
  category: string | undefined;
  status: string | undefined;
  featured: boolean | undefined;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Ensures admin user context is present, throws AuthenticationError if not.
 */
export function getAdminUserOrThrow<T extends { user?: unknown }>(ctx: T): NonNullable<T['user']> {
  if (!ctx.user) {
    throw new Error('Not authenticated');
  }
  return ctx.user;
}

/**
 * Requires admin permission for a given resource and action.
 */
export async function requireProductPermission(params: {
  user: { id: string; user_metadata?: Record<string, unknown> | null };
  resource: string;
  action: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await requireAdminPermission(params as any);
}

/**
 * Resolves and normalizes product filters with defaults.
 */
export function resolveProductFilters(filters?: AdminProductFilters): ResolvedProductFilters {
  const baseFilters = {
    search: filters?.search ?? undefined,
    category: filters?.category ?? undefined,
    status: filters?.status ?? undefined,
    featured: filters?.featured ?? undefined,
  };

  const pagination = {
    page: filters?.page ?? 1,
    pageSize: filters?.pageSize ?? 20,
  };

  const sorting = {
    sortBy: filters?.sortBy ?? 'createdAt',
    sortOrder: (filters?.sortOrder ?? 'desc') as 'asc' | 'desc',
  };

  return {
    ...baseFilters,
    ...pagination,
    ...sorting,
  };
}

function buildSearchCondition(search: string): SQL | undefined {
  return or(
    ilike(productsTable.name, `%${search}%`),
    ilike(productsTable.description, `%${search}%`),
    ilike(productsTable.sku, `%${search}%`),
  );
}

function buildStatusCondition(status: string): SQL | undefined {
  const validStatuses = status
    .split(',')
    .filter((s) => ALLOWED_PRODUCT_STATUSES.includes(s as any)) as (
    | 'DRAFT'
    | 'PUBLISHED'
    | 'ARCHIVED'
    | 'OUT_OF_STOCK'
  )[];
  return validStatuses.length > 0 ? inArray(productsTable.status, validStatuses) : undefined;
}

/**
 * Builds WHERE clause for product list queries.
 */
export function buildProductWhereClause(filters: ResolvedProductFilters): SQL | undefined {
  const conditions: SQL[] = [];

  if (filters.search) {
    const searchCondition = buildSearchCondition(filters.search);
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (filters.category) {
    conditions.push(eq(categoriesTable.name, filters.category));
  }

  if (filters.status) {
    const statusCondition = buildStatusCondition(filters.status);
    if (statusCondition) {
      conditions.push(statusCondition);
    }
  }

  if (filters.featured !== undefined) {
    conditions.push(eq(productsTable.isFeatured, filters.featured));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

/**
 * Resolves ORDER BY clause for product list queries.
 */
export function resolveProductSort(sortBy: string, sortOrder: 'asc' | 'desc'): SQL {
  const sortKey = (
    sortBy in PRODUCT_SORT_COLUMNS ? sortBy : 'createdAt'
  ) as keyof typeof PRODUCT_SORT_COLUMNS;
  const sortByColumn = PRODUCT_SORT_COLUMNS[sortKey];
  return sortOrder === 'desc' ? desc(sortByColumn) : asc(sortByColumn);
}

/**
 * Calculates pagination metadata.
 */
export function buildProductPagination(total: number, page: number, pageSize: number) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Persists product images in a transaction.
 */
export async function persistProductImages(
  tx: any,
  productId: string,
  images: string[],
): Promise<void> {
  if (images.length === 0) {
    return;
  }

  await tx.insert(productImages).values(
    images.map((url, index) => ({
      productId,
      url,
      altText: '',
      displayOrder: index,
      isMain: index === 0,
    })),
  );
}

/**
 * Runs a product mutation with error handling and revalidation.
 */
export async function runProductMutation<T>(
  fn: () => Promise<T>,
  pathsToRevalidate: string[] = ['/products'],
): Promise<T> {
  const result = await fn();
  pathsToRevalidate.forEach((path) => {
    revalidatePath(path);
  });
  return result;
}

/**
 * Resolves category ID by name (case-insensitive).
 */
export async function resolveCategoryId(categoryName?: string): Promise<string | undefined> {
  if (!categoryName) {
    return undefined;
  }

  const [cat] = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(ilike(categoriesTable.name, categoryName))
    .limit(1);

  return cat?.id;
}

/**
 * Builds update payload for product updates.
 */
export function buildProductUpdatePayload(data: {
  name?: string;
  price?: number;
  stockQuantity?: number;
  description?: string;
  category?: string;
  featured?: boolean;
}): Record<string, string | number | boolean | null> {
  const payload: Record<string, string | number | boolean | null> = {};

  if (data.name !== undefined) {
    payload['name'] = data.name;
  }
  if (data.price !== undefined) {
    payload['basePrice'] = data.price;
  }
  if (data.stockQuantity !== undefined) {
    payload['stockQuantity'] = data.stockQuantity;
  }
  if (data.description !== undefined) {
    payload['description'] = data.description;
  }
  if (data.featured !== undefined) {
    payload['isFeatured'] = data.featured;
  }

  return payload;
}

// Re-export audit constants for convenience
export { ADMIN_AUDIT_EVENTS, logAdminAuditEvent };
