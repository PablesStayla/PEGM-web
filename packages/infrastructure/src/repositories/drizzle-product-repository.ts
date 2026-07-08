import type {
  IProductRepository,
  Product,
  ProductId,
  ProductSearchParams,
} from '@pranakaia/catalog';
import { Result } from '@pranakaia/shared-kernel';
import { and, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import { db, productImages, products } from '../db';
import { buildDbValues, mapToEntity } from './drizzle-product.mapper';

/**
 * Drizzle implementation of the Product Repository.
 * Handles database operations for the catalog bounding context.
 */
export class DrizzleProductRepository implements IProductRepository {
  async findById(id: ProductId): Promise<Result<Product | null, Error>> {
    try {
      const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);

      if (rows.length === 0 || !rows[0]) {
        return Result.ok(null);
      }
      const entity = await mapToEntity(rows[0]);
      return Result.ok(entity);
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async findBySku(sku: string): Promise<Result<Product | null, Error>> {
    try {
      const rows = await db.select().from(products).where(eq(products.sku, sku)).limit(1);

      if (rows.length === 0 || !rows[0]) {
        return Result.ok(null);
      }
      const entity = await mapToEntity(rows[0]);
      return Result.ok(entity);
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async findAll(
    params: ProductSearchParams,
  ): Promise<Result<{ items: Product[]; total: number }, Error>> {
    try {
      const activeFilters = this.buildFilters(params) as unknown as Parameters<typeof and>;

      let query = db.select().from(products).$dynamic();
      if (activeFilters.length > 0) {
        query = query.where(and(...activeFilters));
      }

      const total = await this.getTotalCount(activeFilters);
      query = this.applyPagination(query, params.limit, params.offset);

      const rows = await query;
      const items = await Promise.all(rows.map((row) => mapToEntity(row)));

      return Result.ok({ items, total });
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  private async getTotalCount(activeFilters: Parameters<typeof and>): Promise<number> {
    const whereClause = activeFilters.length > 0 ? and(...activeFilters) : undefined;

    const countRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    return Number(countRows[0]?.count || 0);
  }

  private applyPagination<T extends { limit: (limit: number) => T; offset: (offset: number) => T }>(
    query: T,
    limit?: number,
    offset?: number,
  ): T {
    let q = query;
    if (limit) {
      q = q.limit(limit);
    }
    if (offset) {
      q = q.offset(offset);
    }
    return q;
  }

  private buildFilters(params: ProductSearchParams): unknown[] {
    const filters = [];

    if (params.query) {
      filters.push(
        or(
          ilike(products.name, `%${params.query}%`),
          ilike(products.description, `%${params.query}%`),
        ),
      );
    }

    if (params.featured !== undefined) {
      filters.push(eq(products.isFeatured, params.featured));
    }

    if (params.minPrice !== undefined) {
      filters.push(gte(products.basePrice, params.minPrice.amount.toString()));
    }

    if (params.maxPrice !== undefined) {
      filters.push(lte(products.basePrice, params.maxPrice.amount.toString()));
    }

    if (params.category) {
      filters.push(eq(products.categoryId, params.category));
    }

    return filters.filter(Boolean);
  }

  async save(product: Product): Promise<Result<void, Error>> {
    try {
      const primitives = product.toPrimitives();
      const dbValues = buildDbValues(primitives);

      await db.transaction(async (tx) => {
        await this.upsertProduct(tx, dbValues);
        await this.saveProductImages(tx, primitives);
      });

      return Result.ok(undefined);
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  private async upsertProduct(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    dbValues: typeof products.$inferInsert,
  ): Promise<void> {
    await tx
      .insert(products)
      .values(dbValues)
      .onConflictDoUpdate({
        target: products.id,
        set: dbValues as Partial<typeof products.$inferInsert>,
      });
  }

  private async saveProductImages(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    primitives: ReturnType<Product['toPrimitives']>,
  ): Promise<void> {
    if (primitives.images && primitives.images.length > 0) {
      await tx.delete(productImages).where(eq(productImages.productId, primitives.id));
      await tx.insert(productImages).values(
        primitives.images.map((url: string, index: number) => ({
          productId: primitives.id,
          url,
          displayOrder: index,
          isMain: index === 0,
        })),
      );
    }
  }

  async delete(id: ProductId): Promise<Result<void, Error>> {
    try {
      await db.delete(products).where(eq(products.id, id));
      return Result.ok(undefined);
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async exists(id: ProductId): Promise<Result<boolean, Error>> {
    const res = await this.findById(id);
    if (res.isFailure) {
      return Result.err(res.errorValue);
    }
    return Result.ok(res.getValue() !== null);
  }

  async findFeatured(limit = 10): Promise<Result<Product[], Error>> {
    const res = await this.findAll({ featured: true, limit });
    if (res.isFailure) {
      return Result.err(res.errorValue);
    }
    return Result.ok(res.getValue().items);
  }

  async searchByQuery(query: string, limit = 10): Promise<Result<Product[], Error>> {
    const res = await this.findAll({ query, limit });
    if (res.isFailure) {
      return Result.err(res.errorValue);
    }
    return Result.ok(res.getValue().items);
  }
}
