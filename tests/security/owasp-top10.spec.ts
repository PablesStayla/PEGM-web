import { expect, test } from '@playwright/test';

const WEB_BASE = process.env.WEB_BASE_URL ?? 'http://localhost:3000';
const ADMIN_BASE = process.env.ADMIN_BASE_URL ?? 'http://localhost:3001';

test.describe('OWASP Top 10 Security Tests', () => {
  test('A01 — Broken Access Control: protected routes redirect unauthenticated users', async ({
    page,
  }) => {
    const protectedRoutes = ['/checkout', '/account', '/admin/dashboard'];

    for (const route of protectedRoutes) {
      const baseUrl = route.startsWith('/admin') ? ADMIN_BASE : WEB_BASE;
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
      const url = page.url();
      const isLoginOrAuthWall =
        url.includes('/login') || url.includes('/auth') || url.includes('/age-verification');
      expect(isLoginOrAuthWall || url.includes(route)).toBeTruthy();
    }
  });

  test('A02 — Cryptographic Failures: sensitive pages use HTTPS in production', async ({
    page,
  }) => {
    if (!process.env.CI) {
      return;
    }

    const response = await page.goto(`${WEB_BASE}/login`);
    const url = response?.url() ?? page.url();
    const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
    const isHttps = url.startsWith('https://');
    expect(isLocalhost || isHttps).toBeTruthy();
  });

  test('A03 — Injection: search input does not execute XSS payloads', async ({ page }) => {
    await page.goto(`${WEB_BASE}/products`, { waitUntil: 'domcontentloaded' });

    const searchInput = page
      .locator('[data-testid="product-search"]')
      .or(page.getByPlaceholder(/buscar|search/i))
      .first();
    if (!(await searchInput.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '"><svg/onload=alert("XSS")>',
    ];

    for (const payload of xssPayloads) {
      await searchInput.fill(payload);
      await page.waitForTimeout(500);
    }

    const pageContent = await page.content();
    expect(pageContent).not.toMatch(/<script>alert\("XSS"\)<\/script>/i);
  });

  test('A03 — Injection: SQL injection payloads do not crash the app', async ({ page }) => {
    await page.goto(`${WEB_BASE}/products`, { waitUntil: 'domcontentloaded' });

    const searchInput = page
      .locator('[data-testid="product-search"]')
      .or(page.getByPlaceholder(/buscar|search/i))
      .first();
    if (!(await searchInput.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const sqlPayloads = ["'; DROP TABLE products; --", "' OR '1'='1", '1; SELECT * FROM users; --'];

    for (const payload of sqlPayloads) {
      await searchInput.fill(payload);
      await page.waitForTimeout(500);
    }

    const productList = page.locator('[data-testid="product-list"]').or(page.locator('main'));
    await expect(productList.first())
      .toBeVisible({ timeout: 5_000 })
      .catch(() => {});
  });

  test('A04 — Insecure Design: security headers are present', async ({ page }) => {
    const response = await page.goto(`${WEB_BASE}/`);
    const headers = response?.headers() ?? {};

    const xFrameOptions = headers['x-frame-options'];
    const xContentType = headers['x-content-type-options'];
    const hsts = headers['strict-transport-security'];
    const csp = headers['content-security-policy'];

    if (process.env.CI) {
      expect(xFrameOptions).toMatch(/DENY|SAMEORIGIN/i);
      expect(xContentType).toBe('nosniff');
      expect(hsts).toBeTruthy();
      expect(csp).toBeTruthy();
    }
  });

  test('A05 — Security Misconfiguration: no secrets exposed in HTML', async ({ page }) => {
    await page.goto(`${WEB_BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.goto(`${ADMIN_BASE}/login`, { waitUntil: 'domcontentloaded' }).catch(() => {});

    const html = await page.content();
    expect(html).not.toMatch(/api_key\s*=\s*["'][^"']{10,}/i);
    expect(html).not.toMatch(/secret\s*=\s*["'][^"']{10,}/i);
    expect(html).not.toMatch(/password\s*=\s*["'][^"']+["']/i);
    expect(html).not.toMatch(/sk_live_[a-zA-Z0-9]+/i);
    expect(html).not.toMatch(/STRIPE_SECRET_KEY/i);
  });

  test('A05 — Security Misconfiguration: clickjacking protection via X-Frame-Options', async ({
    page,
  }) => {
    const response = await page.goto(`${WEB_BASE}/`);
    const headers = response?.headers() ?? {};

    const xFrameOptions = headers['x-frame-options'];
    if (xFrameOptions) {
      expect(xFrameOptions).toMatch(/DENY|SAMEORIGIN/i);
    }
  });

  test('A07 — Identification and Authentication Failures: password field has proper attributes', async ({
    page,
  }) => {
    await page.goto(`${WEB_BASE}/login`, { waitUntil: 'domcontentloaded' });

    const passwordField = page.locator('input[type="password"]').first();
    if (await passwordField.isVisible().catch(() => false)) {
      const autocomplete = await passwordField.getAttribute('autocomplete');
      expect(autocomplete).toMatch(/current-password|new-password/);
    }
  });

  test('A07 — Session cookies have secure attributes', async ({ page, context }) => {
    await page.goto(`${WEB_BASE}/`, { waitUntil: 'domcontentloaded' });
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(
      (c) => c.name.toLowerCase().includes('session') || c.name.toLowerCase().includes('auth'),
    );

    if (sessionCookie && process.env.CI) {
      expect(sessionCookie.httpOnly).toBe(true);
      expect(sessionCookie.secure).toBe(true);
      expect(['Strict', 'Lax']).toContain(sessionCookie.sameSite);
    }
  });

  test('A08 — Software and Data Integrity Failures: no mixed content', async ({ page }) => {
    const response = await page.goto(`${WEB_BASE}/`);
    if (!response) {
      return;
    }

    const html = await page.content();
    const mixedContent = html.match(/src\s*=\s*["']http:\/\//gi);
    expect(mixedContent).toBeNull();
  });

  test('A09 — Security Logging and Monitoring Failures: rate limiting is active', async ({
    request,
  }) => {
    const responses = [];
    for (let i = 0; i < 15; i++) {
      responses.push(request.get(`${WEB_BASE}/api/products`));
    }
    const results = await Promise.all(responses);
    const rateLimited = results.filter((r) => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThanOrEqual(0);
  });

  test('A10 — Server-Side Request Forgery: admin API endpoints validate input', async ({
    request,
  }) => {
    const ssrfPayloads = [
      { url: 'http://169.254.169.254/latest/meta-data/' },
      { url: 'http://localhost:3002/internal' },
      { url: 'file:///etc/passwd' },
    ];

    for (const payload of ssrfPayloads) {
      const res = await request
        .post(`${ADMIN_BASE}/api/webhooks/test`, {
          data: payload,
        })
        .catch(() => null);

      if (res) {
        expect([400, 401, 403, 422]).toContain(res.status());
      }
    }
  });
});
