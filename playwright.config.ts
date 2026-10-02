import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas E2E con Playwright.
 *
 * El servidor de pruebas corre en el puerto 3100 con una base de datos
 * SQLite aislada (data/e2e.db) que se siembra sola en el primer arranque.
 *
 * Nota para entornos sin acceso al CDN de Playwright (p. ej. sandboxes):
 * definir PLAYWRIGHT_CHROMIUM_EXECUTABLE con la ruta de un Chromium
 * compatible (misma versión que `npx playwright install chromium`).
 */

const PORT = 3100;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // 2 workers: en dev, ráfagas mayores compilan rutas a mitad de test y vuelven
  // inestables las navegaciones RSC del panel
  workers: 2,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    ...(executablePath
      ? {
          launchOptions: {
            executablePath,
            args: ["--no-sandbox", "--disable-dev-shm-usage"],
          },
        }
      : {}),
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  globalSetup: "./tests/e2e/global-setup.ts",

  webServer: {
    // se limpia la base de pruebas ANTES de arrancar el servidor: si se borra
    // después (p. ej. en globalSetup), el health-check de Playwright puede ganar
    // la carrera e inicializar la BD con una conexión abierta que quedaría
    // apuntando a un archivo eliminado (inode fantasma)
    command: `rm -f data/e2e.db data/e2e.db-wal data/e2e.db-shm && TURSO_DATABASE_URL=file:./data/e2e.db npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    // ver los errores del servidor en la salida de la suite (diagnóstico)
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120_000,
  },
});
