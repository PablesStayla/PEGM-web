/**
 * robots.ts
 *
 * Generates the /robots.txt response via Next.js Metadata API.
 * Controls which routes search engines may crawl.
 *
 * Rules:
 * - Public marketing and product pages → allow
 * - Authenticated / transactional routes → disallow
 * - API routes → disallow (should not be indexed)
 */

import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  // Use NEXT_PUBLIC_SITE_URL (canonical env var used throughout the app).
  // Fall back to NEXT_PUBLIC_APP_URL for backwards compatibility, then localhost.
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/checkout/',
          '/cart/',
          '/wishlist/',
          '/reset-password/',
          '/forgot-password/',
          '/api/',
          '/_next/',
        ],
      },
      {
        // Prevent AI training scrapers from indexing product content
        userAgent: [
          'GPTBot',
          'Google-Extended',
          'CCBot',
          'anthropic-ai',
          'Claude-Web',
          'Omgilibot',
          'FacebookBot',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
