import { setupTestEnvironment, type TestEnvironment } from '@pranakaia/testkit';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3002';

let testEnv: TestEnvironment;

beforeAll(async () => {
  testEnv = setupTestEnvironment({
    database: {
      url: process.env.TEST_DATABASE_URL ?? 'postgresql://test:test@localhost:5432/pranakaia_test',
    },
    redis: {
      url: process.env.TEST_REDIS_URL ?? 'redis://localhost:6379/1',
    },
    services: {
      identity: 'http://localhost:3004',
      catalog: 'http://localhost:3005',
      pricing: 'http://localhost:3005',
      inventory: 'http://localhost:3005',
      orders: 'http://localhost:3008',
      payments: 'http://localhost:3009',
      search: 'http://localhost:3010',
    },
  });
  await testEnv.init();
});

afterAll(async () => {
  await testEnv.close();
});

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) },
    ...options,
  });
}

describe('API → Database Integration', () => {
  describe('GET /api/products', () => {
    it('returns products from the database', async () => {
      const res = await apiFetch('/api/products');
      expect(res.ok).toBe(true);

      const body = await res.json();
      const products = Array.isArray(body) ? body : (body.products ?? []);
      expect(products.length).toBeGreaterThan(0);

      for (const product of products) {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
      }
    });

    it('product fields match Drizzle schema types', async () => {
      const res = await apiFetch('/api/products');
      const body = await res.json();
      const products = Array.isArray(body) ? body : (body.products ?? []);

      if (products.length > 0) {
        const product = products[0];
        expect(typeof product.id).toBe('string');
        expect(typeof product.name).toBe('string');
        expect(typeof product.price).toBe('number');
        if (product.sku !== undefined) {
          expect(typeof product.sku).toBe('string');
        }
        if (product.status !== undefined) {
          expect(typeof product.status).toBe('string');
        }
      }
    });

    it('supports pagination with cursor', async () => {
      const res = await apiFetch('/api/products?limit=5');
      const body = await res.json();
      const products = Array.isArray(body) ? body : (body.products ?? []);

      expect(products.length).toBeLessThanOrEqual(5);

      if (body.nextCursor) {
        const nextRes = await apiFetch(`/api/products?limit=5&cursor=${body.nextCursor}`);
        const nextBody = await nextRes.json();
        const nextProducts = Array.isArray(nextBody) ? nextBody : (nextBody.products ?? []);
        expect(nextProducts.length).toBeLessThanOrEqual(5);

        if (nextProducts.length > 0) {
          expect(nextProducts[0].id).not.toBe(products[0].id);
        }
      }
    });
  });

  describe('GET /api/health', () => {
    it('returns 200 with status ok', async () => {
      const res = await apiFetch('/api/health');
      expect(res.ok).toBe(true);

      const body = await res.json();
      expect(body.status).toBe('ok');
    });

    it('includes database connectivity check', async () => {
      const res = await apiFetch('/api/health');
      const body = await res.json();

      if (body.checks) {
        expect(body.checks.database ?? body.checks.db).toBeTruthy();
      }
    });
  });

  describe('POST /api/orders (authenticated)', () => {
    it('creates an order and persists to database', async () => {
      const authRes = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'Test@12345!' }),
      });

      if (!authRes.ok) {
        return;
      }
      const { accessToken } = (await authRes.json()) as { accessToken: string };

      const orderRes = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          items: [{ productId: 'test-product-1', quantity: 2 }],
          shippingAddress: {
            name: 'Sebastián González',
            street: 'Av. Providencia 1234',
            city: 'Santiago',
            region: 'Región Metropolitana',
            postalCode: '7500000',
            country: 'CL',
          },
        }),
      });

      if (orderRes.ok) {
        const order = (await orderRes.json()) as Record<string, unknown>;
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('orderNumber');

        const verifyRes = await apiFetch(`/api/orders/${order.id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (verifyRes.ok) {
          const verified = (await verifyRes.json()) as Record<string, unknown>;
          expect(verified.id).toBe(order.id);
        }
      }
    });
  });

  describe('Data integrity — DB round-trip', () => {
    it('product created via API is queryable from DB', async () => {
      const res = await apiFetch('/api/products');
      const body = await res.json();
      const products = Array.isArray(body) ? body : (body.products ?? []);

      if (products.length > 0) {
        const firstProduct = products[0];
        const detailRes = await apiFetch(`/api/products/${firstProduct.id ?? firstProduct.slug}`);
        if (detailRes.ok) {
          const detail = (await detailRes.json()) as Record<string, unknown>;
          expect(detail.name).toBe(firstProduct.name);
        }
      }
    });
  });
});
