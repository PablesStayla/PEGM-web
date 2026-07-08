import { Breadcrumbs } from '@pranakaia/ui';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ProductDetails } from '@/components/ProductDetails';
import { FrequentlyBoughtTogether, RelatedProducts } from '@/components/product';
import { getAllProducts, getProductBySlug } from '@/lib/products';
import { safeJsonLd } from '@/lib/security/safe-json-ld';
import type { Product } from '@/types';

export const revalidate = 3600; // ISR cada 1 hora

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Pre-generates static paths for the top products at build time.
 * Falls back to on-demand ISR if the database is unreachable during build
 * (e.g., in CI/CD environments like Vercel where DB access may be restricted).
 */
export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    return products.slice(0, 20).map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.warn(
      '⚠️ [generateStaticParams] Could not pre-generate product pages. ' +
        'Pages will be generated on-demand via ISR.',
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const params = await props.params;
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Producto no encontrado | PranaKaia',
      description: 'El producto que buscas no existe.',
    };
  }

  const title = `${product.name} | PranaKaia`;
  const description =
    product.description || `Compra ${product.name} en PranaKaia, tu tienda de cultivo premium.`;
  const images = product.images && product.images.length > 0 ? product.images : ['/product-og.jpg'];

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
      images: images,
      siteName: 'PranaKaia',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images,
    },
  };
}

export default async function ProductPage(props: Readonly<ProductPageProps>) {
  const params = await props.params;
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const baseUrl = 'https://pranakaia.cl'; // Fallback for structured data

  return (
    <div className="relative min-h-screen">
      {/* Background Ambiance - Staff-Level Depth */}
      <div className="fixed inset-0 bg-mesh-forest opacity-10 pointer-events-none" />
      <div className="fixed inset-0 bg-noise pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:py-16 sm:px-6 lg:px-8 space-y-16">
        <Breadcrumbs
          items={[
            { name: 'Inicio', href: '/' },
            { name: 'Productos', href: '/products' },
            { name: product.category || 'General', href: `/products?category=${product.category}` },
            { name: product.name, href: `/products/${params.slug}` },
          ]}
        />

        {/* Main Product Details - Rendered in Initial Shell (PPR) */}
        <ProductDetails product={product} />

        {/* Recommended Sibling Products - Streamed via Suspense */}
        <Suspense
          fallback={<div className="h-48 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
        >
          <RecommendationsWrapper product={product} />
        </Suspense>

        {/* Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires dangerouslySetInnerHTML
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              image: product.images,
              description: product.description,
              sku: product.id,
              brand: {
                '@type': 'Brand',
                name: 'PranaKaia',
              },
              offers: {
                '@type': 'Offer',
                url: `${baseUrl}/products/${params.slug}`,
                priceCurrency: 'CLP',
                price: product.price,
                availability:
                  (product.stock ?? 0) > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
              },
            }),
          }}
        />
      </div>
    </div>
  );
}

async function RecommendationsWrapper({ product }: { product: Product }) {
  // Related products: expensive call isolated here
  const allProducts = await getAllProducts();
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 8);

  if (related.length === 0) {
    return null;
  }

  return (
    <div className="space-y-16">
      <FrequentlyBoughtTogether
        mainProduct={product}
        suggestedProducts={related.slice(0, 3)}
        className="mt-4"
      />

      <RelatedProducts
        products={related}
        title="También te puede gustar"
        subtitle="Productos similares que podrían interesarte"
        className="mt-2"
      />
    </div>
  );
}
