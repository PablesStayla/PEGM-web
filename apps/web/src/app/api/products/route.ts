/**
 * @file apps/web/src/app/api/products/route.ts
 *
 * GET /api/products
 *
 * Returns the full product catalog. Cached at the Next.js level via
 * getAllProducts() (unstable_cache). This route exists for client-side
 * fetching and external integrations — server components should import
 * getAllProducts() directly.
 *
 * Rate limit: 120 req / 60 s per IP (permissive — it’s read-only public data).
 */

import { type NextRequest, NextResponse } from 'next/server';
import { CommonErrors } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { getAllProducts } from '@/lib/products';
import { applyRateLimitHeaders, rateLimit } from '@/lib/security/rate-limit-redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = createLogger({ module: 'api:products' });

export async function GET(request: NextRequest) {
  const start = performance.now();

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const rl = await rateLimit(request, 'products:GET', 120, 60);
  if (!rl.allowed) {
    log.warn('Rate limit exceeded', {
      path: '/api/products',
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    });
    const res = CommonErrors.TooManyRequests(
      'Too many product requests. Please slow down.',
      Math.ceil((rl.reset - Date.now()) / 1000),
    );
    applyRateLimitHeaders(res, rl);
    return res;
  }

  // ── Fetch ───────────────────────────────────────────────────────────────────
  try {
    const products = await getAllProducts();
    const durationMs = Math.round(performance.now() - start);

    log.info('Products fetched', { count: products.length, durationMs });

    const res = NextResponse.json(products);
    applyRateLimitHeaders(res, rl);
    return res;
  } catch (error) {
    const durationMs = Math.round(performance.now() - start);
    log.error('Failed to fetch products', {
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });
    return CommonErrors.InternalServerError(
      'Unable to retrieve products at this time. Please try again later.',
    );
  }
}
