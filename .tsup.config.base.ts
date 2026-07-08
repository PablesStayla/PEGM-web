import { defineConfig } from 'tsup';

/**
 * Shared tsup configuration for PranaKaia monorepo packages
 *
 * Usage in package tsup.config.ts:
 * ```ts
 * import sharedConfig from '../../tsup.config.base'
 *
 * export default defineConfig({
 *   ...sharedConfig,
 *   entry: ['src/index.ts'],
 * })
 * ```
 */

export default defineConfig({
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  treeshake: true,
  minify: false,
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  // Performance optimizations
  target: 'es2022',
  // External dependencies
  external: [],
  // No banner needed for our use case
});
