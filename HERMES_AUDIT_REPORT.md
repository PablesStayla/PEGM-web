# 🔍 PranaKaia E-Commerce — Auditoría Completa

**Generado:** 2026-05-10 12:30 UTC  
**Auditor:** OpenClaw (coordinador) → Hermes (ejecutor pendiente)  
**Scope:** Monorepo completo — `apps/`, `packages/`, `tools/`

---

## 📊 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Archivos `.ts` totales | 901 |
| Archivos de test | 246 |
| Líneas de código | 73,464 |
| Packages | 19 |
| Apps | 3 |
| Tools categorías | 12+ |
| Archivos >150 líneas | 30+ |
| `any` types (no-test) | 17+ |
| Shells exportando lógica | 8 |
| Packages sin tests | 3 |
| Funciones duplicadas | 10 |
| Port interfaces distintas | 12+ |
| `.env.local` secrets | 60 claves |
| Cross-category imports | 0 ✅ |

**Veredicto general:** Arquitectura sólida en packages (DDD con ports/adapters), tools con issues conocidos ya documentados, apps con several archivos sobre-línea.

---

## 1. 🏗️ Estructura del Monorepo

```
E-Commerce/
├── apps/
│   ├── admin/     (108 src, 12 tests) — Next.js admin panel
│   ├── api/       (9 src, 0 tests)    — Hono API gateway
│   └── web/       (161 src, 35 tests) — Next.js storefront
├── packages/
│   ├── cart/              (17 src, 9 tests)
│   ├── catalog/           (17 src, 10 tests)
│   ├── checkout/          (24 src, 7 tests)
│   ├── communications/    (9 src, 3 tests)
│   ├── config/            (3 src, 1 test)
│   ├── core-building-blocks/ (2 src, 0 tests) ❌
│   ├── db/                (3 src, 0 tests) ❌
│   ├── domain/            (2 src, 0 tests) ❌
│   ├── identity/          (36 src, 8 tests)
│   ├── infrastructure/    (6 src, 1 test)
│   ├── inventory/         (9 src, 1 test)
│   ├── logistics/         (7 src, 2 tests)
│   ├── payments/          (5 src, 2 tests)
│   ├── pricing/           (3 src, 1 test)
│   ├── shared-kernel/     (27 src, 18 tests)
│   ├── shipping/          (7 src, 1 test)
│   ├── supplier/          (23 src, 9 tests)
│   ├── testkit/           (21 src, 1 test)
│   └── ui/                (11 src, 1 test)
└── tools/ (250 src files, 12+ categorías)
```

---

## 2. 🔴 Problemas Críticos (P0)

### 2.1 Secrets en `.env.local` — 60 claves sin rotar
- **Archivo:** `.env.local` (60 claves), `apps/web/.env.local` (11 claves)
- **No están en git** ✅ (`.gitignore` los excluye)
- **Pero contienen:** Stripe keys, Supabase keys, auth secrets, API keys reales
- **Acción:** Rotar los 15 secrets comprometidos ya identificados en `tools/security-audit/rotate-secrets-checklist.md`

### 2.2 `process.env` en código de dominio (FC/IS violation)
- **`packages/logistics/src/application/fulfillment.registry.ts:20`** — usa `process.env` directamente en la capa de aplicación
- **Debería:** Recibir configuración por DI (constructor/parameter)
- **Severidad:** Alta — acoplamiento al runtime environment

### 2.3 Database URL hardcoded
- **`packages/db/src/index.ts:8`** — `'postgres://postgres:postgres@localhost:5432/pranakaia'` como fallback
- **Riesgo:** Credenciales débiles en fallback, connection string en código fuente
- **Acción:** Eliminar fallback, forzar que venga de env/DI

### 2.4 `api/` app sin tests
- **`apps/api/`** — 9 archivos fuente, 0 tests
- Es el gateway HTTP — punto de entrada crítico sin cobertura

---

## 3. 🟠 Problemas Altos (P1)

### 3.1 Packages sin tests
| Package | Archivos src | Tests | Severidad |
|---------|-------------|-------|-----------|
| `core-building-blocks` | 2 | 0 | Alta — código compartido sin validación |
| `db` | 3 | 0 | Alta — esquema de base de datos sin tests |
| `domain` | 2 | 0 | Media — solo re-exports |

