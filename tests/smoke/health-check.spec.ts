import { expect, test } from '@playwright/test';

const WEB_BASE = process.env.WEB_BASE_URL ?? 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3002';
const ADMIN_BASE = process.env.ADMIN_BASE_URL ?? 'http://localhost:3001';

test.describe('Smoke Tests — Health Check', () => {
  test('Web app returns 200 on /', async ({ request }) => {
    const res = await request.get(`${WEB_BASE}/`);
    expect(res.ok).toBeTruthy();
  });

  test('Web app /api/health returns status ok', async ({ request }) => {
    const res = await request.get(`${WEB_BASE}/api/health`);
    expect(res.ok).toBeTruthy();

    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('API server /api/health returns status ok', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    expect(res.ok).toBeTruthy();

    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('Admin app /api/health returns status ok', async ({ request }) => {
    const res = await request.get(`${ADMIN_BASE}/api/health`);
    expect(res.ok).toBeTruthy();
  });

  test('Products API returns data', async ({ request }) => {
    const res = await request.get(`${WEB_BASE}/api/products`, { timeout: 35_000 });
    expect(res.ok).toBeTruthy();

    const body = await res.json();
    const products = Array.isArray(body) ? body : (body.products ?? []);
    expect(products.length).toBeGreaterThanOrEqual(0);
  });

  test('Homepage loads and renders main content', async ({ page }) => {
    await page.goto(`${WEB_BASE}/`, { waitUntil: 'domcontentloaded' });
    const main = page.locator('[role="main"]').or(page.locator('main')).or(page.locator('body'));
    await expect(main.first()).toBeVisible({ timeout: 15_000 });
  });

  test('Products page is accessible', async ({ page }) => {
    await page.goto(`${WEB_BASE}/products`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/products/);
  });

  test('Cart page is reachable', async ({ page }) => {
    await page.goto(`${WEB_BASE}/cart`, { waitUntil: 'domcontentloaded' });
    const url = page.url();
    expect(url).toContain('localhost');
  });
});
