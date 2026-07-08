# Changelog

## [1.0.0] - 2026-05-04

### Added
- Enterprise-grade build system with `tsup` (ESM + CJS)
- TypeScript declaration files (`.d.ts`)
- Tree-shaking support (`sideEffects: false`)
- Full exports map for all infrastructure modules
- `vitest` configuration for unit testing
- Coverage thresholds (90% minimum)
- `attw` (Are The Types Wrong) validation
- `publint` for package.json validation

### Changed
- **Breaking**: Changed build output from `src/` to `dist/`
- **Breaking**: Updated all exports to use compiled output
