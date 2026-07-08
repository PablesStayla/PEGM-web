# @pranakaia/domain

**Domain Types Aggregator** - Meta-package que re-exporta todos los tipos de dominio de los bounded contexts del monorepo.

## 🎯 Propósito

Proporcionar un único punto de importación para todos los tipos de dominio, facilitando:
- **Single Source of Truth**: Todos los tipos en un solo lugar
- **Desacoplamiento**: Los packages de infraestructura no dependen de implementaciones específicas
- **Reusabilidad**: Mismos tipos en `web`, `admin`, `api`, `workers`
- **Versionado Semántico**: Cambios de dominio = nueva versión

## 📦 Instalación

```bash
pnpm add @pranakaia/domain
```

## 🚀 Uso

### Importación General

```typescript
import { User, Cart, Product, Money } from '@pranakaia/domain';
```

### Importación Específica por Sub-path

```typescript
// Auth types
import type { UserId, User, UserRole } from '@pranakaia/domain/auth';

// Cart types
import type { Cart, CartId, CartItem } from '@pranakaia/domain/cart';

// Catalog types
import type { Product, ProductId, SKU } from '@pranakaia/domain/catalog';
```

### Importación de Tipos Puros

```typescript
import type { 
  User, 
  UserId, 
  Cart, 
  CartId,
  Product,
  Money 
} from '@pranakaia/domain';
```

## 📊 Tipos Exportados

### Desde `@pranakaia/identity`
- **User**: `User`, `UserId`, `UserRole`, `CreateUserProps`
- **Session**: `Session`, `SessionId`, `SessionRepositoryPort`
- **Events**: `UserCreated`, `UserSignedIn`, `UserSignedOut`, etc.
- **Value Objects**: `Email`, `TwoFactorEnabled`, `TwoFactorDisabled`
- **Ports**: `UserRepositoryPort`, `AuthenticatorPort`, `RateLimiter`

### Desde `@pranakaia/cart`
- **Cart**: `Cart`, `CartId`, `CartItem`, `CartItemId`
- **Events**: `CartCreated`, `CartUpdated`, `CartCleared`, etc.
- **Ports**: `CartRepositoryPort`

### Desde `@pranakaia/catalog`
- **Product**: `Product`, `ProductId`, `ProductStatus`
- **Value Objects**: `Money`, `SKU`
- **Events**: `ProductCreated`, `ProductUpdated`, `ProductDeleted`, etc.
- **Ports**: `IProductRepository`, `ProductSearchParams`

### Desde `@pranakaia/shared-kernel`
- **Core**: `Result`, `Option`, `DomainError`
- **Base**: `Entity`, `ValueObject`, `DomainEvent`, `AggregateRoot`

## 🏗️ Estructura

```
packages/domain/
├── src/
│   ├── index.ts              # Barrel exports
│   ├── auth/
│   │   └── index.ts          # Auth subpath
│   ├── cart/
│   │   └── index.ts          # Cart subpath
│   └── catalog/
│       └── index.ts          # Catalog subpath
├── package.json              # Con exports para subpaths
├── tsconfig.json
└── tsup.config.ts
```

## 🧪 Testing

```bash
# Run tests
pnpm --filter @pranakaia/domain test

# Type check
pnpm --filter @pranakaia/domain type-check

# Build
pnpm --filter @pranakaia/domain build

# Validate exports (ATTW)
pnpm --filter @pranakaia/domain attw

# Lint
pnpm --filter @pranakaia/domain lint
```

## 📝 Notas

- Este package es **solo tipos y re-exports**, no tiene lógica de negocio propia
- Los cambios en los packages subyacentes (`identity`, `cart`, `catalog`) se reflejan automáticamente
- Usar **import type** para imports de tipos para evitar bundling innecesario

## ⚠️ Consideraciones

- No importar este package en código del lado del cliente sin tree-shaking
- Para código isomórfico, importar solo los tipos específicos que se necesitan
- Los eventos de dominio se exportan como clases (valores), no como tipos

## 📄 License

MIT
