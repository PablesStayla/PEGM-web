import { db, products as productsTable, withRLS } from '@pranakaia/infrastructure/db';
import { applyDiscount, calculateMargin, IVA_RATE, MAX_DISCOUNT_RATE } from '@pranakaia/pricing';
import { NotFoundError, Result } from '@pranakaia/shared-kernel';
import { eq, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { ADMIN_AUDIT_EVENTS, logAdminAuditEvent } from '@/lib/security/audit';

export class PricingService {
  /**
   * Fetches all products with their pricing metrics.
   */
  static async getPricingData(): Promise<Result<any[], Error>> {
    try {
      const data = await db
        .select({
          productId: productsTable.id,
          basePrice: productsTable.basePrice,
          salePrice: productsTable.salePrice,
          costPrice: productsTable.costPrice,
        })
        .from(productsTable);

      const mappedData = data.map((item) => {
        const base = Number(item.basePrice);
        const cost = Number(item.costPrice);
        const sale = item.salePrice ? Number(item.salePrice) : null;

        // Use the current price (sale if exists, otherwise base) to calculate margin
        const currentPrice = sale || base;
        const marginResult = calculateMargin({ costPrice: cost, sellingPrice: currentPrice });

        return {
          productId: item.productId,
          basePrice: base,
          salePrice: sale,
          costPrice: cost,
          margin: marginResult.success ? marginResult.value : 0,
          vatRate: IVA_RATE,
        };
      });

      return Result.ok(mappedData);
    } catch (error) {
      logger.error('PricingService.getPricingData error', { error });
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch pricing data'));
    }
  }

  /**
   * Updates product price and handles discount limits.
   */
  async updateProductPrice(params: {
    productId: string;
    basePrice: number;
    salePrice?: number;
    adminId: string;
  }): Promise<Result<any, Error>> {
    const { productId, basePrice, salePrice, adminId } = params;

    try {
      // Validate discount limit if salePrice is provided
      if (salePrice !== undefined && salePrice > 0) {
        const discountPercent = ((basePrice - salePrice) / basePrice) * 100;
        if (discountPercent > MAX_DISCOUNT_RATE * 100) {
          return Result.err(
            new Error(`Discount cannot exceed ${MAX_DISCOUNT_RATE * 100}% of base price.`),
          );
        }
      }

      await withRLS(adminId, 'postgres', async (tx) => {
        const [product] = await tx
          .select()
          .from(productsTable)
          .where(eq(productsTable.id, productId))
          .limit(1);

        if (!product) {
          throw new NotFoundError('Product');
        }

        await tx
          .update(productsTable)
          .set({
            basePrice: sql`${basePrice}`,
            salePrice: salePrice ? sql`${salePrice}` : null,
            updatedAt: new Date(),
          })
          .where(eq(productsTable.id, productId));
      });

      await logAdminAuditEvent({
        eventType: ADMIN_AUDIT_EVENTS.PRODUCT_UPDATED,
        userId: adminId,
        resource: 'pricing',
        action: 'update_price',
        metadata: { productId, basePrice, salePrice },
      });

      return Result.ok({ id: productId, basePrice, salePrice });
    } catch (error) {
      logger.error('PricingService.updateProductPrice error', { productId, error });
      return Result.err(error instanceof Error ? error : new Error('Failed to update price'));
    }
  }

  /**
   * Applies a global discount percentage to a list of products (bulk).
   */
  async bulkApplyDiscount(params: {
    productIds: string[];
    discountPercent: number;
    adminId: string;
  }): Promise<Result<any, Error>> {
    const { productIds, discountPercent, adminId } = params;

    try {
      if (discountPercent > MAX_DISCOUNT_RATE * 100) {
        return Result.err(new Error(`Discount cannot exceed ${MAX_DISCOUNT_RATE * 100}%`));
      }

      await withRLS(adminId, 'postgres', async (tx) => {
        for (const id of productIds) {
          const [product] = await tx
            .select({ basePrice: productsTable.basePrice })
            .from(productsTable)
            .where(eq(productsTable.id, id))
            .limit(1);

          if (product) {
            const discountResult = applyDiscount(Number(product.basePrice), discountPercent);
            if (discountResult.success) {
              const finalPrice = discountResult.getValue().finalPrice;
              await tx
                .update(productsTable)
                .set({ salePrice: sql`${finalPrice}`, updatedAt: new Date() })
                .where(eq(productsTable.id, id));
            }
          }
        }
      });

      await logAdminAuditEvent({
        eventType: ADMIN_AUDIT_EVENTS.PRODUCT_UPDATED,
        userId: adminId,
        resource: 'pricing',
        action: 'bulk_apply_discount',
        metadata: { count: productIds.length, discountPercent },
      });

      return Result.ok({ count: productIds.length });
    } catch (error) {
      logger.error('PricingService.bulkApplyDiscount error', { error });
      return Result.err(
        error instanceof Error ? error : new Error('Failed to apply bulk discount'),
      );
    }
  }
}
