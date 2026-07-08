# Arquitectura — PranaKaia E-Commerce

> **Estilo:** Hexagonal (Ports & Adapters) + Domain-Driven Design con Bounded Contexts
> **Última revisión:** 2026-05-01

---

## 1. Principios Arquitectónicos

1. **Separación estricta de capas:** Dominio → Aplicación → Infraestructura → Presentación. Cada capa solo conoce a la inmediatamente inferior.
2. **Dependencias hacia adentro:** El dominio no depende de nada externo. La aplicación depende del dominio. La infraestructura implementa puertos definidos por la aplicación.
3. **Bounded Contexts:** Cada contexto acotado (cart, catalog, checkout, payments, auth, identity) es independiente, con su propio modelo de dominio y límites explícitos.
4. **Ports & Adapters:** La aplicación define interfaces (puertos); la infraestructura provee implementaciones (adaptadores). Cambiar de base de datos, proveedor de pagos o servicio de email no afecta el core.

---

## 2. Stack Tecnológico

| Capa          | Tecnología                                                |
|---------------|-----------------------------------------------------------|
| Framework     | Next.js 15 (App Router), React 19, TypeScript 5.9         |
| ORM           | Drizzle ORM                                                |
| Base de datos | Supabase (PostgreSQL + RLS + Edge Functions)               |
| API interna   | Hono (puerto 3002 — migrando desde Express)                |
| Validación    | next-safe-action + Zod                                     |
| Cache         | Redis (Upstash o self-hosted)                              |
| Colas         | Redis Bull / resend colas de email                         |
| Email         | Resend + react-email                                       |
| Monorepo      | pnpm 9 + Turborepo 2.9                                     |
| UI            | shadcn/ui + TailwindCSS 4                                  |
| Testing       | Vitest + Playwright + MSW                                  |
| Deploy        | Vercel (web, admin), Docker/K8s (api)                     |

---

## 3. Topología C4 — Diagrama de Contexto

```
┌─────────────────────────────────────────────────────────┐
│                      USUARIO                             │
│    (Cliente navegando / Admin gestionando / API client)  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                  PranaKaia E-Commerce                     │
│   ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│   │  Web (3000)  │  │ Admin (3001) │  │  API (3002)    │ │
│   │ Next.js App  │  │ Next.js App  │  │   Hono Server  │ │
│   │  Router      │  │  Router      │  │  (REST/WS)     │ │
│   └──────┬───────┘  └──────┬───────┘  └───────┬────────┘ │
└──────────┼──────────────────┼──────────────────┼───────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Server Actions                           │
│              (next-safe-action + Zod validation)            │
│        Capa de aplicación — orquestación de casos de uso   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    DOMINIO (Core)                           │
│   ┌──────┐ ┌────────┐ ┌─────────┐ ┌────────┐ ┌────────┐   │
│   │Cart  │ │Catalog │ │Checkout │ │Payments│ │  Auth  │   │
│   │BC    │ │  BC    │ │   BC    │ │   BC   │ │  BC    │   │
│   └──────┘ └────────┘ └─────────┘ └────────┘ └────────┘   │
│   ┌──────────┐ ┌──────────────┐                              │
│   │ Identity  │ │    Core      │                              │
│   │    BC     │ │(Shared Kernel)│                             │
│   └──────────┘ └──────────────┘                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   INFRAESTRUCTURA                           │
│  ┌────────┐ ┌──────────┐ ┌───────┐ ┌───────┐ ┌─────────┐  │
│  │Supabase│ │  Redis   │ │Resend │ │  S3   │ │Stripe /  │  │
│  │  (DB)  │ │ (Cache)  │ │(Email)│ │Assets │ │Webpay    │  │
│  └────────┘ └──────────┘ └───────┘ └───────┘ └─────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Estructura del Monorepo

```
pranakaia-ecommerce/
├── apps/
│   ├── web/                    # Next.js — tienda pública (puerto 3000)
│   ├── admin/                  # Next.js — panel de administración (puerto 3001)
│   └── api/                    # Hono — API REST/WS (puerto 3002)
│
├── packages/
│   ├── core-domain/            # Entidades base, Value Objects compartidos
│   ├── shared-kernel/          # Tipos genéricos, Result, errores base
│   ├── shared-types/           # Tipos compartidos entre contextos
│   ├── contracts/              # Contratos de API (request/response DTOs)
│   ├── api-client/             # Cliente HTTP tipado para la API
│   │
│   ├── domain/                 # Meta-package para re-exportar dominios
│   ├── services/               # Meta-package para re-exportar servicios
│   └── config/                 # Meta-package para re-exportar config
│   │
│   ├── auth/                   # Bounded Context: Autenticación
│   ├── identity/               # Bounded Context: Identidad de usuarios
│   ├── cart/                   # Bounded Context: Carrito de compras
│   ├── catalog/                # Bounded Context: Catálogo de productos
│   ├── checkout/               # Bounded Context: Checkout / órdenes
│   └── payments/               # Bounded Context: Pagos
│   │
│   ├── db/                     # Drizzle schema, migraciones, seeds
│   ├── redis/                  # Cliente Redis con tipado
│   ├── supabase/               # Cliente Supabase + helpers RLS
│   ├── infra/                  # Implementaciones de infraestructura
│   ├── infrastructure/         # Servicios base (logger, metrics, tracing)
│   ├── email/                  # Transaccionales con react-email
│   ├── logger/                 # Logger estructurado (pino)
│   │
│   ├── ui/                     # Componentes shadcn/ui compartidos
│   ├── hooks/                  # React hooks compartidos
│   ├── testing/                # Utilities de testing
│   └── testkit/                # Fixtures, mocks, builders para tests
│
├── turbo.json                  # Configuración Turborepo 2.9
├── pnpm-workspace.yaml         # Definición del workspace
└── tsconfig.json               # Base TypeScript 5.9
```

---

## 5. Flujo Request → Response (Diagrama ASCII)

```
CLIENTE (Browser / API Client)
    │
    ▼
