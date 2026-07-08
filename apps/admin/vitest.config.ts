import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: resolve(__dirname, '.'),
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['node_modules', 'dist', '.next', 'coverage'],
    server: {
      deps: {
        inline: ['@pranakaia/infrastructure'],
        external: ['server-only'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.d.ts', 'src/lib/env.ts', 'src/middleware.ts'],
      thresholds: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@pranakaia/ui': resolve(__dirname, '../../packages/ui/src'),
      '@pranakaia/infrastructure': resolve(__dirname, '../../packages/infrastructure/src'),
      '@pranakaia/shared-kernel': resolve(__dirname, '../../packages/shared-kernel/src'),
    },
  },
  server: {
    fs: {
      allow: ['../..'],
    },
  },
});
