import { type NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/products';

export const runtime = 'nodejs';

// GET /api/products/search?q=...&sort=...
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase().trim() || '';
    const sort = searchParams.get('sort') || 'featured';

    if (!query) {
      return NextResponse.json({ products: [], total: 0 });
    }

    // Get all products and filter by search query
    const allProducts = await getAllProducts();

    const filtered = allProducts.filter((product) => {
      const searchableText = [
        product.name,
        product.description,
        product.category,
        ...(product.tags || []),
      ]
        .join(' ')
        .toLowerCase();

      // Split query into words and check if all words match
      const queryWords = query.split(/\s+/).filter(Boolean);
      return queryWords.every((word) => searchableText.includes(word));
    });

    // Sort results
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        default:
          // Featured first, then by name
          if (a.featured !== b.featured) {
            return a.featured ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
      }
    });

    return NextResponse.json({
      products: sorted,
      total: sorted.length,
      query,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Error en la búsqueda', products: [], total: 0 },
      { status: 500 },
    );
  }
}
