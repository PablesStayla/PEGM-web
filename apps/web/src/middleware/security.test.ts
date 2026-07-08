import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { securityMiddleware } from './security';

function createRequest(url: string, cookies: Record<string, string> = {}) {
  const request = new NextRequest(url);

  for (const [name, value] of Object.entries(cookies)) {
    request.cookies.set(name, value);
  }

  return request;
}

describe('web security middleware age verification', () => {
  it('redirige a age-verification cuando no hay cookies de verificación', () => {
    const response = securityMiddleware(createRequest('http://localhost/es/products'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/es/age-verification');
    expect(response.headers.get('location')).toContain('from=%2Fes%2Fproducts');
  });

  it('permite navegación cuando existe cookie pk_age_ok', () => {
    const response = securityMiddleware(
      createRequest('http://localhost/es/products', {
        pk_age_ok: 'true',
      }),
    );

    expect(response.status).toBe(200);
  });

  it('permite navegación cuando existe cookie pk_age_verified', () => {
    const response = securityMiddleware(
      createRequest('http://localhost/es/products', {
        pk_age_verified: 'true',
      }),
    );

    expect(response.status).toBe(200);
  });

  it('ignora paths de API y assets', () => {
    const apiResponse = securityMiddleware(createRequest('http://localhost/es/api/chat'));
    const assetResponse = securityMiddleware(
      createRequest('http://localhost/_next/static/chunk.js'),
    );

    expect(apiResponse.status).toBe(200);
    expect(assetResponse.status).toBe(200);
  });
});
