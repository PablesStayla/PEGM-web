import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/entities/index.ts', 'src/services/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
  },
  splitting: false,
  treeshake: true,
  minify: false,
  clean: true,
  sourcemap: true,
  outDir: 'dist',
});
