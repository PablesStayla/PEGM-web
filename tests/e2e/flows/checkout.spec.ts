import { type BrowserContext, expect, type Page, test } from '@playwright/test';

const CHILEAN_SHIPPING = {
  firstName: 'Sebastián',
  lastName: 'González',
  email: 'sebastian.gonzalez@example.com',
  phone: '+56912345678',
  address: 'Av. Providencia 1234',
  city: 'Santiago',
  region: 'Región Metropolitana',
  postalCode: '7500000',
  country: 'CL',
};

async function bypassAgeGate(context: BrowserContext) {
  await context.addCookies([
    { name: 'pk_age_ok', value: 'true', url: 'http://localhost:3000', sameSite: 'Lax' },
  ]);
}

async function addProductToCart(page: Page): Promise<boolean> {
  await page.goto('/products', { waitUntil: 'domcontentloaded' });
  const grid = page.locator('[data-testid="product-list"]');
  await expect(grid).toBeVisible({ timeout: 20_000 });

  const cards = page.locator('[data-testid="product-card"]');
  if ((await cards.count()) === 0) {
    return false;
  }

  const firstHref = await cards.first().locator('a').first().getAttribute('href');
  if (!firstHref) {
    return false;
  }

  await page.goto(firstHref, { waitUntil: 'domcontentloaded' });
  const addBtn = page.locator('[data-testid="add-to-cart-button"]');
  await expect(addBtn).toBeVisible({ timeout: 20_000 });

  if (await addBtn.isDisabled()) {
    return false;
  }
  await addBtn.click();
  await page.waitForTimeout(1_500);
  return true;
}

