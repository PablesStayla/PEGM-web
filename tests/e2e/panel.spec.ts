import { expect, test } from "@playwright/test";
import { appReady, login } from "./helpers";

test.describe("Panel: CRUD de proyectos", () => {
  const suffix = Date.now();
  const title = `Proyecto E2E ${suffix}`;

  test("crear → ver en panel, portada y portafolio → eliminar con confirmación", async ({
    page,
  }) => {
    await login(page);

    // 1) abrir el formulario de alta (está dentro de un <details>) y crear
    await appReady(page, "/admin/proyectos");
    await page.getByText("+ Añadir nuevo proyecto").click();
    // el botón "Crear proyecto" solo existe en el formulario de alta
    // (los de edición usan "Guardar cambios"), así que el filtro es único
    const form = page
      .locator("form")
      .filter({ has: page.getByRole("button", { name: "Crear proyecto" }) });
    await form.locator('input[name="title"]').fill(title);
    await form.locator('input[name="category"]').fill("Prueba automatizada");
    await form.locator('input[name="year"]').fill("2026");
    await form
      .locator('textarea[name="summary"]')
      .fill("Proyecto creado y eliminado por Playwright.");
    await form.locator('input[name="tags"]').fill("e2e, playwright");
    await form.locator('input[name="featured"]').check();
    await form.getByRole("button", { name: "Crear proyecto" }).click();
    await page.waitForURL("**/admin/proyectos?saved=1");

    // 2) aparece en la lista del panel
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    // 3) aparece como destacado en la portada pública (revalidación on-demand)
    await appReady(page, "/");
    await expect(page.getByText(title).first()).toBeVisible();

    // 4) aparece también en el portafolio completo
    await appReady(page, "/proyectos");
    await expect(page.getByText(title).first()).toBeVisible();

    // 5) eliminarlo: el botón usa window.confirm
    await appReady(page, "/admin/proyectos");
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .locator("article", { has: page.getByRole("heading", { name: title }) })
      .getByRole("button", { name: "Eliminar" })
      .click();
    await page.waitForURL("**/admin/proyectos?deleted=1");
    await expect(page.getByRole("heading", { name: title })).toHaveCount(0);

    // 6) ya no aparece en la portada
    await appReady(page, "/");
    await expect(page.getByText(title)).toHaveCount(0);

    // 7) la auditoría registró el alta y la baja
    await appReady(page, "/admin/auditoria");
    await expect(page.getByText("creó").first()).toBeVisible();
    await expect(page.getByText("eliminó").first()).toBeVisible();
  });

  test("editar un proyecto existente actualiza el portafolio público", async ({ page }) => {
    await login(page);
    await appReady(page, "/admin/proyectos");

    const sembrado = "Optimización del circuito de flotación colectiva";
    const card = page.locator("article", { hasText: sembrado });
    await card.getByText("Editar", { exact: true }).click();

    const form = card
      .locator("form")
      .filter({ has: page.getByRole("button", { name: "Guardar cambios" }) });
    await form.locator('input[name="year"]').fill("2031");
    await form.getByRole("button", { name: "Guardar cambios" }).click();
    await page.waitForURL("**/admin/proyectos?saved=1");

    // el panel refleja el cambio…
    await expect(page.locator("article", { hasText: sembrado }).getByText("2031")).toBeVisible();

    // …y también el portafolio público
    await appReady(page, "/proyectos");
    await expect(page.getByText("2031").first()).toBeVisible();
  });
});
