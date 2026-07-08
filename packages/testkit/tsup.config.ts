import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  treeshake: true,
  minify: false,
  clean: true,
  sourcemap: true,
  outDir: 'dist',
});
