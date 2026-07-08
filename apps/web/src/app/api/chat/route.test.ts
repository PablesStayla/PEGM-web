import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetAllProducts = vi.hoisted(() => vi.fn());
const mockRateLimit = vi.hoisted(() => vi.fn());
const mockApplyRateLimitHeaders = vi.hoisted(() => vi.fn());
const mockVerifyCsrfToken = vi.hoisted(() => vi.fn());
const mockEnv = vi.hoisted(() => ({
  NODE_ENV: 'production',
  NEXT_PUBLIC_SITE_URL: 'https://shop.pranakaia.test',
}));

vi.mock('@/lib/products', () => ({
  getAllProducts: (...args: unknown[]) => mockGetAllProducts(...args),
}));

vi.mock('@/lib/security/rate-limit-redis', () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
  applyRateLimitHeaders: (...args: unknown[]) => mockApplyRateLimitHeaders(...args),
}));

vi.mock('@/lib/security/csrf', () => ({
  verifyCsrfToken: (...args: unknown[]) => mockVerifyCsrfToken(...args),
}));

vi.mock('@/lib/env', () => ({
  env: mockEnv,
}));

import { dynamic, maxDuration, POST } from './route';

function buildRequest(
  body: unknown,
  options: {
    url?: string;
    origin?: string;
    csrfToken?: string;
  } = {},
): Request {
  const headers = new Headers({
    'content-type': 'application/json',
  });

  if (options.origin) {
    headers.set('origin', options.origin);
  }

  if (options.csrfToken) {
    headers.set('x-csrf-token', options.csrfToken);
  }

  return new Request(options.url ?? 'https://shop.pranakaia.test/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('chat api route', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockEnv.NODE_ENV = 'production';
    mockEnv.NEXT_PUBLIC_SITE_URL = 'https://shop.pranakaia.test';

    mockRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 29,
      reset: Date.now() + 60_000,
      limit: 30,
    });
    mockVerifyCsrfToken.mockResolvedValue(true);
    mockGetAllProducts.mockResolvedValue([
      {
        name: 'Kit LED Pro',
        description: 'Iluminacion para cultivo indoor',
        category: 'Iluminacion',
        tags: ['led', 'indoor'],
        price: 19990,
        featured: true,
      },
    ]);
  });

  it('returns 429 when rate limit is exceeded', async () => {
    mockRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      reset: Date.now() + 60_000,
      limit: 30,
    });

    const response = await POST(
      buildRequest({ messages: [{ role: 'user', content: 'hola' }] }, { csrfToken: 'valid-token' }),
    );
    const body = (await response.json()) as { role: string; content: string };

    expect(response.status).toBe(429);
    expect(body).toEqual({
      role: 'assistant',
      content: 'Demasiadas solicitudes. Intenta nuevamente en un minuto.',
    });
    expect(mockApplyRateLimitHeaders).toHaveBeenCalled();
  });

  it('returns 403 when origin is not allowed in production', async () => {
    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'hola' }] },
        {
          origin: 'https://evil.example.com',
          csrfToken: 'valid-token',
        },
      ),
    );
    const body = (await response.json()) as { role: string; content: string };

    expect(response.status).toBe(403);
    expect(body).toEqual({ role: 'assistant', content: 'Origen de solicitud no permitido.' });
  });

  it('returns 403 when CSRF token is missing in production', async () => {
    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'hola' }] },
        {
          origin: 'https://shop.pranakaia.test',
        },
      ),
    );

    expect(response.status).toBe(403);
  });

  it('returns 403 when CSRF token is invalid in production', async () => {
    mockVerifyCsrfToken.mockResolvedValueOnce(false);

    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'hola' }] },
        {
          origin: 'https://shop.pranakaia.test',
          csrfToken: 'invalid-token',
        },
      ),
    );

    expect(response.status).toBe(403);
  });

  it('returns assistant response for valid requests', async () => {
    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'busco led' }] },
        {
          origin: 'https://shop.pranakaia.test',
          csrfToken: 'valid-token',
        },
      ),
    );
    const body = (await response.json()) as { role: string; content: string };

    expect(response.status).toBe(200);
    expect(body.role).toBe('assistant');
    expect(body.content.toLowerCase()).toContain('kit led');
    expect(mockApplyRateLimitHeaders).toHaveBeenCalled();
    expect(mockRateLimit).toHaveBeenCalledWith(expect.any(Request), 'chat:POST', 30, 60);
  });

  it('exports runtime hints expected by Next route handlers', () => {
    expect(dynamic).toBe('force-dynamic');
    expect(maxDuration).toBe(60);
  });

  it('allows requests without origin header when rate-limit passes', async () => {
    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'busco kit led' }] },
        {
          csrfToken: 'valid-token',
        },
      ),
    );

    expect(response.status).toBe(200);
  });

  it('accepts CSRF token from uppercase header fallback', async () => {
    const headers = new Headers({
      'content-type': 'application/json',
      origin: 'https://shop.pranakaia.test',
      'X-CSRF-Token': 'valid-token',
    });

    const request = new Request('https://shop.pranakaia.test/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages: [{ role: 'user', content: 'busco led' }] }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockVerifyCsrfToken).toHaveBeenCalledWith('valid-token');
  });

  it('returns prompt helper when message is empty', async () => {
    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: '  ' }] },
        {
          origin: 'https://shop.pranakaia.test',
          csrfToken: 'valid-token',
        },
      ),
    );
    const body = (await response.json()) as { content: string };

    expect(response.status).toBe(200);
    expect(body.content).toContain('Cuentame');
  });

  it('returns prompt helper when messages is not an array', async () => {
    const response = await POST(
      buildRequest(
        { messages: { role: 'user', content: 'busco led' } },
        {
          origin: 'https://shop.pranakaia.test',
          csrfToken: 'valid-token',
        },
      ),
    );
    const body = (await response.json()) as { content: string };

    expect(response.status).toBe(200);
    expect(body.content).toContain('Cuentame');
  });

  it('skips CSRF enforcement outside production', async () => {
    mockEnv.NODE_ENV = 'development';

    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'envio' }] },
        {
          origin: 'https://evil.example.com',
        },
      ),
    );

    expect(response.status).toBe(200);
  });

  it('tolerates malformed NEXT_PUBLIC_SITE_URL while keeping same-origin allowed', async () => {
    mockEnv.NEXT_PUBLIC_SITE_URL = 'not-a-valid-url';

    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'busco led' }] },
        {
          origin: 'https://shop.pranakaia.test',
          csrfToken: 'valid-token',
        },
      ),
    );

    expect(response.status).toBe(200);
  });

  it('returns featured fallback when there is no token match but featured catalog exists', async () => {
    mockGetAllProducts.mockResolvedValueOnce([
      {
        name: 'Fertilizante Premium',
        description: 'Nutricion avanzada',
        category: 'Nutrientes',
        tags: ['fertilizante'],
        price: 10990,
        featured: true,
      },
    ]);

    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'a' }] },
        {
          origin: 'https://shop.pranakaia.test',
          csrfToken: 'valid-token',
        },
      ),
    );
    const body = (await response.json()) as { content: string };

    expect(response.status).toBe(200);
    expect(body.content).toContain('destacados del catalogo');
    expect(body.content).toContain('Fertilizante Premium');
  });

  it('limits featured fallback suggestions to top 3 products', async () => {
    mockGetAllProducts.mockResolvedValueOnce([
      {
        name: 'Producto 1',
        description: 'Descripcion 1',
        category: 'General',
        tags: ['uno'],
        price: 1000,
        featured: true,
      },
      {
        name: 'Producto 2',
        description: 'Descripcion 2',
        category: 'General',
        tags: ['dos'],
        price: 2000,
        featured: true,
      },
      {
        name: 'Producto 3',
        description: 'Descripcion 3',
        category: 'General',
        tags: ['tres'],
        price: 3000,
        featured: true,
      },
      {
        name: 'Producto 4',
        description: 'Descripcion 4',
        category: 'General',
        tags: ['cuatro'],
        price: 4000,
        featured: true,
      },
    ]);

    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'a' }] },
        {
          origin: 'https://shop.pranakaia.test',
          csrfToken: 'valid-token',
        },
      ),
    );
    const body = (await response.json()) as { content: string };

    expect(response.status).toBe(200);
    expect(body.content).toContain('Producto 1');
    expect(body.content).toContain('Producto 2');
    expect(body.content).toContain('Producto 3');
    expect(body.content).not.toContain('Producto 4');
  });

  it('returns warranty guidance when user asks about garantia', async () => {
    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'cual es la garantia del producto?' }] },
        {
          origin: 'https://shop.pranakaia.test',
          csrfToken: 'valid-token',
        },
      ),
    );
    const body = (await response.json()) as { content: string };

    expect(response.status).toBe(200);
    expect(body.content.toLowerCase()).toContain('garantia');
  });

  it('returns payment guidance when user asks about cuotas', async () => {
    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'aceptan pago en cuotas?' }] },
        {
          origin: 'https://shop.pranakaia.test',
          csrfToken: 'valid-token',
        },
      ),
    );
    const body = (await response.json()) as { content: string };

    expect(response.status).toBe(200);
    expect(body.content.toLowerCase()).toContain('pagar');
  });

  it('uses the latest message from the conversation thread', async () => {
    const response = await POST(
      buildRequest(
        {
          messages: [
            { role: 'user', content: 'cual es la garantia?' },
            { role: 'user', content: 'aceptan pago en cuotas?' },
          ],
        },
        {
          origin: 'https://shop.pranakaia.test',
          csrfToken: 'valid-token',
        },
      ),
    );
    const body = (await response.json()) as { content: string };

    expect(response.status).toBe(200);
    expect(body.content).toContain('Puedes pagar con tarjeta');
    expect(body.content).not.toContain('devolucion dentro de 30 dias');
  });

  it('matches products when query contains accents', async () => {
    mockGetAllProducts.mockResolvedValueOnce([
      {
        name: 'Nutriente Organico',
        description: 'Fertilizacion avanzada para cultivo indoor',
        category: 'Nutrientes',
        tags: ['fertilizacion', 'organico'],
        price: 15990,
        featured: false,
      },
    ]);

    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'fertilización avanzada' }] },
        {
          origin: 'https://shop.pranakaia.test',
          csrfToken: 'valid-token',
        },
      ),
    );
    const body = (await response.json()) as { content: string };

    expect(response.status).toBe(200);
    expect(body.content).toContain('Nutriente Organico');
  });

  it('sorts relevant products by score before rendering suggestions', async () => {
    mockGetAllProducts.mockResolvedValueOnce([
      {
        name: 'Kit Indoor Basico',
        description: 'Cultivo indoor para principiantes',
        category: 'Cultivo',
        tags: ['indoor'],
        price: 20990,
        featured: false,
      },
      {
        name: 'Kit LED Indoor Pro',
        description: 'Kit avanzado para cultivo indoor con panel led',
        category: 'Cultivo',
        tags: ['indoor', 'led', 'pro'],
        price: 39990,
        featured: false,
      },
    ]);

    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'kit led indoor pro' }] },
        {
          origin: 'https://shop.pranakaia.test',
          csrfToken: 'valid-token',
        },
      ),
    );
    const body = (await response.json()) as { content: string };

    expect(response.status).toBe(200);
    const firstProductLine = body.content.split('\n').find((line) => line.trim().startsWith('- '));
    expect(firstProductLine).toContain('Kit LED Indoor Pro');
  });

  it('returns generic assistant help when no match and no featured products are available', async () => {
    mockGetAllProducts.mockResolvedValueOnce([
      {
        name: 'Producto Base',
        description: 'Generico',
        category: 'General',
        tags: [],
        price: 9990,
        featured: false,
      },
    ]);

    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'consulta ultra especifica inexistente' }] },
        {
          origin: 'https://shop.pranakaia.test',
          csrfToken: 'valid-token',
        },
      ),
    );
    const body = (await response.json()) as { content: string };

    expect(response.status).toBe(200);
    expect(body.content).toContain('Puedo ayudarte a buscar productos');
  });

  it('returns 500 fallback message when an unexpected error occurs', async () => {
    mockGetAllProducts.mockRejectedValueOnce(new Error('catalog unavailable'));

    const response = await POST(
      buildRequest(
        { messages: [{ role: 'user', content: 'busco led' }] },
        {
          origin: 'https://shop.pranakaia.test',
          csrfToken: 'valid-token',
        },
      ),
    );
    const body = (await response.json()) as { role: string; content: string };

    expect(response.status).toBe(500);
    expect(body.role).toBe('assistant');
    expect(body.content).toContain('Hubo un problema temporal');
  });
});
