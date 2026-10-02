import type { Locator, Page } from "@playwright/test";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@pablo.cl";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin1234";

/**
 * En modo dev (Turbopack) la primera carga compila la ruta: esperar a que la
 * red se calme asegura que React terminó de hidratar antes de interactuar.
 */
export async function appReady(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

/** Envía el formulario saltando la validación nativa (para probar Zod en el servidor). */
export async function submitBypassingNativeValidation(form: Locator): Promise<void> {
  await form.evaluate((el: HTMLFormElement) => {
    el.noValidate = true;
    el.requestSubmit();
  });
}

/** Inicia sesión en el panel y espera el dashboard. */
export async function login(page: Page): Promise<void> {
  await appReady(page, "/admin/login");
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin");
}
