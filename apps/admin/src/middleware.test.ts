import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUpdateSession = vi.hoisted(() => vi.fn(async () => NextResponse.next()));
const mockFetch = vi.hoisted(() => vi.fn(async () => new Response(null, { status: 202 })));
const auditAuthToken = 'test-token';

vi.stubEnv('CRON_SECRET', auditAuthToken);
vi.stubGlobal('fetch', mockFetch);

vi.mock('@pranakaia/infrastructure/auth/middleware', () => ({
  updateSession: mockUpdateSession,
}));

import { middleware } from './middleware';

function createRequest(pathname: string, cookies: Record<string, string> = {}) {
  const request = new NextRequest(`http://localhost${pathname}`);

  for (const [name, value] of Object.entries(cookies)) {
    request.cookies.set(name, value);
  }

  return request;
}

function createEvent() {
  const waitUntil = vi.fn((promise: Promise<unknown>) => promise);

  return {
    waitUntil,
  };
}

describe('admin middleware age verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirige a /age-verification cuando no existe cookie de verificación', async () => {
    const event = createEvent();
    const response = await middleware(createRequest('/dashboard'), event as never);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/age-verification');
    expect(mockUpdateSession).not.toHaveBeenCalled();
    expect(event.waitUntil).not.toHaveBeenCalled();
  });

  it('permite acceso con cookie pk_age_verified', async () => {
    const event = createEvent();
    const response = await middleware(
      createRequest('/dashboard', {
        pk_age_verified: 'true',
      }),
      event as never,
    );

    expect(response.status).toBe(200);
    expect(mockUpdateSession).toHaveBeenCalledTimes(1);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
  });

  it('permite acceso con cookie pk_age_ok por compatibilidad', async () => {
    const event = createEvent();
    const response = await middleware(
      createRequest('/dashboard', {
        pk_age_ok: 'true',
      }),
      event as never,
    );

    expect(response.status).toBe(200);
    expect(mockUpdateSession).toHaveBeenCalledTimes(1);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);
  });

  it('redirige a / cuando ya está verificado y entra a /age-verification', async () => {
    const event = createEvent();
    const response = await middleware(
      createRequest('/age-verification', {
        pk_age_verified: 'true',
      }),
      event as never,
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/');
    expect(mockUpdateSession).not.toHaveBeenCalled();
    expect(event.waitUntil).not.toHaveBeenCalled();
  });

  it('envía auditoría interna de acceso para rutas permitidas', async () => {
    const event = createEvent();

    const response = await middleware(
      createRequest('/orders', {
        pk_age_verified: 'true',
      }),
      event as never,
    );

    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(event.waitUntil).toHaveBeenCalledTimes(1);

    const firstCall = mockFetch.mock.calls[0] as unknown[];
    const url = firstCall[0] as URL;
    const options = firstCall[1] as RequestInit;

    expect(url.pathname).toBe('/api/internal/audit/access');
    expect(options.method).toBe('POST');

    const headers = options.headers as Headers;
    expect(headers.get('authorization')).toBe(`Bearer ${auditAuthToken}`);
  });
});