┌────────────────────────────────────┐
│  Next.js App Router (web/admin)    │
│  ┌─ middleware ──────────────────┐ │
│  │  auth(), session(), redirect  │ │
│  └───────────────────────────────┘ │
│  ┌─ Layout / Page ──────────────┐ │
│  │  Server Component (RSC)      │ │
│  │  ↓                           │ │
│  │  Server Action (next-safe-   │ │
│  │  action + Zod schema)        │ │
│  └──────────┬───────────────────┘ │
└─────────────┼──────────────────────┘
              │
              ▼
┌────────────────────────────────────┐
│      CAPA DE APLICACIÓN           │
│  ┌──────────────────────────────┐ │
│  │ UseCase (ej: AddToCart)      │ │
│  │  1. Validar input (Zod)      │ │
│  │  2. Cargar estado dominio    │ │
│  │  3. Invocar método entidad   │ │
│  │  4. Persistir cambios        │ │
│  │  5. Publicar evento          │ │
│  │  6. Retornar Result<T,E>     │ │
│  └──────────┬───────────────────┘ │
└─────────────┼──────────────────────┘
              │
              ▼
┌────────────────────────────────────┐
│        CAPA DE DOMINIO            │
│  ┌──────────────────────────────┐ │
│  │ Entity / Aggregate Root      │ │
│  │  → reglas de negocio puras   │ │
│  │  → sin dependencias externas │ │
│  │ Value Object                  │ │
│  │  → inmutables, tipados       │ │
│  │ Domain Event                  │ │
│  │  → efectos secundarios       │ │
│  └──────────────────────────────┘ │
└─────────────┬──────────────────────┘
              │
              ▼
┌────────────────────────────────────┐
│      PUERTOS (Interfaces)         │
│  ┌──────────────────────────────┐ │
│  │ ProductRepository (port)     │ │
│  │  findById(id): Result<T,E>   │ │
│  │  save(product): Result<T,E>  │ │
│  └──────────┬───────────────────┘ │
└─────────────┼──────────────────────┘
              │
              ▼
┌────────────────────────────────────┐
│    ADAPTADORES (Infraestructura)  │
│  ┌──────────────────────────────┐ │
│  │ DrizzleProductRepository     │ │
│  │  → implementa ProductPort   │ │
│  │  → Drizzle ORM → Supabase   │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ StripePaymentAdapter         │ │
│  │  → implementa PaymentPort   │ │
│  │  → Stripe SDK                │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
              │
              ▼
         RESPONSE
    (Result<T,E> → JSON / redirect)
```

---

## 6. Bounded Contexts — Mapa

| Contexto    | Responsabilidad                          | Eventos clave                       |
|-------------|------------------------------------------|-------------------------------------|
| **Cart**    | Carrito de compras, reglas de negocio     | CartUpdated, CartAbandoned          |
| **Catalog** | Productos, categorías, búsqueda, precios  | ProductCreated, PriceChanged         |
| **Checkout**| Órdenes, flujo de compra, estados         | OrderPlaced, OrderShipped           |
| **Payments**| Transacciones, reembolsos, facturación    | PaymentSucceeded, PaymentFailed     |
| **Auth**    | Login, registro, sesiones, MFA            | UserLoggedIn, SessionRevoked        |
| **Identity**| Perfiles, direcciones, roles, permisos    | ProfileUpdated, AddressChanged      |

---

## 7. Deployment

```
                    ┌─────────────┐
                    │  Cloudflare │
                    │    DNS      │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
         ┌────────┐  ┌────────┐  ┌──────────┐
         │  Web   │  │ Admin  │  │   API    │
         │ Vercel │  │ Vercel │  │ Docker/  │
         │        │  │        │  │   K8s    │
         └────────┘  └────────┘  └────┬─────┘
                                       │
                          ┌────────────┼────────────┐
                          │            │            │
                          ▼            ▼            ▼
                     ┌────────┐  ┌────────┐  ┌─────────┐
                     │Supabase│  │ Redis  │  │   S3    │
                     │ (RDS)  │  │(Cache) │  │(Assets) │
                     └────────┘  └────────┘  └─────────┘
```

---

## 8. Reglas Arquitectónicas (Forzadas por ESLint + barrelsby)

1. `packages/*/domain/` no puede importar de `packages/*/infrastructure/`
2. `apps/*` no puede importar directamente de `packages/*/infrastructure/` (debe pasar por puertos)
3. Las Server Actions solo importan casos de uso, nunca repositorios o servicios de infraestructura
4. Cada Bounded Context se comunica con otros solo mediante Domain Events o contratos explícitos en `contracts/`
5. Prohibido `import` cíclico entre packages — se valida con `madge`