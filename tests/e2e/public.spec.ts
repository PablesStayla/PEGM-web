import { expect, test } from "@playwright/test";
import { appReady } from "./helpers";

test.describe("Sitio público", () => {
  test("la portada muestra identidad, secciones y contacto", async ({ page }) => {
    await appReady(page, "/");
    // el h1 es "Pablo" + punto en acento: usar regex para el nombre accesible
    await expect(page.getByRole("heading", { level: 1, name: /Pablo/ })).toBeVisible();
    await expect(page.getByText(/Ingeniero Civil Metalúrgico/).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Laboratorio digital/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /al proyecto/ })).toBeVisible();
  });

  test("el CV muestra experiencia y formación", async ({ page }) => {
    await appReady(page, "/cv");
    await expect(page.getByRole("heading", { level: 1, name: "CV." })).toBeVisible();
    await expect(page.getByText("Experiencia", { exact: true })).toBeVisible();
    await expect(page.getByText("Educación", { exact: true })).toBeVisible();
  });

  test("el portafolio lista los proyectos sembrados", async ({ page }) => {
    await appReady(page, "/proyectos");
    await expect(page.getByRole("heading", { level: 1, name: "Proyectos." })).toBeVisible();
    await expect(page.getByText("Mojabilidad e infiltración en minerales oxidados")).toBeVisible();
  });

  test("el laboratorio renderiza las cuatro herramientas", async ({ page }) => {
    await appReady(page, "/laboratorio");
    await expect(page.getByRole("heading", { name: "Cinética de flotación" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fórmula de dos productos" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Diagrama Eh-pH del cobre" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Planta en vivo" })).toBeVisible();
  });

  test("el modo oscuro conmuta y persiste", async ({ page }) => {
    await appReady(page, "/");
    const esDark = () => page.evaluate(() => document.documentElement.classList.contains("dark"));

    // el tema inicial depende de prefers-color-scheme: probar el CAMBIO, no un valor fijo
    const inicialOscuro = await esDark();
    const esperado = inicialOscuro ? "light" : "dark";

    await page.getByRole("button", { name: "Cambiar entre tema claro y oscuro" }).click();
    await expect.poll(esDark).toBe(esperado === "dark");
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(esperado);

    // persiste tras recargar (script inline en <head> lo restaura)
    await page.reload();
    await expect.poll(esDark).toBe(esperado === "dark");
  });

  test("la paleta de comandos (Ctrl+K) busca y navega", async ({ page }) => {
    await appReady(page, "/");
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog", { name: "Buscador del sitio" })).toBeVisible();
    await page.keyboard.type("cv");
    await page.keyboard.press("Enter");
    await page.waitForURL("**/cv");
  });
});

test.describe("Laboratorio interactivo", () => {
  test("flotación: mover el slider de R∞ actualiza el gráfico y las lecturas", async ({ page }) => {
    await appReady(page, "/laboratorio#flotacion");
    await page
      .locator('input[type="range"]')
      .first()
      .evaluate((el: HTMLInputElement) => {
        // setter nativo para bypasear el value-tracker de React
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        setter?.call(el, "70");
        el.dispatchEvent(new Event("input", { bubbles: true }));
      });
    // etiqueta de la asíntota en el SVG y lectura junto al control
    await expect(page.getByText("R∞ = 70 %")).toBeVisible();
    await expect(page.getByText("70 %", { exact: true })).toBeVisible();
  });

  test("balance de masa: rechaza leyes incoherentes y calcula con leyes válidas", async ({
    page,
  }) => {
    await appReady(page, "/laboratorio#balance");
    // los únicos input[type=number] de la página son f, c, t (en ese orden)
    const leyConcentrado = page.locator('input[type="number"] >> nth=1');

    // caso inválido: concentrado (0,5) más pobre que la alimentación (0,8)
    await leyConcentrado.fill("0.5");
    await expect(page.getByText(/c > f > t/)).toBeVisible();

    // caso válido: recupera el escenario por defecto (R = 85,4 %, pull = 2,4 %)
    await leyConcentrado.fill("28");
    await expect(page.getByText("85.4 %", { exact: true })).toBeVisible();
    await expect(page.getByText("2.4 %", { exact: true })).toBeVisible();
  });

  test("pourbaix: región dominante y líneas de estabilidad del agua", async ({ page }) => {
    await appReady(page, "/laboratorio#pourbaix");
    const svg = page.getByRole("img", { name: "Diagrama Eh-pH del sistema cobre-agua" });
    await expect(svg).toBeVisible();
    // cuatro regiones: Cu, Cu²⁺, Cu₂O y CuO
    await expect(svg.locator("polygon")).toHaveCount(4);
    await expect(svg.getByText("Cu₂O")).toBeVisible();
    await expect(svg.getByText("O₂/H₂O")).toBeVisible();
    await expect(svg.getByText("H₂O/H₂")).toBeVisible();
  });

  test("planta en vivo: pausa y reanuda la transmisión", async ({ page }) => {
    await appReady(page, "/laboratorio#planta");
    await expect(page.getByText("Transmitiendo")).toBeVisible();
    await page.getByRole("button", { name: "Pausar" }).click();
    await expect(page.getByText("En pausa")).toBeVisible();
    await page.getByRole("button", { name: "Reanudar" }).click();
    await expect(page.getByText("Transmitiendo")).toBeVisible();
  });
});
