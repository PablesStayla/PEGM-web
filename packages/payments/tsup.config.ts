import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/ports/index.ts'],
  format: ['esm', 'cjs'],
  dts: { resolve: true },
  splitting: false,
  treeshake: true,
  minify: false,
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  cjsInterop: false,
  external: ['@pranakaia/shared-kernel', '@pranakaia/catalog'],
  esbuildOptions(options) {
    if (options.format === 'cjs') {
      options.outExtension = { '.js': '.cjs' };
    }
  },
});
