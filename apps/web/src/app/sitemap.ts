/**
 * sitemap.ts
 *
 * Dynamic sitemap generation for Next.js.
 * Static routes are always included; product routes are fetched from the DB
 * at runtime/ISR and omitted during the static build phase to avoid errors.
 */

import { db, isBuild, products } from '@pranakaia/infrastructure/db';
import { eq } from 'drizzle-orm';
import type { MetadataRoute } from 'next';
import { createLogger } from '@/lib/logger';
import { getSiteUrl } from '@/lib/site-url';

const log = createLogger({ module: 'sitemap' });

const BASE_URL = getSiteUrl();

/** Static pages always included in the sitemap */
const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}> = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  // Skip DB query during static build to avoid connection errors in CI
  if (isBuild) {
    log.debug('Sitemap: skipping dynamic product routes (build phase)');
    return staticEntries;
  }

  try {
    const publishedProducts = await db
      .select({ slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .where(eq(products.status, 'PUBLISHED'));

    log.debug('Sitemap: fetched product routes', { count: publishedProducts.length });

    const productEntries: MetadataRoute.Sitemap = publishedProducts.map((p) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt ?? now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticEntries, ...productEntries];
  } catch (error) {
    log.error('Sitemap: failed to fetch product routes, returning static only', {
      error: error instanceof Error ? error.message : String(error),
    });
    // Return static entries only — a degraded sitemap is better than no sitemap
    return staticEntries;
  }
}
