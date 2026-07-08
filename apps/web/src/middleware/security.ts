import { type NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales } from '@/i18n/config';

const AGE_VERIFICATION_COOKIE_KEYS = ['pk_age_verified', 'pk_age_ok'] as const;
const PUBLIC_FILE_RE = /\/[^/]+\.[^/]+$/;

function hasVerifiedAgeCookie(request: NextRequest): boolean {
  return AGE_VERIFICATION_COOKIE_KEYS.some(
    (cookieName) => request.cookies.get(cookieName)?.value === 'true',
  );
}

/**
 * Security Middleware
 *
 * Middleware for implementing security measures at the runtime level
 */

export function securityMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Definir excepciones (Assets, API, Auth)
  const isApiRoute = /^\/(?:[a-z]{2}\/)?api\//.test(pathname);
  const isAsset = PUBLIC_FILE_RE.test(pathname) || pathname.startsWith('/_next/') || isApiRoute;

  const isVerificationPage = pathname.includes('age-verification');

  // 2. Ejecutar bloqueo si no es una excepción
  if (!isAsset && !isVerificationPage) {
    if (!hasVerifiedAgeCookie(request)) {
      // Redirigir al portal de verificación manteniendo un locale válido
      const firstSegment = pathname.split('/').filter(Boolean)[0];
      const locale = locales.includes(firstSegment as (typeof locales)[number])
        ? firstSegment
        : defaultLocale;
      const url = request.nextUrl.clone();

      // Asegurar que no entramos en loop si el pathname ya es la verificación
      url.pathname = `/${locale}/age-verification`;
      url.searchParams.set('from', pathname);

      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
