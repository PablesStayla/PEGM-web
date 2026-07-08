# 📦 Estándar de Packages - PranaKaia Monorepo

**Versión**: 1.0.0  
**Estado**: Production Grade (S+ Superior)  
**Owner**: @engineering-team

---

## 🎯 Visión

Todos los packages en el monorepo PranaKaia deben seguir el **Estándar de Oro de la Industria**, alineado con las mejores prácticas de empresas como Stripe, Netflix, Google y Meta.

### Principios Rectores

1. **Type Safety Extremo**: Cero `any`, exports tipados, validación con `attw`
2. **Dual Module**: ESM + CJS para compatibilidad universal
3. **Tree-Shaking**: `sideEffects: false` para optimización de bundles
4. **Documentation First**: README, CHANGELOG, typedoc
5. **Validation Automated**: CI/CD valida estructura antes de merge

---

## 📋 Checklist de Creación de Package

### Estructura Mínima Requerida

```
packages/my-package/
├── src/
│   ├── index.ts              # Barrel export principal
│   ├── *.ts                  # Módulos exports
│   └── __tests__/            # Tests (no publicados)
├── dist/                     # Build output (generado)
├── package.json              # Con exports map completo
├── tsconfig.json             # Extiende @pranakaia/config
├── tsup.config.ts            # Build configuration
├── README.md                 # Documentación de API
├── CHANGELOG.md              # Historial de versiones
└── vitest.config.ts          # Si aplica (tests)
```

### package.json Obligatorio

```json
{
  "name": "@pranakaia/my-package",
  "version": "1.0.0",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "attw": "attw --pack .",
    "publint": "publint",
    "typedoc": "typedoc --options ../../typedoc.json src/index.ts"
  },
  "files": [
    "dist",
    "src",
    "!**/*.test.*",
    "!**/__tests__/**"
  ],
  "publishConfig": {
    "access": "restricted"
  }
}
```

### tsup.config.ts Estándar

```typescript
import { defineConfig } from 'tsup'

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
})
```

---

## 🧪 Validación en CI

### Pipeline Automático

Cada push/PR a `main` o `develop` ejecuta:

1. **pnpm packages:validate** - Valida estructura de package.json
2. **pnpm packages:attw** - Valida types exports (Are The Types Wrong)
3. **pnpm packages:publint** - Lint de package.json
4. **pnpm knip** - Dead code detection

### Comandos Root Disponibles

```bash
# Validar todos los packages
pnpm packages:validate

# Ejecutar attw en todos los packages
pnpm packages:attw

# Ejecutar publint en todos los packages
pnpm packages:publint

# Dead code detection
pnpm knip

# Generar documentación API
pnpm docs:typedoc
```

---

## 📚 Documentación

### README.md Template

Cada package DEBE tener:

```markdown
# @pranakaia/package-name

**Description** — Breve descripción del propósito.

## Instalación

```bash
pnpm add @pranakaia/package-name
```

## Uso

```typescript
import { MainClass } from '@pranakaia/package-name'
```

## Exports

| Export | Descripción |
|--------|-------------|
| `@pranakaia/package-name` | Barrel export principal |
| `@pranakaia/package-name/subpath` | Subpath exports |

## Development

```bash
pnpm build
pnpm type-check
pnpm test
pnpm test:coverage
pnpm lint
pnpm attw
pnpm publint
```

## License

MIT © PranaKaia
```

### CHANGELOG.md Template

Basado en [Keep a Changelog](https://keepachangelog.com/):

```markdown
# Changelog

## [1.0.0] - 2026-05-04

### Added
- Initial release
- Feature A
- Feature B

### Changed
- Breaking change description

### Fixed
- Bug fix description
```

---

## 🔍 Exports Map - Patrones

### Pattern 1: Simple Package

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  }
}
```

### Pattern 2: Multi-Entry Package

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./entities": {
      "types": "./dist/entities/index.d.ts",
      "import": "./dist/entities/index.mjs",
      "require": "./dist/entities/index.js"
    },
    "./events": {
      "types": "./dist/events/index.d.ts",
      "import": "./dist/events/index.mjs",
      "require": "./dist/events/index.js"
    }
  }
}
```

### Pattern 3: Bounded Context (DDD)

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./entities": "./src/entities/index.ts",
    "./value-objects": "./src/value-objects/index.ts",
    "./ports": "./src/ports/index.ts",
    "./events": "./src/events/index.ts"
  }
}
```

---

## 🚫 Anti-Patrones Prohibidos

### ❌ MAL: Sin exports map

```json
{
  "main": "src/index.ts",
  "types": "src/index.d.ts"
}
```

### ✅ BIEN: Exports completo

```json
{
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  }
}
```

### ❌ MAL: Sin sideEffects

```json
{
  "name": "@pranakaia/pkg"
}
```

### ✅ BIEN: Tree-shaking habilitado

```json
{
  "name": "@pranakaia/pkg",
  "sideEffects": false
}
```

### ❌ MAL: exports incompleto

```json
{
  "exports": {
    ".": "./src/index.ts"
  }
}
```

### ✅ BIEN: exports con todos los entry points

```json
{
  "exports": {
    ".": { /* ... */ },
    "./entities": { /* ... */ },
    "./events": { /* ... */ }
  }
}
```

---

## 📊 Métricas de Calidad

| Métrica | Target | Hard Limit |
|---------|--------|------------|
| Test Coverage | 95%+ | 90% |
| attw Status | ✅ Pass | ❌ Fail bloquea merge |
| publint Status | ✅ Pass | ❌ Fail bloquea merge |
| knip Issues | 0 | 0 tolerancia |
| Type Errors | 0 | 0 tolerancia |

---

## 🛠️ Herramientas

### Desarrollo

- **tsup**: Build system (ESM + CJS)
- **vitest**: Testing framework
- **biome**: Linting & formatting
- **typedoc**: Documentación API

### Validación

- **attw**: Are The Types Wrong (exports validation)
- **publint**: package.json linting
- **knip**: Dead code detection

### Release

- **release-it**: Automated releases
- **conventional-changelog**: CHANGELOG automation

---

## 📖 Referencias

- [Node.js Package Guide](https://nodejs.org/api/packages.html)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Are The Types Wrong?](https://arethetypeswrong.github.io/)
- [Publint](https://publint.dev/)
- [Knip](https://knip.dev/)
- [tsup](https://tsup.egoist.dev/)

---

## 🔄 Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2026-05-04 | Initial standard release |

---

> **Absolute Zero Principle**: *"Un package sin exports validados es código roto por diseño. La excelencia no es negociable."*
