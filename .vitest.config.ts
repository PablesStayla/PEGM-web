/**
 * =============================================================================
 * 🧪 PRANAKAIA E-COMMERCE - STRATEGIC TEST ENGINE (VITEST)
 * =============================================================================
 * Role: Quality Assurance & Logic Verification
 * Tier: Absolute Zero (S+)
 * Compliance: SOTA Engineering Standards
 * Last Updated: 2026-05-05
 * =============================================================================
 */

import path from 'node:path';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    name: '🧪 PranaKaia-Test-Engine',
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '.next', '.turbo', 'coverage'],

    // Co-located tests: each package runs its own tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      include: ['packages/*/src/**/*.ts'],
      exclude: [
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/index.ts',
        '**/__tests__/**',
        '**/types/**',
        '**/*.config.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@pranakaia/shared-kernel': path.resolve(__dirname, './packages/shared-kernel/src'),
      '@pranakaia/application': path.resolve(__dirname, './packages/application/src'),
      '@pranakaia/infrastructure': path.resolve(__dirname, './packages/infrastructure/src'),
      '@pranakaia/identity': path.resolve(__dirname, './packages/identity/src'),
      '@pranakaia/catalog': path.resolve(__dirname, './packages/catalog/src'),
      '@pranakaia/inventory': path.resolve(__dirname, './packages/inventory/src'),
      '@pranakaia/pricing': path.resolve(__dirname, './packages/pricing/src'),
      '@pranakaia/supplier': path.resolve(__dirname, './packages/supplier/src'),
      '@pranakaia/cart': path.resolve(__dirname, './packages/cart/src'),
      '@pranakaia/checkout': path.resolve(__dirname, './packages/checkout/src'),
      '@pranakaia/payments': path.resolve(__dirname, './packages/payments/src'),
      '@pranakaia/shipping': path.resolve(__dirname, './packages/shipping/src'),
      '@pranakaia/logistics': path.resolve(__dirname, './packages/logistics/src'),
      '@pranakaia/communications': path.resolve(__dirname, './packages/communications/src'),
      '@pranakaia/ui': path.resolve(__dirname, './packages/ui/src'),
      '@pranakaia/testkit': path.resolve(__dirname, './packages/testkit/src'),
    },
  },
});
