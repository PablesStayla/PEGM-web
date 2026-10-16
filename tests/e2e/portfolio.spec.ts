import { expect, test } from "@playwright/test";
import { appReady } from "./helpers";

test("el recorrido cambia de perspectiva al bajar y permite saltar de capítulo", async ({
  page,
}) => {
  await appReady(page, "/");
  await page.locator("#simulacion").scrollIntoViewIfNeeded();
  await expect(page.locator('.chapter-nav a[aria-current="step"]')).toHaveText(/Simulación/);
  await expect(page.locator(".instrument-reading")).toContainText("12");
  await page.locator('.chapter-nav a[href="#aprendizaje"]').click();
  await expect(page.locator('.chapter-nav a[aria-current="step"]')).toHaveText(/Evolución/);
  await expect(page.locator("#aprendizaje")).toContainText("próximo objetivo");
});

test("móvil: contenido legible y contacto accesible sin desbordamiento", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await appReady(page, "/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator("#contacto").scrollIntoViewIfNeeded();
  await expect(page.locator('#contacto input[name="name"]')).toBeVisible();
  expect(await page.locator("html").evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe(
    "auto",
  );
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.getByRole("dialog", { name: "Buscador del sitio" })).toBeVisible();
});

test("la página sigue mostrando contenido sin JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /Pablo/ })).toBeVisible();
  await expect(page.locator("#procesos")).toContainText("CODELCO");
  await context.close();
});

test("la portada en inglés es accesible y enlaza las versiones de idioma", async ({ page }) => {
  await appReady(page, "/en");
  await expect(page.locator('[lang="en"]')).toContainText("Metallurgical Engineer");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/en$/);
  await expect(page.getByRole("link", { name: "Cambiar a español" })).toHaveAttribute("href", "/");
});

test("el buscador se cierra con Escape y con Ctrl+K, y enfoca el campo", async ({ page }) => {
  await appReady(page, "/");

  await page.getByRole("button", { name: /Buscar en el sitio/ }).click();
  const dialog = page.getByRole("dialog", { name: "Buscador del sitio" });
  await expect(dialog).toBeVisible();
  await expect(page.getByPlaceholder("Buscar en el sitio…")).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();

  await page.getByRole("button", { name: /Buscar en el sitio/ }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(dialog).not.toBeVisible();
});
