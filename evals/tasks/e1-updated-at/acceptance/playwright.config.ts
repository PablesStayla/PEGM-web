import { defineConfig, devices } from "@playwright/test";

// Config de aceptación autocontenida: vive dentro del clon evaluado y no
// depende de la config E2E del repo (puerto y BD propios).
const PUERTO = Number(process.env.ACEPTACION_PORT ?? 3200);
const ejecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

export default defineConfig({
  testDir: ".",
  testMatch: ["e1.spec.ts"],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 300_000,
  expect: { timeout: 20_000 },
  reporter: [["list"]],
  globalSetup: "./global-setup.ts",
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    trace: "off",
    screenshot: "only-on-failure",
    // Mismo criterio que el repo: en Windows, canal msedge (Playwright local);
    // en entornos sin CDN, binario provisto por variable de entorno.
    ...(process.platform === "win32" && !ejecutable ? { channel: "msedge" } : {}),
    ...(ejecutable
      ? { launchOptions: { executablePath: ejecutable, args: ["--no-sandbox", "--disable-dev-shm-usage"] } }
      : {}),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `node start-server.mjs ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 240_000,
  },
});
