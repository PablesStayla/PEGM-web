import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { appReady } from "./helpers";

const pages = [
  ["portada", "/"],
  ["CV", "/cv"],
  ["índice de casos", "/proyectos"],
  ["caso de estudio", "/proyectos/optimizacion-circuito-flotacion-colectiva"],
  ["laboratorio", "/laboratorio"],
  ["privacidad", "/privacidad"],
  ["login", "/admin/login"],
] as const;

for (const [name, path] of pages) {
  test(`${name} no presenta infracciones WCAG A/AA detectables`, async ({ page }) => {
    await appReady(page, path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}
