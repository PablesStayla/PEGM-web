import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', '**/*.test.ts', '**/__tests__/**'],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@pranakaia/shared-kernel': path.resolve(__dirname, '../shared-kernel/src'),
      '@pranakaia/catalog': path.resolve(__dirname, '../catalog/src'),
      '@pranakaia/checkout': path.resolve(__dirname, '../checkout/src'),
      '@pranakaia/logistics': path.resolve(__dirname, '../logistics/src'),
      '@pranakaia/cart': path.resolve(__dirname, '../cart/src'),
      '@pranakaia/pricing': path.resolve(__dirname, '../pricing/src'),
      '@pranakaia/inventory': path.resolve(__dirname, '../inventory/src'),
      '@pranakaia/payments': path.resolve(__dirname, '../payments/src'),
    },
  },
});
