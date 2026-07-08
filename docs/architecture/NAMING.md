# NAMING.md — Convenciones Léxicas

> La arquitectura se lee en los nombres. Sin ambigüedad, sin desviaciones.

---

## 1. Screaming Architecture

Los nombres de carpetas, archivos y módulos deben **gritar** su propósito arquitectónico. No esconder el patrón.

✅ `cart/domain/product.entity.ts`
❌ `cart/domain/Product.ts`
❌ `cart/domain/entities/product.ts`

---

## 2. Carpetas y Archivos (kebab-case + sufijo de dominio)

```
catalog/
├── domain/
│   ├── product.entity.ts        # ← Entity
│   ├── product-status.vo.ts     # ← Value Object
│   └── product-repository.port.ts  # ← Puerto
├── application/
│   ├── create-product.use-case.ts   # ← Caso de uso
│   └── get-product.use-case.ts
└── infrastructure/
    └── adapters/
        └── drizzle-product.adapter.ts  # ← Adaptador
```

### Reglas

- **kebab-case** siempre para archivos y carpetas: `product-repository.port.ts`
- **Sufijo obligatorio** al final del archivo, antes de la extensión
- **Una entidad por archivo**

---

## 3. Clases y Tipos (PascalCase)

```typescript
export class Product { ... }                // Entity
export class ProductStatus { ... }          // Value Object
export class CreateProductUseCase { ... }   // Use Case
export type Brand<K, T> = ...               // Utility Type
```

---

## 4. Interfaces (sin prefijo I para dominio, I aceptable en infra)

```typescript
// ✅ Dominio — sin prefijo I
export interface ProductRepository {
  findById(id: ProductId): Result<Product, RepositoryError>;
  save(product: Product): Result<void, RepositoryError>;
}

// ✅ Infraestructura — prefijo I aceptable (claridad en implementaciones)
export interface IEmailService {
  send(email: Email): Promise<Result<void, EmailError>>;
}
```

### Regla general

- Dominio y Aplicación: **nunca prefijo I**
- Infraestructura: **prefijo I opcional** (usar cuando ayuda a distinguir de clases)

---

## 5. Métodos y Variables (camelCase con verbos precisos)

```typescript
// ✅ Verbos precisos
product.changePrice(newPrice)
order.cancel(reason)
user.activate()

// ❌ Genéricos
product.update({ price: newPrice })
order.setStatus('cancelled')
```

### Prefijos recomendados

| Verbo      | Uso                              |
|------------|----------------------------------|
| `create*`  | Factory estática (entidad/VO)    |
| `reconstitute*` | Reconstruir desde persistencia |
| `change*`  | Mutación de propiedad específica |
| `add*`     | Agregar a colección              |
| `remove*`  | Remover de colección             |
| `find*`    | Query en repositorio             |
| `save*`    | Persistir                        |

---

## 6. Booleanos (prefijos is/has/can/should)

```typescript
isActive: boolean
hasDiscount: boolean
canCheckout: boolean
shouldSync: boolean
wasDelivered: boolean
```

Nunca booleanos sin prefijo semántico: ❌ `active: boolean`

---

## 7. Eventos (tiempo pasado)

```typescript
export class OrderPlacedEvent extends DomainEvent { ... }
export class PaymentFailedEvent extends DomainEvent { ... }
export class CartAbandonedEvent extends DomainEvent { ... }
```

---

## 8. Scripts CLI (dominio:acción:contexto)

```json
{
  "scripts": {
    "db:migrate:dev": "drizzle-kit push",
    "db:migrate:prod": "drizzle-kit migrate",
    "db:seed:products": "tsx packages/db/seed/products.ts",
    "db:seed:dev": "tsx packages/db/seed/dev.ts",
    "test:unit:catalog": "vitest packages/catalog",
    "test:e2e:checkout": "playwright test --grep @checkout",
    "lint:types": "tsc --noEmit",
    "build:affected": "turbo run build --filter=...[main]"
  }
}
```

Formato: `dominio:acción:contexto` (todo kebab-case, dos puntos como separador).

---

## 9. Prohibiciones Explícitas

| Prohibido                          | Razón                                        |
|------------------------------------|----------------------------------------------|
| `any` en dominio y aplicación      | Pierde todo tipado                           |
| `index.ts` con barrel exports      | Turborepo + module resolution se confunde    |
| Archivos sin sufijo de patrón      | No se entiende su rol arquitectónico         |
| `IProductRepository` en dominio    | El prefijo I es para infraestructura         |
| Clases con más de 200 líneas       | Violación de Single Responsibility           |
| Importar infraestructura desde app | Rompe dependencia向内 (debe ir por puertos) |
| `export default`                   | Dificulta refactors y tree-shaking           |
| Nombres sin contexto (`Data`, `Info`, `Manager`) | No comunican propósito        |