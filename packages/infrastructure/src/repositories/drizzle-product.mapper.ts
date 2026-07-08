import { Money, Product, type ProductId, SKU } from '@pranakaia/catalog';
import { eq } from 'drizzle-orm';
import { db, productImages, type products } from '../db';

/**
 * Maps Product entity primitives to Drizzle products insert model.
 */
export function buildDbValues(
  primitives: ReturnType<Product['toPrimitives']>,
): typeof products.$inferInsert {
  return {
    id: primitives.id,
    sku: primitives.sku,
    name: primitives.name,
    slug: primitives.sku.toLowerCase(), // basic fallback slug
    description: primitives.description || null,
    basePrice: primitives.price.amount.toString(),
    stockQuantity: primitives.stockQuantity,
    status: primitives.status as (typeof products.$inferInsert)['status'],
    updatedAt: new Date(),
    categoryId: primitives.categoryIds?.[0] || null,
    tenantId: '00000000-0000-0000-0000-000000000000',
    metadata: {
      supplierId: primitives.supplierId || null,
    },
  };
}

/**
 * Maps Drizzle products database select rows into a catalog Product aggregate entity.
 */
export async function mapToEntity(row: typeof products.$inferSelect): Promise<Product> {
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, row.id))
    .orderBy(productImages.displayOrder);

  const moneyRes = Money.create(Number(row.basePrice), 'CLP');
  const sku = SKU.from(row.sku);
  const categoryIds = row.categoryId ? [row.categoryId] : [];
  const metadata = row.metadata as Record<string, unknown> | null;
  const props: Parameters<typeof Product.reconstitute>[0] = {
    id: row.id as ProductId,
    sku,
    name: row.name,
    description: row.description || '',
    price: moneyRes.isSuccess ? moneyRes.getValue() : Money.zero('CLP'),
    stockQuantity: row.stockQuantity,
    categoryIds,
    images: images.map((img) => img.url),
  };

  const supplierId = typeof metadata?.supplierId === 'string' ? metadata.supplierId : undefined;
  if (supplierId !== undefined) {
    props.supplierId = supplierId;
  }

  return Product.reconstitute(props);
}
