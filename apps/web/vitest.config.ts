/**
 * Vitest configuration for apps/web
 *
 * Runs unit tests, integration tests and authorization tests.
 * E2E (Playwright) and load (k6) tests are excluded — they run separately.
 */

import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],

  test: {
    environment: 'jsdom',
    globals: true,

    include: [
      // App-level unit + integration tests
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      // Monorepo-level integration tests
      '../../tests/integration/**/*.{test,spec}.{js,ts,jsx,tsx}',
      '../../tests/security/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],

    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage',
      'playwright-report',
      'test-results',
      '**/*.stories.{js,ts,jsx,tsx}',
      '**/.storybook/**',
      // Playwright / load / smoke tests run in dedicated jobs
      'tests/e2e/**/*',
      '../../tests/e2e/**/*',
      '../../tests/smoke/**/*',
      '../../tests/load/**/*',
      '../../tests/performance/**/*',
    ],

    // ── Coverage ──────────────────────────────────────────────────────────────
    coverage: {
      provider: 'v8',
      reporters: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'src/**/*.stories.{js,ts,jsx,tsx}',
        'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'src/**/__tests__/**',
        'src/**/__mocks__/**',
        'src/**/__fixtures__/**',
        'src/**/types/**',
        'src/**/config/**',
        'src/**/mocks/**',
        'src/**/generated/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },

    // ── Reporters ─────────────────────────────────────────────────────────────
    reporters: ['verbose'],
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/results.html',
    },

    // ── Performance ───────────────────────────────────────────────────────────
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },

    // ── Behaviour ─────────────────────────────────────────────────────────────
    testTimeout: 10_000, // 10s per test (unit tests should be fast)
    hookTimeout: 15_000, // 15s for beforeAll/afterAll hooks
    isolate: true,
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    // passWithNoTests intentionally omitted — a suite with zero tests should fail CI

    // ── Setup ─────────────────────────────────────────────────────────────────
    setupFiles: ['./vitest.setup.ts'],
  },

  // ── Module resolution (mirrors tsconfig paths) ────────────────────────────
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/types': resolve(__dirname, './src/types'),
      '@/config': resolve(__dirname, './src/config'),
      '@/store': resolve(__dirname, './src/store'),
      '@/context': resolve(__dirname, './src/context'),
      '@/providers': resolve(__dirname, './src/providers'),
      '@/shared': resolve(__dirname, './src/shared'),
      '@/modules': resolve(__dirname, './src/modules'),
      '@/middleware': resolve(__dirname, './src/middleware'),
      '@/mocks': resolve(__dirname, './src/mocks'),
      '@/emails': resolve(__dirname, './src/emails'),
      '@/app': resolve(__dirname, './src/app'),
      '@/actions': resolve(__dirname, './src/app/actions'),
      '@/infrastructure': resolve(__dirname, './src/infrastructure'),
    },
  },

  define: {
    'import.meta.env.VITEST': 'true',
  },
});
