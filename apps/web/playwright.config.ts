/**
 * Playwright Configuration for E-Commerce Enterprise
 *
 * Comprehensive E2E testing configuration with:
 * - Cross-browser testing
 * - Mobile testing
 * - Internationalization testing
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './e2e',

  // Test timeout
  timeout: 60 * 1000,

  // Expect timeout
  expect: {
    timeout: 10 * 1000,
  },

  // Test failure retry
  retries: process.env.CI ? 2 : 1,

  // Workers
  workers: process.env.CI ? 1 : 4,

  // Reporter
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ['line'],
  ],

  // Web server
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 300 * 1000,
  },

  // Output directory
  outputDir: 'test-results/',

  // Global setup
  // globalSetup: require.resolve('./e2e/global-setup.ts'),

  // Global teardown
  // globalTeardown: require.resolve('./e2e/global-teardown.ts'),

  // Use
  use: {
    // Base URL
    baseURL: 'http://localhost:3000',

    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Screenshot options
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Timeout
    actionTimeout: 0,
    navigationTimeout: 0,

    // Locale
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },

  // Projects for different browsers
  projects: [
    // Desktop Chrome
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Desktop Firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    // Desktop Safari
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile Chrome
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    // Mobile Safari
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
