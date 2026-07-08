'use server';

import { products as productTable } from '@pranakaia/infrastructure/db';
import { and, asc, desc, eq, ilike, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { adminActionClient } from '@/lib/safe-action';

const getProductsSchema = z.object({
  page: z.number().default(1),
  pageSize: z.number().default(20),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.string().optional(),
});

export const getProductsAction = adminActionClient
  .schema(getProductsSchema)
  .action(async ({ parsedInput }) => {
    const { page, pageSize } = parsedInput;
    return {
      success: true,
      data: [],
      pagination: { page, pageSize, total: 0 },
    };
  });

// Legacy export for backwards compatibility
export const getAdminProducts = adminActionClient
  .schema(getProductsSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { page, pageSize, sortBy, sortOrder, search, categoryId, status } = parsedInput;

      const whereConditions = [];
      if (search) {
        whereConditions.push(
          or(ilike(productTable.name, `%${search}%`), ilike(productTable.sku, `%${search}%`)),
        );
      }
      if (categoryId) {
        whereConditions.push(eq(productTable.categoryId, categoryId));
      }
      if (status && status !== 'all') {
        whereConditions.push(eq(productTable.status, status));
      }

      const sortColumn = (productTable as any)[sortBy] || productTable.createdAt;
      const result = await db
        .select()
        .from(productTable)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      return {
        success: true,
        data: result || [],
        pagination: { page, pageSize, total: result?.length || 0 },
      };
    } catch (error) {
      logger.error('Failed to get admin products', { error });
      return {
        success: false,
        data: [],
        pagination: { page: parsedInput.page, pageSize: parsedInput.pageSize, total: 0 },
        serverError: 'Database connection failed',
      };
    }
  });
