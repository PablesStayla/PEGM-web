import { categories, db, productImages, products } from '@pranakaia/infrastructure/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/api-auth';
import { observabilityLogger } from '@/lib/logger';

export const runtime = 'nodejs';

// GET /api/products/[id]
export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        basePrice: products.basePrice,
        salePrice: products.salePrice,
        sku: products.sku,
        status: products.status,
        isFeatured: products.isFeatured,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, params.id));

    const product = result[0];

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const images = await db
      .select({
        id: productImages.id,
        url: productImages.url,
        altText: productImages.altText,
        isMain: productImages.isMain,
      })
      .from(productImages)
      .where(eq(productImages.productId, params.id));

    return NextResponse.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.basePrice,
      salePrice: product.salePrice ?? null,
      sku: product.sku,
      status: product.status,
      isFeatured: product.isFeatured,
      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.altText,
        isPrimary: img.isMain,
      })),
      category: product.categoryName
        ? { name: product.categoryName, slug: product.categorySlug }
        : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  } catch (error) {
    observabilityLogger.error('Error fetching product', {
      error: error instanceof Error ? error.message : String(error),
      productId: params.id,
    });
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' } },
      { status: 500 },
    );
  }
}

// PATCH /api/products/[id] — requires admin
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const adminResult = await withAdmin();
  if (!adminResult.authenticated) {
    return adminResult.response;
  }

  const params = await props.params;
  try {
    const body: Record<string, unknown> = await request.json();

    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, params.id));
    if (!existing[0]) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updateData: Partial<typeof products.$inferInsert> = { updatedAt: new Date() };
    if (body.name !== undefined) {
      updateData.name = body.name as string;
    }
    if (body.description !== undefined) {
      updateData.description = body.description as string;
    }
    if (body.price !== undefined) {
      updateData.basePrice = String(body.price);
    }
    if (body.salePrice !== undefined) {
      updateData.salePrice = String(body.salePrice);
    }
    if (body.status !== undefined) {
      updateData.status = body.status as typeof products.$inferSelect.status;
    }
    if (body.isFeatured !== undefined) {
      updateData.isFeatured = body.isFeatured as boolean;
    }

    await db.update(products).set(updateData).where(eq(products.id, params.id));

    const updated = await db.select().from(products).where(eq(products.id, params.id));

    return NextResponse.json({
      id: updated[0]?.id,
      name: updated[0]?.name,
      price: updated[0]?.basePrice,
      status: updated[0]?.status,
      updatedAt: updated[0]?.updatedAt,
    });
  } catch (error) {
    observabilityLogger.error('Error updating product', {
      error: error instanceof Error ? error.message : String(error),
      productId: params.id,
    });
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' } },
      { status: 500 },
    );
  }
}

// DELETE /api/products/[id] — requires admin
export async function DELETE(_request: Request, props: { params: Promise<{ id: string }> }) {
  const adminResult = await withAdmin();
  if (!adminResult.authenticated) {
    return adminResult.response;
  }

  const params = await props.params;
  try {
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, params.id));
    if (!existing[0]) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await db.delete(products).where(eq(products.id, params.id));

    return NextResponse.json({ success: true, deletedId: params.id });
  } catch (error) {
    observabilityLogger.error('Error deleting product', {
      error: error instanceof Error ? error.message : String(error),
      productId: params.id,
    });
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' } },
      { status: 500 },
    );
  }
}
