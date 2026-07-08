import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@pranakaia/shared-kernel': path.resolve(__dirname, '../shared-kernel/src'),
      '@pranakaia/catalog': path.resolve(__dirname, '../catalog/src'),
      '@pranakaia/db': path.resolve(__dirname, '../db/src'),
      '@pranakaia/core-building-blocks': path.resolve(__dirname, '../core-building-blocks/src'),
    },
  },
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
});