### 3.2 `any` types en código de producción
| Archivo | Línea | Contexto |
|---------|-------|----------|
| `checkout/src/application/checkout-validator.service.ts` | 28 | `as any` en result |
| `checkout/src/application/checkout.builders.ts` | 48 | `as any` en productId |
| `checkout/src/application/checkout.helpers.ts` | 42, 81 | `as any` en props |
| `checkout/src/application/checkout.service.ts` | 61, 84, 88-90, 102 | 7x `as any` — el peor archivo |
| `identity/src/api/sign-in.controller.ts` | 55, 81 | `any` en Result match y test |
| `identity/src/domain/session/session.entity.ts` | 39 | `(this as any)._version` |
| `identity/src/domain/user/user.entity.ts` | 35 | `(this as any)._version` |
| `identity/src/infrastructure/better-auth/better-auth-authenticator.ts` | 10, 12 | `private auth: any`, `config: any` |
| `logistics/src/application/fulfillment.registry.ts` | 20 | `as Record<string, string | undefined>` |

**Checkout es el package con más `any`** — 7 instancias en un solo archivo de servicio.

### 3.3 Shells que exportan lógica (FC/IS violation en tools/)
Ya documentados en CLEANUP-PLAN.md, 8 shells exportando funciones que deberían estar en `/internal/` o `/lib/`:
- `check-qa-gates.ts` (5 funciones)
- `check-validation-rules.ts` (4 funciones)
- `scan-secrets-patterns.ts` (3 funciones)
- `move-reports-batch.ts` (3 funciones)
- `format-fs-paths.ts` (3 funciones + I/O directa)
- `define-cleanup-tasks.ts` (2 funciones)
- `clean-workspace-full.ts` (1 función)
- `parse-env-file.ts` (1 función)

---

## 4. 🟡 Problemas Medios (P2)

### 4.1 Archivos >150 líneas (top 10)
| Líneas | Archivo | Tipo |
|--------|---------|------|
| 1240 | `apps/web/.../checkout.test.ts` | Test |
| 697 | `apps/web/.../coupons/route.test.ts` | Test |
| 623 | `apps/web/.../checkout.test.ts` | Test |
| 592 | `apps/web/.../pipeline.test.ts` | Test |
| 567 | `apps/web/.../enterprise-monitoring.ts` | **Source** ⚠️ |
| 521 | `apps/web/.../coupons/route.test.ts` | Test |
| 513 | `apps/web/.../chat/route.test.ts` | Test |
| 467 | `apps/web/.../enterprise-security.ts` | **Source** ⚠️ |
| 442 | `apps/admin/.../order.service.ts` | **Source** ⚠️ |
| 441 | `apps/web/.../coupon-validator.ts` | **Source** ⚠️ |

**Los 4 archivos source más largos necesitan refactor:**
1. `enterprise-monitoring.ts` (567 líneas) — monolito de monitoring
2. `enterprise-security.ts` (467 líneas) — monolito de seguridad
3. `order.service.ts` (442 líneas) — servicio de órdenes
4. `coupon-validator.ts` (441 líneas) — validador de cupones

### 4.2 Funciones duplicadas (tools/)
Ya mapeadas en CLEANUP-PLAN.md, 10 funciones duplicadas:
- `maskSecret` — 3 implementaciones (params diferentes, no idénticas)
- `validateEnvVar` — 2 sistemas (regex vs Zod, proposito diferente)
- `shouldSkipPattern` — 2 implementaciones
- `toPosixPath` — 2 implementaciones idénticas
- `getCriticalChecks` — 2 implementaciones idénticas
- `checkFileExists`/`checkFileContains` — en infra vs QA

### 4.3 Port interfaces fragmentados
12+ interfaces Port distintas en tools/, con 4 variantes de filesystem port:
- `FileSystemPort` (clean-artifacts)
- `FsPort` (clean-repository)
- `FileWalkerPort` + `PackageScriptChecker` (QA)
- `FileChecker` + `FileReader` (QA gates)

En packages/ la situación es más sana — ports bien definidos con `RepositoryPort<T>` genérico en shared-kernel.

### 4.4 Shells con I/O directa sin DI
Varios tools importan `fs` y `child_process` directamente sin inyección:
- `assign-levels-automation.ts` — readFileSync/writeFileSync
- `audit-service-references.ts` — readFileSync/writeFileSync
- `move-reports-batch.ts` — `import * as fs`
- `validate-env-quick.ts` — readFileSync
- `check-environment-doctor.ts` — execSync

---

## 5. 🟢 Aspectos Positivos

