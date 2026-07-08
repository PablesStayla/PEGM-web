# Estrategia de Testing — PranaKaia E-Commerce

## 1. Pirámide de Testing

| Capa | Proporción | Framework | Herramientas |
|------|-----------|-----------|--------------|
| **Unit** | 70% | Vitest 4 (colocado junto al código) | `*.test.ts`, `@fast-check/vitest` |
| **Integration** | 20% | Vitest + TestContainers | PostgreSQL real, contract testing |
| **E2E** | 10% | Playwright | Flujos críticos: checkout, auth, cart |

**ESTADO ACTUAL**: ~5% de cobertura general. Solo 9 archivos de test en todo el repositorio. Sin property-based tests, sin mutation testing activo, sin E2E.

**OBJETIVO**: 100% de cobertura declarada en las entidades del core domain y packages estratégicos para Q4 2026.

---

## 2. Unit Tests (70%)

### Ubicación
Los tests viven junto al código que prueban, con el mismo nombre y extensión `.test.ts`:

```
src/domain/value-objects/Email.ts
src/domain/value-objects/Email.test.ts

packages/cart/src/entities/Cart.ts
packages/cart/src/entities/Cart.test.ts
```

### Patrones obligatorios
- **Triple A**: Arrange → Act → Assert
- **Zero mocks en domain**: Las entidades y value objects del core domain se prueban sin mocks. Solo datos reales.
- **Mocking controlado** en use cases: Test doubles para puertos de salida (repositorios, eventos), verificar interacciones.
- **Snapshots** solo para serialización/formatos estables. No para lógica de negocio.

### Property-Based Tests (OBLIGATORIO)
Toda entidad crítica debe tener property-based tests con `@fast-check/vitest`:

```typescript
import { test, describe } from 'vitest';
import { fc } from '@fast-check/vitest';

describe('Email', () => {
  test.prop([fc.email()])('debe mantener invariante tras parse', (emailStr) => {
    const email = Email.create(emailStr);
    expect(email.getValue()).toBe(emailStr.toLowerCase());
    expect(email.isValid()).toBe(true);
  });

  test.prop([fc.string()])('debe rechazar strings no-email', (invalid) => {
    fc.pre(!invalid.includes('@'));
    const result = Email.create(invalid);
    expect(result.isErr()).toBe(true);
  });
});
```

**Entidades obligatorias para PBT**:
- `Email`, `Phone`, `RUT` (value objects)
- `Price`, `Discount`, `Tax` (cálculos financieros)
- `Cart`, `Order`, `LineItem` (invariantes de dominio)
- `Stock`, `Inventory` (reglas de consistencia)

---

## 3. Integration Tests (20%)

### Repositorios con DB real
Usar TestContainers para levantar PostgreSQL real:

```typescript
// packages/cart/src/infra/repositories/CartRepository.test.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '@prisma/client';

describe('CartRepository', () => {
  let container, prisma;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    prisma = new PrismaClient({ datasources: { db: { url: container.getConnectionUri() } } });
    await prisma.$executeRawUnsafe(/* migraciones */);
  });
});
```

### Contract Testing entre Bounded Contexts
Cada Bounded Context publica un **contrato** (Pact o interface verificable) que los consumidores testean contra un provider stub:

- `cart` → `catalog`: verificar que `ProductInfo` devuelve precio y stock
- `orders` → `cart`: verificar que `CartSnapshot` contiene los items correctos
- `orders` → `payment`: verificar que `PaymentIntent` se crea correctamente

### DB queries
- Prohibido mockear `PrismaClient` en tests de repositorios
- Usar `@testcontainers/postgresql` siempre
- `NODE_ENV=test` debe configurarse antes de cualquier import

---

## 4. E2E Tests (10%)

### Playwright — Flujos críticos

```typescript
// apps/web/e2e/checkout.spec.ts
test('usuario completa checkout exitoso', async ({ page }) => {
  await page.goto('/products');
  await page.click('[data-testid="add-to-cart-1"]');
  await page.click('[data-testid="cart-link"]');
  await page.click('[data-testid="checkout-btn"]');
  // ...flujo completo
  await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
});
```

