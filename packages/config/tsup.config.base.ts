import { defineConfig } from 'tsup';

export const baseConfig = defineConfig({
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  treeshake: true,
  minify: false,
  clean: true,
  sourcemap: true,
  outDir: 'dist',
});

export default baseConfig;
