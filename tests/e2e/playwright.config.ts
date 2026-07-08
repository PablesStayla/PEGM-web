import { defineConfig, devices } from '@playwright/test';

const WEB_BASE = process.env.WEB_BASE_URL ?? 'http://localhost:3000';
const ADMIN_BASE = process.env.ADMIN_BASE_URL ?? 'http://localhost:3001';
const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3002';
const CI = !!process.env.CI;

export default defineConfig({
  testDir: './flows',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: !CI,
  retries: CI ? 2 : 1,
  workers: CI ? 1 : 4,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: '../../test-results/e2e/results.json' }],
    ['junit', { outputFile: '../../test-results/e2e/results.xml' }],
    ['line'],
  ],

  globalSetup: require.resolve('./setup/global-setup'),
  globalTeardown: require.resolve('./setup/global-teardown'),

  use: {
    baseURL: WEB_BASE,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: 'es-CL',
    timezoneId: 'America/Santiago',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.spec\.ts/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /.*\.spec\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: /.*\.spec\.ts/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /checkout\.spec\.ts/,
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      testMatch: /checkout\.spec\.ts/,
    },
  ],

  webServer: [
    {
      command: 'pnpm dev:web',
      url: WEB_BASE,
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm dev:admin',
      url: ADMIN_BASE,
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
  ],

  outputDir: '../../test-results/e2e/',
});

export { ADMIN_BASE, API_BASE, WEB_BASE };