| Aspecto | Estado |
|---------|--------|
| **DDD en packages/** | ✅ Ports/Adapters bien implementado |
| **Cross-category imports** | ✅ Cero violaciones |
| **shared-kernel como fundación** | ✅ RepositoryPort genérico, EventBus, Entity base |
| **Zod para validación** | ✅ Usado en cart, pricing, supplier, admin actions |
| **.env.local no en git** | ✅ gitignore funciona |
| **gitleaks configurado** | ✅ Pre-commit secret scanning |
| **Turbo para builds** | ✅ Monorepo build orchestration |
| **Dependencias workspace** | ✅ Flujo correcto: apps → packages, packages → shared-kernel |
| **Naming convention** | ✅ `verb-target-purpose.ts` en tools/ |
| **Tools test ratio** | ✅ 124 test files / 126 source files (98%) |

---

## 6. 📐 Grafo de Dependencias (workspace)

```
                    ┌─────────────┐
                    │ shared-kernel│
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                   │
   ┌────┴────┐       ┌─────┴─────┐      ┌─────┴──────┐
   │  domain │       │  config   │      │ core-bldg  │
   └────┬────┘       └───────────┘      └────────────┘
        │
   ┌────┴────┐
   │identity │←── db
   └────┬────┘
        │
   ┌────┴──────────────────────────────────┐
   │                                        │
┌──┴──┐  ┌────────┐  ┌────────┐  ┌────────┐│
│ cart│  │catalog │  │pricing │  │  infra ││
└──┬──┘  └───┬────┘  └───┬────┘  └────────┘│
   │         │            │                  │
   └────┬────┘            │                  │
   ┌────┴──────┐          │                  │
   │ checkout  │←─────────┘                  │
   │ (pago+inv│                              │
   │  +precio) │                              │
   └───────────┘                              │
                                              │
   ┌──────────┐  ┌────────┐  ┌────────┐      │
   │ payments │  │inventory│ │shipping│      │
   │  ←catalog│  │←catalog│ │←catalog│      │
   └──────────┘  └────────┘  └────────┘      │
                                              │
   ┌──────────┐  ┌────────┐  ┌────────┐      │
   │ logistics│  │supplier│  │  comms │      │
   └──────────┘  │←catalog│  └────────┘      │
                 │+checkout│                  │
                 └─────────┘                  │
        ┌────────────────────┐                │
        │     APPLICATIONS   │                │
        ├────────────────────┤                │
        │ admin ← cat+inv+   │                │
        │   pricing+ui+sk    │                │
        │ api ← identity+    │                │
        │   cart+infra+sk    │                │
        │ web ← checkout+inv+│                │
        │   cat+infra+ui+sk  │                │
        └────────────────────┘                │
```

**Patrón observado:** Todo fluye hacia `shared-kernel` ✅. No hay dependencias circulares. `checkout` es el package más acoplado (6 deps workspace).

---

## 7. 🎯 Plan de Acción Priorizado

### Fase 1 — Seguridad (P0, inmediato)
1. Rotar 15 secrets comprometidos (`rotate-secrets-checklist.md`)
2. Eliminar `postgres://postgres:postgres` fallback en `packages/db/src/index.ts`
3. Inyectar `process.env` en `fulfillment.registry.ts` por DI

### Fase 2 — Calidad (P1, esta semana)
4. Agregar tests a `core-building-blocks` y `db`
5. Eliminar `any` types en `checkout.service.ts` (7 instancias)
6. Tipar `better-auth-authenticator.ts` (2 `any`)
7. Agregar tests a `apps/api/`

### Fase 3 — Arquitectura (P2, próximas 2 semanas)
8. Ejecutar 17 cirugías del CLEANUP-PLAN.md (tools/)
9. Refactorizar archivos source >150 líneas (4 archivos en apps/)
10. Unificar FsPort variants en tools/ a interfaz común
11. Mover lógica exportada de shells a `/internal/`

### Fase 4 — Sostenibilidad
12. Configurar `hermes cron` para auditoría semanal automática
13. Agregar pre-commit hook que bloquee `any` types nuevos
14. Implementar coverage gates por package

---

## 8. 📊 Métricas por Package

| Package | Src | Tests | Ratio | Zod | any | >150L |
|---------|-----|-------|-------|-----|-----|-------|
| shared-kernel | 27 | 18 | 67% | ✅ | 0 | 1 |
| identity | 36 | 8 | 22% | ❌ | 4 | 0 |
| checkout | 24 | 7 | 29% | ❌ | 7 | 0 |
| supplier | 23 | 9 | 39% | ✅ | 0 | 0 |
| cart | 17 | 9 | 53% | ✅ | 0 | 1 |
| catalog | 17 | 10 | 59% | ❌ | 0 | 0 |
| testkit | 21 | 1 | 5% | ❌ | 0 | 0 |
| communications | 9 | 3 | 33% | ❌ | 0 | 0 |
| logistics | 7 | 2 | 29% | ❌ | 1 | 0 |
| ui | 11 | 1 | 9% | ❌ | 0 | 0 |

---

*Reporte generado por OpenClaw. Pendiente delegación a Hermes para ejecución de Fase 1-2.*
