# Screaming Architecture Migration — PranaKaia E-Commerce

> **Objetivo:** Migrar los 27 packages actuales (19 con código) a una estructura Screaming Architecture
> con 6-8 paquetes esenciales que griten dominio del negocio, no framework ni implementación.
>
> Versión: 1.0 — Mayo 2026

---

## Estado Actual (27 packages, 19 con código)

```
packages/          # 27 packages, ~45k líneas TS
├── core-domain    # 14,139 líneas — MONOLITO: mezcla domain + application + infrastructure
├── app            # 11,558 — duplica auth/hooks/ui
├── ui             # 10,983 — componentes Radix (bien)
├── identity       # 1,827 — DDD limpio (modelo a seguir)
├── shared-types   # 1,540 — branded types, schemas, utils
├── payments       # 1,654 — Stripe SDK wrapper
├── db             # 1,362 — Drizzle schemas
├── testkit        # 1,035 — fixtures
├── supabase       # 1,037 — Supabase client
├── services       # 2,770 — orquestación + gateways + Inngest
├── auth           # 1,108 — server/client/middleware
├── cart           # 857 — DDD parcial
├── catalog        # 453 — DDD parcial
├── checkout       # 511 — entities
├── redis          # 872 — Upstash client
├── shared-kernel  # 583 — Result, base types
├── domain         # 602 — re-exports de dropshipping supplier
├── email          # 347 — react-email templates
├── hooks          # 196 — React hooks
├── logger         # 440 — logger wrapper
├── config         # VACÍO
├── contracts      # VACÍO
├── infra          # VACÍO
├── infrastructure # VACÍO
├── testing        # VACÍO
├── api-client     # VACÍO
└── application    # VACÍO
```

---

## Estado Objetivo (8 packages, screaming domain names)

```
packages/
├── @pranakaia/domain          # TODO el dominio puro (entidades, VOs, ports)
├── @pranakaia/application     # Casos de uso, orquestación, DTOs, eventos
├── @pranakaia/infrastructure  # Implementaciones concretas (DB, APIs, cache)
├── @pranakaia/shared-kernel   # Base types, Result, Branded, errores base
├── @pranakaia/identity        # Auth + identidad (ya DDD, se queda)
├── @pranakaia/catalog         # Catálogo + dropshipping (Screaming)
├── @pranakaia/ui              # Design system (Radix/Tailwind) — se queda
├── @pranakaia/testkit         # Testing utilities — se queda
```

---

## Plan de Migración en 5 Fases

### Fase 1: Preparación (sin código roto)

1. Crear los 8 nuevos packages como copias de los actuales
2. Congelar `package.json` existente — no tocar dependencias
3. Script de validación: `pnpm build` + `pnpm type-check` debe pasar antes y después

### Fase 2: Consolidar @pranakaia/domain

**Origen:** `core-domain/src/domain/` + `cart/src/domain/` + `catalog/src/domain/` + `checkout/src/domain/` + `identity/src/domain/` + `payments/src/domain/`

**Acción:**
1. Mover `core-domain/src/domain/` completo (catalog, cart, orders, dropshipping, inventory, shipping, payment, shared)
2. Mover `cart/src/domain/`, `catalog/src/domain/`, `checkout/src/domain/` (son entidades que extienden)
3. Mover `payments/src/` → `infrastructure/src/payments/` (es SDK, no dominio puro)
4. `identity/src/domain/` se queda (es su propio BC)

**Estructura objetivo:**
```
packages/domain/src/
├── catalog/        # Product, Category (entidades)
│   ├── entities/
│   ├── value-objects/
│   └── ports/
├── cart/           # Cart, CartItem (entidades)
│   ├── entities/
│   ├── value-objects/
│   └── ports/
├── checkout/       # Order, Payment (entidades)
│   ├── entities/
│   ├── value-objects/
│   └── ports/
├── dropshipping/   # Supplier, DropshipOrder
│   ├── entities/
│   ├── value-objects/
│   └── ports/
├── inventory/      # Stock, Inventory
├── shipping/       # ShippingProvider (ports)
├── payment/        # PaymentGateway (ports)
├── email/          # EmailSender (ports)
└── shared/         # Entity base, ValueObject base, events, errors
```

