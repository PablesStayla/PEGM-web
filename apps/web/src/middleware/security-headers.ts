import type { NextResponse } from 'next/server';

function buildContentSecurityPolicyReportOnly(isDevelopment: boolean): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    'https://js.stripe.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://challenges.cloudflare.com',
  ];

  if (isDevelopment) {
    scriptSrc.push("'unsafe-eval'", 'http://localhost:3000');
  }

  const connectSrc = [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://api.stripe.com',
    'https://www.google-analytics.com',
    'https://*.ingest.sentry.io',
    'https://challenges.cloudflare.com',
  ];

  if (isDevelopment) {
    connectSrc.push('http://localhost:3000', 'ws://localhost:3000');
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "worker-src 'self' blob:",
    `connect-src ${connectSrc.join(' ')}`,
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
  ].join('; ');
}

export function applySecurityHeaders(
  response: NextResponse,
  options: { isHttps: boolean; isDevelopment: boolean },
): NextResponse {
  const { isHttps, isDevelopment } = options;

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)',
  );
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set(
    'Content-Security-Policy-Report-Only',
    buildContentSecurityPolicyReportOnly(isDevelopment),
  );

  if (isHttps) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
  }

  return response;
}
