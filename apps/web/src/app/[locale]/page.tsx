import { db, productImages, products } from '@pranakaia/infrastructure/db';
import { and, eq, gt, sql } from 'drizzle-orm';
import type { Metadata } from 'next';
import { FeaturedProducts } from '@/components/sections/featured-products';
import { HeroSection } from '@/components/sections/hero-section';
import { HowItWorks } from '@/components/sections/how-it-works';
import { NewsletterSignup } from '@/components/sections/newsletter-signup';
import { TrustSignals } from '@/components/sections/trust-signals';
import { BRANDING } from '@/config/branding';
import { CACHE_TAGS } from '@/lib/cache-tags';
export const experimental_ppr = true;

import { unstable_cache } from 'next/cache';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { routing } from '@/i18n/routing';
import { safeJsonLd } from '@/lib/security/safe-json-ld';
import { getSiteUrl } from '@/lib/site-url';

type FeaturedCatalogSnapshot = {
  featuredProducts: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: string;
    stock: number;
    featured: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  }>;
  lowPrice?: string;
  highPrice?: string;
  productCount: number;
};

const getFeaturedCatalogSnapshot = unstable_cache(
  async (): Promise<FeaturedCatalogSnapshot> => {
    const publishedFilter = and(eq(products.status, 'PUBLISHED'), gt(products.basePrice, '0'));

    const [catalogStats, featuredRows] = await Promise.all([
      db
        .select({
          min: sql<number>`MIN(${products.basePrice})`,
          max: sql<number>`MAX(${products.basePrice})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(products)
        .where(publishedFilter),

      db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          price: products.basePrice,
          salePrice: products.salePrice,
          stock: products.stockQuantity,
          image: productImages.url,
        })
        .from(products)
        .leftJoin(
          productImages,
          and(eq(productImages.productId, products.id), eq(productImages.isMain, true)),
        )
        .where(and(publishedFilter, eq(products.isFeatured, true)))
        .limit(4),
    ]);

    return {
      lowPrice: catalogStats[0]?.min?.toString(),
      highPrice: catalogStats[0]?.max?.toString(),
      productCount: catalogStats[0]?.count ?? 0,
      featuredProducts: featuredRows
        .filter((row, index, self) => index === self.findIndex((r) => r.id === row.id))
        .map((row) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description ?? '',
          price: Number(row.salePrice ?? row.price),
          originalPrice: row.salePrice ? Number(row.price) : undefined,
          images: row.image ? [row.image] : [],
          category: '',
          stock: row.stock,
          featured: true,
          tags: [] as string[],
          createdAt: '',
          updatedAt: '',
        })),
    };
  },
  ['home-featured-catalog-v1'],
  {
    revalidate: 300,
    tags: [CACHE_TAGS.products, CACHE_TAGS.featuredProducts],
  },
);

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: BRANDING.seo.defaultTitle,
  description: BRANDING.seo.defaultDescription,
  keywords: [...BRANDING.seo.keywords] as string[],
  openGraph: {
    title: BRANDING.seo.defaultTitle,
    description: BRANDING.seo.defaultDescription,
    images: [BRANDING.seo.ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: BRANDING.seo.defaultTitle,
    description: BRANDING.seo.defaultDescription,
  },
};

export const revalidate = 3600; // ISR cada 1 hora

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const baseUrl = getSiteUrl();

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRANDING.name,
    url: baseUrl,
    logo: `${baseUrl}${BRANDING.logo.main}`,
    description: BRANDING.seo.defaultDescription,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Spanish',
    },
  };

  const webSiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRANDING.seo.siteName,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <main className="min-h-screen">
      {/* JSON-LD Structured Data (Static part) */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires dangerouslySetInnerHTML
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires dangerouslySetInnerHTML
        dangerouslySetInnerHTML={{ __html: safeJsonLd(webSiteJsonLd) }}
      />

      {/* Hero Section - Psychological Impact (Static Shell) */}
      <HeroSection />

      {/* Trust Signals - Social Proof (Static Shell) */}
      <TrustSignals />

      {/* Featured Products & Dynamic SEO - FOMO & Desire (Streamed) */}
      <Suspense fallback={<div className="h-96" />}>
        <FeaturedProductsSection baseUrl={baseUrl} />
      </Suspense>

      {/* How It Works - Reduce Anxiety (Static Shell) */}
      <HowItWorks />

      {/* Newsletter Signup - Final Conversion (Static Shell) */}
      <NewsletterSignup />
    </main>
  );
}

/**
 * Fetches featured products and catalog statistics directly from Postgres.
 * Wrapped in try/catch to allow graceful degradation during Vercel's SSG phase
 * when the database may be unreachable (e.g., `XX000: Tenant or user not found`).
 */
async function FeaturedProductsSection({ baseUrl }: { baseUrl: string }) {
  let featuredProducts: FeaturedCatalogSnapshot['featuredProducts'] = [];
  let lowPrice: string | undefined;
  let highPrice: string | undefined;
  let productCount = 0;

  try {
    const snapshot = await getFeaturedCatalogSnapshot();
    lowPrice = snapshot.lowPrice;
    highPrice = snapshot.highPrice;
    productCount = snapshot.productCount;
    featuredProducts = snapshot.featuredProducts;
  } catch (_error) {
    console.warn(
      '⚠️ [FeaturedProductsSection] DB unreachable during build. ' +
        'Rendering with empty catalog — data will load via ISR at runtime.',
    );
  }

  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: BRANDING.seo.siteName,
    image: `${baseUrl}${BRANDING.logo.main}`,
    url: baseUrl,
    description: BRANDING.seo.defaultDescription,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Concepción',
      addressRegion: 'Biobío',
      addressCountry: 'CL',
    },
    ...(productCount > 0 && {
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'CLP',
        ...(lowPrice && { lowPrice }),
        ...(highPrice && { highPrice }),
        offerCount: productCount.toString(),
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires dangerouslySetInnerHTML
        dangerouslySetInnerHTML={{ __html: safeJsonLd(storeJsonLd) }}
      />
      <FeaturedProducts products={featuredProducts} />
    </>
  );
}
