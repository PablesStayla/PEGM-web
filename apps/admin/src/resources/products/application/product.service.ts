import {
  categories as categoriesTable,
  db,
  products as productsTable,
  withRLS,
} from '@pranakaia/infrastructure/db';
import { NotFoundError, Result } from '@pranakaia/shared-kernel';
import { and, asc, count, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { ADMIN_AUDIT_EVENTS, logAdminAuditEvent } from '@/lib/security/audit';

export interface AdminProductFilters {
  search?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class AdminProductService {
  /**
   * Retrieves paginated products for admin dashboard.
   */
  async getAdminProducts(filters: AdminProductFilters): Promise<Result<any, Error>> {
    try {
      const {
        search,
        category,
        status,
        featured,
        page = 1,
        pageSize = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      const where = this.buildWhereClause({ search, category, status, featured });
      const orderBy = this.resolveSort(sortBy, sortOrder);

      const result = await db.transaction(async (tx) => {
        const [products, totalResult] = await Promise.all([
          tx
            .select({
              id: productsTable.id,
              sku: productsTable.sku,
              name: productsTable.name,
              slug: productsTable.slug,
              description: productsTable.description,
              basePrice: sql<number>`${productsTable.basePrice}::float`,
              salePrice: sql<number>`${productsTable.salePrice}::float`,
              stockQuantity: productsTable.stockQuantity,
              status: productsTable.status,
              isFeatured: productsTable.isFeatured,
              createdAt: productsTable.createdAt,
              category: {
                id: categoriesTable.id,
                name: categoriesTable.name,
              },
            })
            .from(productsTable)
            .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
            .where(where)
            .orderBy(orderBy)
            .limit(pageSize)
            .offset((page - 1) * pageSize),
          tx
            .select({ count: count() })
            .from(productsTable)
            .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
            .where(where),
        ]);
        return { products, total: totalResult[0]?.count || 0 };
      });

      return Result.ok({
        data: result.products,
        pagination: {
          total: result.total,
          page,
          pageSize,
          totalPages: Math.ceil(result.total / pageSize),
        },
      });
    } catch (error) {
      logger.error('AdminProductService.getAdminProducts error', { error });
      return Result.err(error instanceof Error ? error : new Error('Failed to get products'));
    }
  }

  /**
   * Toggles product active status.
   */
  async toggleProductActive(
    id: string,
    active: boolean,
    adminId: string,
  ): Promise<Result<any, Error>> {
    try {
      const status = active ? 'PUBLISHED' : 'DRAFT';

      await withRLS(adminId, 'postgres', async (tx) => {
        const [product] = await tx
          .select()
          .from(productsTable)
          .where(eq(productsTable.id, id))
          .limit(1);

        if (!product) {
          throw new NotFoundError('Product');
        }

        await tx
          .update(productsTable)
          .set({ status, updatedAt: new Date() })
          .where(eq(productsTable.id, id));
      });

      await logAdminAuditEvent({
        eventType: ADMIN_AUDIT_EVENTS.PRODUCT_UPDATED,
        userId: adminId,
        resource: 'products',
        action: 'toggle_active',
        metadata: { productId: id, status },
      });

      return Result.ok({ id, status });
    } catch (error) {
      logger.error('AdminProductService.toggleProductActive error', { id, error });
      return Result.err(
        error instanceof Error ? error : new Error('Failed to toggle product status'),
      );
    }
  }

  /**
   * Gets all categories.
   */
  async getCategories(): Promise<Result<any, Error>> {
    try {
      const categories = await db
        .select({ id: categoriesTable.id, name: categoriesTable.name })
        .from(categoriesTable)
        .orderBy(asc(categoriesTable.name));
      return Result.ok(categories);
    } catch (error) {
      logger.error('AdminProductService.getCategories error', { error });
      return Result.err(error instanceof Error ? error : new Error('Failed to get categories'));
    }
  }

  private buildWhereClause(filters: any) {
    const conditions = [];
    if (filters.search) {
      conditions.push(
        or(
          ilike(productsTable.name, `%${filters.search}%`),
          ilike(productsTable.sku, `%${filters.search}%`),
          ilike(productsTable.description, `%${filters.search}%`),
        ),
      );
    }
    if (filters.category) {
      conditions.push(eq(categoriesTable.name, filters.category));
    }
    if (filters.status) {
      const validStatuses = filters.status.split(',').filter(Boolean);
      if (validStatuses.length > 0) {
        conditions.push(inArray(productsTable.status, validStatuses));
      }
    }
    if (filters.featured !== undefined) {
      conditions.push(eq(productsTable.isFeatured, filters.featured));
    }
    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  private resolveSort(sortBy: string, sortOrder: 'asc' | 'desc') {
    const columns: any = {
      createdAt: productsTable.createdAt,
      name: productsTable.name,
      basePrice: productsTable.basePrice,
      stockQuantity: productsTable.stockQuantity,
      status: productsTable.status,
      sku: productsTable.sku,
    };
    const column = columns[sortBy] || productsTable.createdAt;
    return sortOrder === 'desc' ? desc(column) : asc(column);
  }
}
