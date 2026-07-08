import { MoneyVO as Money } from '@pranakaia/domain';
import { Filter, Leaf, Search, Sparkles } from 'lucide-react';
import { Suspense } from 'react';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductGridSkeleton } from '@/components/ProductSkeleton';
import { getAllProducts } from '@/lib/products';

export const metadata = {
  title: 'Productos - PranaKaia',
  description:
    'Descubre nuestra colección completa de equipamiento para cultivo indoor, semillas, nutrientes e iluminación',
};

// Next.js 15 PPR enabled via next.config.ts
export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const category =
    typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Banner (Static part for PPR) */}
      <section className="relative bg-linear-to-br from-[#081c15] via-[#1a4d2e] to-[#0f2920] py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#1a4d2e]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-prana-gold/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-1.5 bg-prana-gold/20 backdrop-blur-sm rounded-full text-prana-gold text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Productos seleccionados con los más altos estándares
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Nuestros Productos</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Equipamiento profesional para cultivadores exigentes
          </p>

          {/* Search (Static part) */}
          <form method="GET" className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="q"
                type="text"
                defaultValue={query}
                placeholder="Buscar productos..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/95 backdrop-blur-sm text-gray-900 rounded-xl border-0 focus:ring-2 focus:ring-prana-gold shadow-lg text-sm"
              />
            </div>
            {category && <input type="hidden" name="category" value={category} />}
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductList query={query} category={category} searchParams={resolvedParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductList({
  query,
  category,
  searchParams,
}: {
  query?: string;
  category?: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const minPriceNum =
    typeof searchParams.minPrice === 'string' ? Number(searchParams.minPrice) : undefined;
  const maxPriceNum =
    typeof searchParams.maxPrice === 'string' ? Number(searchParams.maxPrice) : undefined;

  const minPrice =
    minPriceNum !== undefined && !Number.isNaN(minPriceNum)
      ? Money.create(minPriceNum, 'CLP').getValue()
      : undefined;
  const maxPrice =
    maxPriceNum !== undefined && !Number.isNaN(maxPriceNum)
      ? Money.create(maxPriceNum, 'CLP').getValue()
      : undefined;

  let products: Awaited<ReturnType<typeof getAllProducts>> = [];
  try {
    products = await getAllProducts({
      query,
      category,
      minPrice,
      maxPrice,
    });
  } catch (_error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 rounded-3xl border-2 border-dashed border-[#1a4d2e]/20 bg-linear-to-br from-[#081c15]/5 to-[#1a4d2e]/5">
        <div className="w-20 h-20 rounded-full bg-[#1a4d2e]/10 flex items-center justify-center mb-6">
          <Leaf className="w-10 h-10 text-[#1a4d2e]" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
          Catálogo no disponible
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md leading-relaxed">
          No se pudo cargar el catálogo de productos en este momento. Por favor, intenta nuevamente.
        </p>
      </div>
    );
  }

  const categories = [
    { slug: undefined, label: 'Todos', count: products.length },
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))).map((cat) => ({
      slug: cat,
      label: cat,
      count: products.filter((p) => p.category === cat).length,
    })),
  ];

  if (products.length === 0) {
    if (query || category) {
      return (
        <div className="text-center py-20">
          <Filter className="mx-auto w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Sin resultados
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 wrap-break-word max-w-lg mx-auto">
            {query
              ? `No hay productos que coincidan con "${query.length > 60 ? `${query.slice(0, 60)}…` : query}".`
              : 'No hay productos en esta categoría aún.'}
          </p>
          <a
            href="/products"
            className="inline-flex items-center px-6 py-2.5 bg-[#1a4d2e] text-white rounded-lg font-medium hover:bg-[#081c15] transition-colors"
          >
            Ver todos los productos
          </a>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 rounded-3xl border-2 border-dashed border-[#1a4d2e]/20 bg-linear-to-br from-[#081c15]/5 to-[#1a4d2e]/5">
        <div className="w-20 h-20 rounded-full bg-[#1a4d2e]/10 flex items-center justify-center mb-6">
          <Leaf className="w-10 h-10 text-[#1a4d2e]" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-prana-gold/15 border border-prana-gold/30 text-prana-gold text-xs font-semibold tracking-wider uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Próximamente
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
          Catálogo en preparación
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md leading-relaxed">
          Estamos seleccionando el mejor equipamiento para tu cultivo indoor. Los productos se
          publicarán pronto desde nuestro panel de administración.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Category Pills + Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = cat.slug === category || (!cat.slug && !category);
            return (
              <a
                key={cat.slug || 'all'}
                href={
                  cat.slug
                    ? `?category=${cat.slug}${query ? `&q=${query}` : ''}`
                    : `/products${query ? `?q=${query}` : ''}`
                }
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1a4d2e] text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-prana-gold hover:text-[#1a4d2e]'
                }`}
              >
                {cat.label}
                <span
                  className={`ml-1.5 text-xs ${isActive ? 'text-green-100' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  ({cat.count})
                </span>
              </a>
            );
          })}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {products.length}{' '}
          {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          {query && (
            <span>
              {' '}
              para &ldquo;<strong>{query}</strong>&rdquo;
            </span>
          )}
        </p>
      </div>

      <ProductGrid products={products} />
    </>
  );
}
