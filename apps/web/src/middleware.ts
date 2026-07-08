import { type NextRequest, NextResponse } from 'next/server';
import { intlMiddleware } from './middleware/i18n';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { securityMiddleware } from './middleware/security';
import { applySecurityHeaders } from './middleware/security-headers';

const PUBLIC_FILE_RE = /\/[^/]+\.[^/]+$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isHttps = request.nextUrl.protocol === 'https:';
  const isDevelopment = ['localhost', '127.0.0.1'].includes(request.nextUrl.hostname);
  const withSecurityHeaders = (response: NextResponse) =>
    applySecurityHeaders(response, { isHttps, isDevelopment });

  // Bypass i18n/security redirects for public files (manifest, logos, favicon, etc.)
  if (PUBLIC_FILE_RE.test(pathname)) {
    return withSecurityHeaders(NextResponse.next());
  }

  // 1. Rate Limiting (Protección de Infraestructura)
  const rateLimitRes = await rateLimitMiddleware(request);
  if (rateLimitRes) {
    return withSecurityHeaders(rateLimitRes);
  }

  // 2. Ejecutar Security Middleware (Age Gate / Auth Shield)
  const securityRes = securityMiddleware(request);

  // Si hay redirección del Age Gate, retornarla inmediatamente
  if (securityRes.headers.get('location')) {
    return withSecurityHeaders(securityRes);
  }

  // 3. Ejecutar I18n Middleware (Excepto para APIs)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return withSecurityHeaders(NextResponse.next());
  }

  return withSecurityHeaders(intlMiddleware(request));
}

// Configuración de rutas protegidas (Staff Level Matcher)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Incluimos /api para permitir rate-limiting global en el Edge.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
