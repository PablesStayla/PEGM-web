# Changelog

All notable changes to `@pranakaia/shared-kernel` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-05-04

### Added
- Enterprise-grade build system with `tsup` (ESM + CJS)
- TypeScript declaration files (`.d.ts`)
- Tree-shaking support (`sideEffects: false`)
- Full exports map for all entry points
- `vitest` configuration for unit testing
- Coverage thresholds (95% minimum)
- `attw` (Are The Types Wrong) validation
- `publint` for package.json validation
- `typedoc` documentation generation

### Changed
- **Breaking**: Changed build output from `src/` to `dist/`
- **Breaking**: Updated all exports to use compiled output
- Improved type safety with stricter TypeScript configuration

### Fixed
- Missing type definitions in exports
- Incomplete barrel exports

## [1.0.0] - 2026-04-01

### Added
- Initial release
- Result pattern implementation
- Branded types for type safety
- Entity and Value Object base classes
- Domain events system
- Application layer (UseCase, Command, Query)
