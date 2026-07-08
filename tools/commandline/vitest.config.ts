import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const workspaceRoot = resolve(__dirname, '..');

export default defineConfig({
  root: workspaceRoot,
  test: {
    environment: 'node',
    globals: true,
    include: ['scripts/notion/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
});