### Flujos obligatorios
1. **Checkout**: producto → carrito → dirección → pago → confirmación
2. **Auth**: registro → verificación email → login → logout → session expiry
3. **Cart**: agregar → modificar cantidad → eliminar → persistencia tras login
4. **Búsqueda**: búsqueda → filtros → facetas → paginación

### Anti-patterns E2E
- ❌ No usar selectores frágiles (`div > span > button`)
- ✅ Usar `data-testid` o `getByRole`
- ❌ No compartir estado entre tests
- ✅ Cada test es independiente (setup/teardown)

---

## 5. Mutation Testing

Usar **Stryker** — la configuración ya existe en `config/stryker.critical.config.ts`.

```bash
npx stryker run config/stryker.critical.config.ts
```

**ESTADO ACTUAL**: Configuración existente, pero no se ejecuta en CI. Tasa de mutación desconocida.

**OBJETIVO**: Score mínimo 80% en core domain, 70% en packages estratégicos.

### Thresholds por capa
| Capa | Mutation Score Objetivo | Prioridad |
|------|------------------------|-----------|
| core-domain | ≥ 85% | Crítica |
| packages/cart | ≥ 80% | Alta |
| packages/catalog | ≥ 70% | Media |
| apps/web | ≥ 60% | Baja |

---

## 6. Coverage Targets

| Módulo | Cobertura Actual | Objetivo Q3 2026 | Objetivo Final |
|--------|-----------------|------------------|----------------|
| core-domain | ~0% | 90% | 100% |
| packages/cart | ~0% | 75% | 95% |
| packages/catalog | ~0% | 60% | 90% |
| apps/web (actions) | ~5% | 50% | 80% |
| apps/api | ~0% | 70% | 95% |

---

## 7. Roadmap de Implementación

### Fase 1: Core Domain (Semanas 1-3)
- Unit tests para todos los value objects del dominio
- Property-based tests para entidades financieras (Price, Tax, Discount)
- Mutation testing en core-domain hasta 85%

### Fase 2: packages/cart (Semanas 4-6)
- Unit tests para entidades Cart, LineItem, CartService
- Integration tests para CartRepository con TestContainers
- Contract testing con orders y catalog

### Fase 3: packages/catalog (Semanas 7-9)
- Unit tests para entidades Product, Category, Stock
- Integration tests para búsqueda y filtros
- Property-based tests para reglas de inventario

### Fase 4: apps/web actions (Semanas 10-12)
- Tests para server actions y API routes
- E2E Playwright para checkout y auth
- Mutation testing en web actions

---

## 8. Anti-patterns Prohibidos

| Anti-patrón | Por qué | Alternativa |
|-------------|---------|-------------|
| Testear implementation details | Tests frágiles que se rompen con refactors | Testear comportamiento observable |
| Selectores CSS frágiles en E2E | Se rompen con cambios de estilo | `data-testid` o `getByRole` |
| Tests interdependientes | Orden de ejecución importa, falsos negativos | Cada test es independiente |
| Mocks excesivos | Tests que pasan pero el sistema falla | Preferir stubs simples o datos reales |
| Snapshot gigantes | Nadie revisa el diff, se aprueban ciegamente | Snapshot solo para serialización estable |
| `describe` anidados > 3 niveles | Tests difíciles de leer y mantener | Aplanar estructura de describe |

---

## 9. Ejecución en CI

```bash
# CI pipeline
pnpm test:unit          # Unit tests (rápido, ~2 min)
pnpm test:integration   # Integration tests (~5 min)
pnpm test:e2e           # E2E Playwright (~10 min)
pnpm test:mutation      # Mutation solo en core-domain (~15 min)
pnpm test:coverage      # Reporte de cobertura global
```

Todos los stages deben pasar para merge a `main`. Mutation testing es blocking solo para archivos modificados en el PR.