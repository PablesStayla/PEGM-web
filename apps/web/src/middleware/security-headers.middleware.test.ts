import { NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';
import { applySecurityHeaders } from './security-headers';

function buildExpectedCsp(isDevelopment: boolean): string {
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

describe('security headers middleware helper', () => {
  it('applies required security headers and CSP report-only', () => {
    const response = NextResponse.next();
    const secured = applySecurityHeaders(response, {
      isHttps: true,
      isDevelopment: false,
    });

    expect(secured.headers.get('X-Frame-Options')).toBe('DENY');
    expect(secured.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(secured.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(secured.headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=(), payment=(self)',
    );
    expect(secured.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
    expect(secured.headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin');
    expect(secured.headers.get('X-DNS-Prefetch-Control')).toBe('off');
    expect(secured.headers.get('X-Permitted-Cross-Domain-Policies')).toBe('none');
    expect(secured.headers.get('Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains; preload',
    );

    const csp = secured.headers.get('Content-Security-Policy-Report-Only');
    expect(csp).toBe(buildExpectedCsp(false));
  });

  it('does not set HSTS in non-https requests', () => {
    const response = NextResponse.next();
    const secured = applySecurityHeaders(response, {
      isHttps: false,
      isDevelopment: true,
    });

    expect(secured.headers.get('Strict-Transport-Security')).toBeNull();

    const csp = secured.headers.get('Content-Security-Policy-Report-Only') ?? '';
    expect(csp).toBe(buildExpectedCsp(true));
  });
});
