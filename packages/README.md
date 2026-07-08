# Packages — Arquitectura del Monorepo

Este directorio contiene los **Bounded Contexts** y **Shared Libraries** del ecosistema PranaKaia.

## Estructura

```
packages/
├── config/                 # Configuraciones base (TypeScript, ESLint, etc.)
├── shared-kernel/          # Núcleo DDD compartido
├── application/            # Capa de aplicación (Use Cases)
├── domain/                 # Capa de dominio (Entidades, Value Objects)
├── infrastructure/         # Infraestructura (Repositories, Services)
│
├── cart/                   # Bounded Context: Carrito
├── catalog/                # Bounded Context: Catálogo
├── checkout/               # Bounded Context: Checkout
├── inventory/              # Bounded Context: Inventario
├── pricing/                # Bounded Context: Precios
├── payments/               # Bounded Context: Pagos
├── shipping/               # Bounded Context: Envíos
├── supplier/               # Bounded Context: Proveedores
├── logistics/              # Bounded Context: Logística
├── communications/         # Bounded Context: Comunicaciones
├── identity/               # Bounded Context: Identidad
│
├── ui/                     # Design System (Componentes React)
└── testkit/                # Utilidades de testing
```

## Estándares de Calidad

### 1. Package Structure

Cada package DEBE tener:

```
package-name/
├── src/
│   ├── index.ts           # Barrel export
│   ├── entities/          # Entidades del dominio
│   ├── value-objects/     # Value Objects
│   ├── events/            # Domain Events
│   └── ports/             # Interfaces (Repository, Service)
├── package.json           # Con exports configurado
├── tsconfig.json          # Extiende config base
├── tsup.config.ts         # Build config
├── vitest.config.ts       # Test config
├── README.md              # Documentación
└── CHANGELOG.md           # Historial de cambios
```

### 2. Package.json Exports

```json
{
  "name": "@pranakaia/cart",
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
    }
  }
}
```

### 3. TypeScript Configuration

Extiende de `@pranakaia/config`:

```json
{
  "extends": "../config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### 4. Build Pipeline

Cada package se builda con **tsup**:
- Output: ESM + CJS
- DTS: Generación de tipos
- Tree-shaking: Habilitado
- Sourcemaps: Incluidos

## Comandos Disponibles

```bash
# Build de todos los packages
pnpm turbo build --filter='@pranakaia/*'

# Type check
pnpm turbo type-check --filter='@pranakaia/*'

# Tests
pnpm turbo test --filter='@pranakaia/*'

# Validar exports
pnpm packages:exports:validate

# Validar types (attw)
pnpm packages:attw

# Validar estructura (publint)
pnpm packages:publint

# Bundle size check
pnpm packages:size
```

## Dependencias entre Packages

```
shared-kernel ← Todos los packages
    ↓
domain ← application
    ↓
infrastructure
    ↓
apps (web, admin, api)
```

### Reglas

1. **Domain no depende de Infrastructure**
2. **Application solo depende de Domain**
3. **Infrastructure depende de Domain + Application**
4. **UI solo exporta componentes React**
5. **Testkit es devDependency de todos**

## Publicación

Los packages se publican automáticamente vía **Changesets**:

1. Crear changeset: `pnpm changeset`
2. Committear el changeset
3. Al merge a main, CI crea PR de versión
4. Al mergeear, se publica en npm

## Métricas

| Métrica | Target | Estado |
|---------|--------|--------|
| Test Coverage | 100% | ✅ |
| Type Safety | Strict | ✅ |
| Bundle Size | Ver .size-limit.json | ✅ |
| Exports Valid | 100% | ✅ |

## Herramientas de Validación

- **@arethetypeswrong/cli**: Valida exports de tipos
- **publint**: Valida estructura de package.json
- **size-limit**: Controla bundle size
- **knip**: Detecta código muerto
- **dependency-cruiser**: Valida arquitectura

## Agregar Nuevo Package

```bash
# 1. Crear estructura
mkdir packages/new-package
cd packages/new-package

# 2. Inicializar package.json
pnpm init
# Editar: name, version, exports, scripts

# 3. Agregar configs
cp ../config/tsconfig.base.json .
cp ../cart/tsup.config.ts .
cp ../cart/vitest.config.ts .

# 4. Agregar al workspace
# pnpm-workspace.yaml ya incluye packages/*

# 5. Crear estructura base
mkdir -p src src/entities src/ports src/events

# 6. Agregar barrel export
echo 'export * from "./entities"' > src/index.ts

# 7. Validar
pnpm build
pnpm type-check
pnpm test
pnpm attw
pnpm publint
```

## Documentación

Cada package debe tener:
- README.md con ejemplos de uso
- CHANGELOG.md (generado por changesets)
- TSDoc comments en exports públicos

## Seguridad

- **NPM Token**: Requiere 2FA
- **Access**: `restricted` (solo org)
- **Scope**: `@pranakaia/*`

## Referencias

- [Package Design](../../docs/architecture/package-design.md)
- [Bounded Contexts](../../docs/domain/bounded-contexts.md)
- [Changesets Guide](../../.changeset/README.md)
