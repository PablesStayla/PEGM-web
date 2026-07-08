/**
 * @file apps/web/src/proxy.ts
 *
 * Next.js Edge Proxy — runs on every non-static request.
 *
 * Execution order (each step is independent; failures are fail-open):
 *   1. Rate limiting     — reject abusive traffic before any auth work
 *   2. A/B bucketing     — assign experiment bucket if not already set
 *   3. Request ID        — attach X-Request-ID for distributed tracing
 *   4. Auth session      — refresh Supabase session tokens
 *   5. i18n routing      — handle locale prefixes / rewrites
 *
 * Webhooks skip auth session refresh (no session to refresh; avoids
 * Supabase overhead on high-volume payment callbacks).
 */

import { updateSession } from '@pranakaia/auth/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { intlMiddleware } from './middleware/i18n';
import { rateLimit } from './middleware/rateLimit';

const BUCKET_COOKIE = 'pk_experiment_bucket';
const BUCKET_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const AB_WEIGHT_A = 50; // % of traffic going to variant A

function startsWith(pathname: string, ...prefixes: string[]): boolean {
  return prefixes.some((p) => pathname.startsWith(p));
}

/**
 * Generate a request ID for distributed tracing.
 * Format: req_{timestamp_ms}_{random_6_hex}
 */
function generateRequestId(): string {
  // crypto.randomUUID() is available in Edge Runtime
  return `req_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 8)}`;
}

/**
 * Assign an A/B bucket.
 * We use Math.random() here because Edge Runtime doesn't have crypto.getRandomValues
 * in all environments, and for A/B bucketing cryptographic randomness is not required.
 */
function assignBucket(): 'A' | 'B' {
  return Math.random() * 100 < AB_WEIGHT_A ? 'A' : 'B';
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isWebhook = startsWith(pathname, '/api/webhooks/');

  // Execute BEFORE auth to protect against unauthenticated abuse.
  // Fail-open on Redis errors to avoid blocking legitimate traffic.
  try {
    let rlType: 'webhook' | 'checkout' | 'auth' | 'api' | null = null;

    if (isWebhook) {
      rlType = 'webhook';
    } else if (startsWith(pathname, '/api/checkout', '/checkout')) {
      rlType = 'checkout';
    } else if (startsWith(pathname, '/api/auth', '/login', '/register')) {
      rlType = 'auth';
    } else if (startsWith(pathname, '/api/')) {
      rlType = 'api';
    }

    if (rlType) {
      const blocked = await rateLimit(req, rlType);
      if (blocked) {
        return blocked;
      }
    }
  } catch {
    // Redis unavailable — fail-open, do not block legitimate traffic
  }

  const existingBucket = req.cookies.get(BUCKET_COOKIE)?.value as 'A' | 'B' | undefined;
  const bucket: 'A' | 'B' =
    existingBucket === 'A' || existingBucket === 'B' ? existingBucket : assignBucket();
  const isNewBucket = !existingBucket;

  const requestId = req.headers.get('x-request-id') ?? generateRequestId();

  // Forward request ID to downstream handlers via request headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);

  let response: NextResponse;

  if (isWebhook) {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    // updateSession() returns a NextResponse with refreshed session cookies
    response = await updateSession(req);
  }

  // next-intl may return redirect/rewrite responses.
  const intlResponse = intlMiddleware(req);
  const isRedirect = intlResponse.status >= 300 && intlResponse.status < 400;

  const finalResponse = isRedirect ? intlResponse : response;

  finalResponse.headers.set('x-request-id', requestId);

  if (isNewBucket) {
    const cookieOptions = {
      path: '/',
      maxAge: BUCKET_TTL_SECONDS,
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };
    finalResponse.cookies.set(BUCKET_COOKIE, bucket, cookieOptions);
  }

  return finalResponse;
}

export const config = {
  // Process all routes except Next.js internals and static files.
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
