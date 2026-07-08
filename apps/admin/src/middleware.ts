import { updateSession } from '@pranakaia/infrastructure/auth/middleware';
import { type NextFetchEvent, type NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { createLogger } from '@/lib/logger';

const AGE_VERIFICATION_COOKIE_KEYS = ['pk_age_verified', 'pk_age_ok'] as const;
const ADMIN_ACCESS_AUDIT_PATH = '/api/internal/audit/access';

const log = createLogger({ module: 'admin:middleware' });

function hasVerifiedAgeCookie(request: NextRequest): boolean {
  return AGE_VERIFICATION_COOKIE_KEYS.some(
    (cookieName) => request.cookies.get(cookieName)?.value === 'true',
  );
}

function shouldRecordAccessAudit(request: NextRequest, response: Response): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return false;
  }

  if (request.nextUrl.pathname === '/age-verification') {
    return false;
  }

  return response.status >= 200 && response.status < 400;
}

function queueAdminAccessAudit(
  request: NextRequest,
  response: Response,
  event?: NextFetchEvent,
): void {
  if (!shouldRecordAccessAudit(request, response)) {
    return;
  }

  const auditSecret = env.CRON_SECRET;

  if (!auditSecret) {
    return;
  }

  const auditUrl = request.nextUrl.clone();
  auditUrl.pathname = ADMIN_ACCESS_AUDIT_PATH;
  auditUrl.search = '';

  const cookieHeader = request.headers.get('cookie');
  const userAgent = request.headers.get('user-agent');
  const forwardedFor = request.headers.get('x-forwarded-for');
  const referer = request.headers.get('referer');

  const headers = new Headers({
    authorization: `Bearer ${auditSecret}`,
    'content-type': 'application/json',
  });

  if (cookieHeader) {
    headers.set('cookie', cookieHeader);
  }

  if (userAgent) {
    headers.set('user-agent', userAgent);
  }

  if (forwardedFor) {
    headers.set('x-forwarded-for', forwardedFor);
  }

  const auditPromise = fetch(auditUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      pathname: request.nextUrl.pathname,
      method: request.method,
      responseStatus: response.status,
      referer,
    }),
    cache: 'no-store',
  }).catch((error) => {
    log.warn('Admin access audit dispatch failed', {
      error: error instanceof Error ? error.message : String(error),
      pathname: request.nextUrl.pathname,
    });
  });

  if (event) {
    event.waitUntil(auditPromise);
    return;
  }

  void auditPromise;
}

/**
 * Admin Protection Middleware (Staff Shield)
 * Enforces Age Gate and Session Security for all dashboard routes.
 */
export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // 1. Skip middleware for static assets, public logos, and fonts
  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/logos') ||
    pathname.startsWith('/fonts')
  ) {
    return NextResponse.next();
  }

  // 1.5 Local Dev Bypass — skip Age Gate + Auth for staff with pk-admin-local cookie
  const isLocalDevBypass =
    process.env.NODE_ENV === 'development' &&
    request.cookies.get('pk-admin-local')?.value === 'true';

  if (isLocalDevBypass && pathname !== '/login') {
    // Ensure age verification cookies are present so Age Gate doesn't interfere
    const response = NextResponse.next();
    if (!hasVerifiedAgeCookie(request)) {
      response.cookies.set('pk_age_verified', 'true', {
        path: '/',
        maxAge: 3600,
        sameSite: 'lax',
      });
    }
    return response;
  }

  // 2. Age Gate Check (Critical Compliance)
  const isVerified = hasVerifiedAgeCookie(request);
  const isOnAgeVerificationPage = pathname === '/age-verification';

  if (!isVerified && !isOnAgeVerificationPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/age-verification';
    return NextResponse.redirect(url);
  }

  // If already verified and on age verification, send to dashboard/login
  if (isVerified && isOnAgeVerificationPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // 3. Supabase Session Protection (Auth + Local Bypass)
  // Reusing the central middleware from the auth package.
  const response = await updateSession(request);
  queueAdminAccessAudit(request, response, event);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