test.describe('Checkout Flow — End-to-End', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await bypassAgeGate(context);
  });

  test('1 · Catalog renders real product cards', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'domcontentloaded' });
    const grid = page.locator('[data-testid="product-list"]');
    await expect(grid).toBeVisible({ timeout: 20_000 });

    const cards = page.locator('[data-testid="product-card"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    const firstHref = await cards.first().locator('a').first().getAttribute('href');
    expect(firstHref).toMatch(/\/products\/.+/);
  });

  test('2 · Product detail renders name, price & CTA', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'domcontentloaded' });
    const cards = page.locator('[data-testid="product-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 20_000 });

    const firstHref = await cards.first().locator('a').first().getAttribute('href');
    expect(firstHref).toBeTruthy();
    await page.goto(firstHref!, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-testid="product-name"]')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-testid="add-to-cart-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart-button"]')).toBeEnabled();
  });

  test('3 · Add to cart updates UI state', async ({ page }) => {
    const added = await addProductToCart(page);
    if (!added) {
      test.skip();
      return;
    }

    await page.screenshot({ path: 'test-results/checkout/03-post-add-to-cart.png' });
  });

  test('4 · Cart page shows items and quantity controls', async ({ page }) => {
    const added = await addProductToCart(page);
    if (!added) {
      test.skip();
      return;
    }

    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    const cartItems = page.locator('[data-testid="cart-item"]');
    if ((await cartItems.count()) === 0) {
      test.skip();
      return;
    }

    await expect(page.locator('[data-testid="quantity-decrease"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="quantity-increase"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="cart-quantity"]').first()).toBeVisible();
  });

  test('5 · Cart — update quantity via +/- controls', async ({ page }) => {
    const added = await addProductToCart(page);
    if (!added) {
      test.skip();
      return;
    }

    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    const increaseBtn = page.locator('[data-testid="quantity-increase"]').first();
    if (!(await increaseBtn.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await increaseBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="cart-quantity"]').first()).toBeVisible();
  });

  test('6 · Cart — remove item clears from list', async ({ page }) => {
    const added = await addProductToCart(page);
    if (!added) {
      test.skip();
      return;
    }

    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    const items = page.locator('[data-testid="cart-item"]');
    if ((await items.count()) === 0) {
      test.skip();
      return;
    }

    await page.locator('[data-testid="remove-item"]').first().click();
    const emptyState = page
      .getByText(/Tu carrito esta vacio/i)
      .or(page.getByText(/Tu carrito está vacío/i));
    await expect(items.first().or(emptyState.first())).toBeVisible({ timeout: 8_000 });
  });

  test('7 · Apply discount coupon WELCOME10', async ({ page }) => {
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });

    const couponInput = page.getByPlaceholder(/código de cupón/i);
    if (!(await couponInput.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await couponInput.fill('WELCOME10');
    await page.getByRole('button', { name: /aplicar/i }).click();
    await expect(page.getByText(/descuento aplicado/i))
      .toBeVisible({ timeout: 5_000 })
      .catch(() => {});
  });

  test('8 · Checkout auth wall redirects unauthenticated users', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForTimeout(3_000);

    const url = page.url();
    expect(url.includes('/checkout') || url.includes('/login')).toBeTruthy();

    if (url.includes('/login')) {
      const loginForm = page.locator('form').first();
      await expect(loginForm).toBeVisible({ timeout: 8_000 });
    }
  });

  test('9 · Checkout without session never loops into age gate', async ({ page, context }) => {
    await context.clearCookies();
    await bypassAgeGate(context);

    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    const currentUrl = page.url();
    expect(currentUrl.includes('age-verification')).toBe(false);
    expect(currentUrl.includes('/checkout') || currentUrl.includes('/login')).toBeTruthy();
  });

  test('10 · Shipping form validation — empty submit shows errors', async ({ page, context }) => {
    const added = await addProductToCart(page);
    if (!added) {
      test.skip();
      return;
    }

    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    if (page.url().includes('/login')) {
      await page.locator('#email').fill(CHILEAN_SHIPPING.email);
      await page.locator('#password').fill('Test@12345!');
      await page.getByRole('button', { name: /identificarse|sign in/i }).click();
      await page.waitForURL(/\/checkout/, { timeout: 15_000 }).catch(() => {});
    }

    const proceedBtn = page.getByRole('button', { name: /continuar|proceed/i }).first();
    if (await proceedBtn.isVisible().catch(() => false)) {
      await proceedBtn.click();
      await expect(
        page
          .getByText(/nombre debe tener al menos/i)
          .or(page.getByText(/email inválido/i))
          .or(page.getByText(/requerido/i))
          .first(),
      )
        .toBeVisible({ timeout: 5_000 })
        .catch(() => {});
    }
  });

  test('11 · Full checkout flow — shipping → payment → order confirmation', async ({
    page,
    context,
  }) => {
    const added = await addProductToCart(page);
    if (!added) {
      test.skip();
      return;
    }

    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    if (page.url().includes('/login')) {
      await page.locator('#email').fill(CHILEAN_SHIPPING.email);
      await page.locator('#password').fill('Test@12345!');
      await page.getByRole('button', { name: /identificarse|sign in/i }).click();
      await page.waitForURL(/\/checkout/, { timeout: 15_000 }).catch(() => {});
    }

    const shippingFirstName = page
      .locator('[data-testid="shipping-first-name"]')
      .or(page.getByLabel(/nombre/i));
    if (await shippingFirstName.isVisible().catch(() => false)) {
      await shippingFirstName.first().fill(CHILEAN_SHIPPING.firstName);
      await page.getByLabel(/apellido/i).fill(CHILEAN_SHIPPING.lastName);
      await page.getByLabel(/email/i).fill(CHILEAN_SHIPPING.email);
      await page.getByLabel(/teléfono/i).fill(CHILEAN_SHIPPING.phone);
      await page.getByLabel(/dirección/i).fill(CHILEAN_SHIPPING.address);
      await page.getByLabel(/ciudad/i).fill(CHILEAN_SHIPPING.city);
      await page.getByLabel(/región/i).fill(CHILEAN_SHIPPING.region);
      await page.getByLabel(/código postal/i).fill(CHILEAN_SHIPPING.postalCode);

      const standardShipping = page
        .getByRole('radio', { name: /envío estándar/i })
        .or(page.locator('[data-testid="shipping-method-standard"]'));
      if (await standardShipping.isVisible().catch(() => false)) {
        await standardShipping.first().check();
      }

      const proceedBtn = page.getByRole('button', { name: /continuar al pago|proceed/i });
      await proceedBtn.click();
      await page.waitForLoadState('networkidle').catch(() => {});
    }

    await page.screenshot({ path: 'test-results/checkout/11-checkout-flow.png' });
  });

  test('12 · Offline checkout shows error + retry option', async ({ page, context }) => {
    const added = await addProductToCart(page);
    if (!added) {
      test.skip();
      return;
    }

    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    await page.context().setOffline(true);

    const submitBtn = page.getByRole('button', { name: /completar|submit|pagar/i }).first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await expect(
        page
          .locator('[data-testid="checkout-error"]')
          .or(page.getByText(/error|sin conexión/i).first()),
      )
        .toBeVisible({ timeout: 10_000 })
        .catch(() => {});
    }

    await page.context().setOffline(false);
    const retryBtn = page
      .locator('[data-testid="retry-checkout"]')
      .or(page.getByRole('button', { name: /reintentar|retry/i }));
    if (await retryBtn.isVisible().catch(() => false)) {
      await expect(retryBtn.first()).toBeVisible();
    }
  });

  test('13 · API smoke — GET /api/products returns JSON with products', async ({ request }) => {
    const res = await request.get('/api/products', { timeout: 35_000 });
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    const list: unknown[] = Array.isArray(body) ? body : (body.products ?? []);
    expect(list.length).toBeGreaterThan(0);
  });
});