### Fase 3: Consolidar @pranakaia/application

**Origen:** `core-domain/src/application/` + `services/src/` + `services/src/infrastructure/*`

**Acción:**
1. Mover `core-domain/src/application/` (checkout, catalog, cart, dropshipping, inventory, orders, shipping)
2. Mover `services/src/dropshipping-orchestrator.ts` → application
3. Mover `services/src/fulfillment.ts` → application
4. NO mover gateways ni Inngest — eso es infraestructura

### Fase 4: Consolidar @pranakaia/infrastructure

**Origen:** `core-domain/src/infrastructure/` + `auth/src/` + `db/src/` + `redis/src/` + `email/src/` + `supabase/src/` + `services/src/infrastructure/` + `logger/src/` + `shared-types/src/utils/*`

**Acción:**
1. Mover `core-domain/src/infrastructure/` completo (shipping, circuit-breaker, cqrs, event-bus, idempotency, outbox, repositories)
2. Mover `auth/src/` completo
3. Mover `db/src/` completo (Drizzle schemas y config)
4. Mover `redis/src/` completo (Upstash client)
5. Mover `email/src/` completo (Resend client)
6. Mover `supabase/src/` completo
7. Mover `services/src/infrastructure/gateways/*` (flow.gateway, stripe.gateway)
8. Mover `logger/src/` completo
9. Mover `services/src/inngest/` (es infra)

### Fase 5: Limpieza y apuntamiento

1. Eliminar packages viejos uno por uno, verificando `pnpm build` después de cada uno
2. Actualizar `turbo.json` con las nuevas rutas
3. Actualizar imports en `apps/` — `pnpm exec turbo type-check` para validar
4. Actualizar `AGENTS.md` con la nueva estructura
5. Marcar hitos de migración en la tabla de compliance

---

## Dependencias Finales

```
apps/web ───┬── @pranakaia/application ─── @pranakaia/domain ─── @pranakaia/shared-kernel
apps/admin ─┤   @pranakaia/identity    ─── @pranakaia/domain
apps/api ───┤   @pranakaia/infrastructure
            └── @pranakaia/ui
```

- **domain** → solo depende de shared-kernel
- **application** → depende de domain + shared-kernel
- **infrastructure** → depende de domain + shared-kernel
- **identity** → depende de shared-kernel
- **ui** → no depende de nadie (solo React/Radix)
- **testkit** → depende de todos (solo dev)

---

## Lo que se ELIMINA

| Package | Motivo |
|---------|--------|
| `app` | Código duplicado en auth/hooks/ui — migrar contenido, eliminar |
| `services` | Dividido en application + infrastructure |
| `shared-types` | Absorbido por shared-kernel + domain |
| `domain` | Reemplazado por `@pranakaia/domain` real |
| `infra` | Vacío |
| `infrastructure` | Vacío |
| `testing` | Vacío — testkit lo cubre |
| `config` | Vacío |
| `contracts` | Vacío — en desuso |
| `hooks` | Pasa a app o ui (decidir) |
| `api-client` | Vacío — si se necesita, nace como nuevo package |

## Riesgos

1. **core-domain** tiene 14k líneas con dependencias internas entre domain/, application/, infrastructure/ — la separación requiere mover archivos con cuidado para no romper imports relativos.
2. Los **Server Actions** en `apps/web/src/actions/` importan directamente de `@pranakaia/core-domain` — actualizar todas las referencias.
3. **Inngest** está en `services/src/inngest/` y referencia funciones de varios packages — preservar la estructura de funciones al migrar.

---

> **Regla de oro:** `pnpm build` y `pnpm type-check` deben pasar DESPUÉS de cada fase.
> Si en alguna fase el build se rompe, revertir inmediatamente.