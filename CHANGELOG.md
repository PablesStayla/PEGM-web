# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.0-staff] - 2026-04-27

### 🛡️ REPOSITORY HARDENING & S-GRADE STANDARDS

#### Added
- **S-Grade Documentation**: Full set of enterprise-standard handbooks.
  - `CONTRIBUTING.md`: High-standard contribution workflow and code review principles.
  - `DEVELOPMENT.md`: Engineering handbook covering DDD, ROP, and strict type safety.
  - `ENVIRONMENTS.md`: Professional environment management and secret rotation policy.
  - `SECURITY.md`: Polished vulnerability reporting and security standards.
  - `SUPPORT.md`, `ROADMAP.md`, `AUTHORS.md`, `CODE_OF_CONDUCT.md`: Enterprise baseline.
- **VS Code Workspace Optimization**: Implemented aggressive file nesting in `.vscode/settings.json` to reduce sidebar noise (40+ root files grouped under anchors).

#### Changed
- **Repository Metadata**: `package.json` updated with `@pranakaia/monorepo` naming, professional description, and Staff-level authoring.
- **Makefile**: Refactored to align with Drizzle ORM and Biome (removed legacy Prisma commands). Added `staff:audit` and `quality:strict` targets.
- **Git History**: Squashed entire project history into a single clean "initial commit" to reset the baseline for production-ready development.

#### Fixed
- **Monorepo Inconsistencies**: Fixed discrepancies between `AGENTS.md` (truth source) and root documentation/makefiles regarding ORM and linting tools.

---

### 🚀 PRODUCTION DEPLOY READY (Enero 2026)

#### Deploy Preparation
- **Guía de Deploy**: `docs/operations/runbooks/PRODUCTION_DEPLOY.md` creada
- **Script Admin**: `scripts/setup-admin.ts` para crear usuario admin inicial
- **Migraciones**: Generadas con Drizzle Kit (0001_unusual_darkhawk.sql)
- **Vercel Config**: `vercel.json` configurado para Next.js 14
- **DX Doctor**: 9/9 checks PASSED (100%)

#### Variables de Entorno para Producción
| Variable | Estado | Prioridad |
|----------|--------|-----------|
| NEXT_PUBLIC_SUPABASE_URL | Requerida | Crítica |
| SUPABASE_SERVICE_ROLE_KEY | Requerida | Crítica |
| DATABASE_URL | Requerida | Crítica |
| STRIPE_SECRET_KEY | Requerida | Crítica |
| ENCRYPTION_KEY | Generar nueva | Crítica |
| CSRF_SECRET | Generar nueva | Crítica |
| UPSTASH_REDIS_REST_URL | Opcional | Media |
| RESEND_API_KEY | Opcional | Media |
| SENTRY_DSN | Opcional | Baja |

#### Base de Datos - 25 Tablas Listas
- ✅ `shipping_zones` - Zonas de envío
- ✅ `shipping_rates` - Tarifas de envío
- ✅ `inventory` - Control de inventario
- ✅ `wishlists` - Listas de deseos
- ✅ `reviews` - Reseñas de productos
- ✅ `review_votes` - Votos en reseñas
- ✅ 19 tablas existentes (users, orders, products, etc.)

#### Checklist Pre-Deploy
- [x] DX Doctor 9/9 checks
- [x] Migraciones generadas
- [x] Script admin creado
- [x] Guía de deploy documentada
- [ ] Variables de entorno en Vercel
- [ ] Base de datos Supabase configurada
- [ ] Stripe webhooks configurados
- [ ] Dominio pranakaia.cl configurado

---

### FELLOW LEVEL SPRINT - Día 1-2 (Enero 2026)

#### 🔒 Security Fixes (CRÍTICO)
- **packages/auth**: Downgrade Next.js 16.2.1-canary.4 → 14.2.35 LTS
- **packages/auth**: Downgrade React 19.3.0-canary → 18.3.1 LTS
- **peerDependencies**: Actualizado a ^14.0.0 y ^18.0.0 para compatibilidad
- Estado: Vulnerabilidades críticas de Next.js corregidas

#### 🧹 Code Cleanup
- **Eliminados 21 archivos muertos** identificados por knip:
  - `.storybook/*` (5 archivos) - Storybook no utilizado
  - `scripts/*` (10 archivos) - Scripts de mantenimiento obsoletos
  - `apps/web/src/components/*` (2 archivos) - Componentes no usados
  - `apps/web/src/lib/*` (4 archivos) - Librerías duplicadas/no usadas
- Estado: Código base limpio, menos deuda técnica

#### 🗃️ Database Schema
- **Nuevas tablas Drizzle creadas**:
  - `shipping_zones` - Zonas de envío configurables
  - `shipping_rates` - Tarifas de envío por zona/peso/valor
  - `inventory` - Control de inventario con SKU, stock, umbrales
  - `wishlists` - Lista de deseos de usuarios
  - `reviews` - Reseñas de productos con ratings
  - `review_votes` - Votos útiles en reseñas
- Estado: 8 TODOs críticos resueltos

#### 🔧 TypeScript Fixes
- **apps/web/src/store/index.ts**: Fix tipos opcionales en quantity (lineas 78, 99)
- **apps/web/src/proxy.ts**: Cast a any para compatibilidad de tipos Next.js entre packages
- Estado: TypeScript compilando correctamente

#### ✅ Environment
- **Git hooks**: Lefthook configurado correctamente (pre-commit, pre-push, commit-msg)
- **Biome**: Formateo aplicado a 928+ archivos
- **DX Doctor**: 6/9 checks pasando (3 warnings menores)

#### 📊 Métricas del Sprint
| Métrica | Inicial | Actual | Mejora |
|---------|---------|--------|--------|
| DX Doctor | 5/9 | 6/9 | +1 ✅ |
| Archivos muertos | 224 | ~203 | -21 🗑️ |
| TODOs críticos | 8 | 0 | -8 ✅ |
| Vulnerabilidades críticas | 2 | 0 | -2 🔒 |

---

### Week 2 - Consolidation Sprint (April 2026)

#### Added

- **Packages**: Nuevo package `@pranakaia/domain` (unifica core-domain + shared-types)
- **Packages**: Nuevo package `@pranakaia/infra` (unifica db + supabase + email + logger)
- **Packages**: Nuevo package `@pranakaia/app` (unifica auth + hooks + ui)
- **Tools**: Ejecución de scripts/fellow/consolidate-packages.ts
- **Documentation**: Plan consolidado en `docs/project/FELLOW_CRITICAL_EXECUTION_PLAN_2026-04-01.md`
- **Dead Code**: knip-report.json con 207 archivos no utilizados identificados

#### Changed

- **Dependencies**: Next.js 14.2.25 → 14.2.35 (apps/web y apps/admin)
- **Dependencies**: lodash 4.17.21 → 4.17.23 (security fix)
- **Dependencies**: React 19.3.0-canary → 18.3.1 LTS (packages/email)
- **Architecture**: Package consolidation 12 → 5 (-58% reducción)
- **Apps**: Migración de imports a packages consolidados

#### Security

- **P0 Fixed**: Next.js vulnerabilidades críticas (GHSA-mwv6-3258-q52c, etc.)
- **P0 Fixed**: lodash Prototype Pollution (GHSA-xxjr-mmjv-4gpg)
- **P0 Fixed**: React canary inestable reemplazado por LTS

#### Technical Debt

- **Packages**: Reducción de dependencias de workspace por app: 9 → 4
- **Dead Code**: 207 archivos no utilizados identificados para limpieza
- **Legacy**: 9 packages marcados para eliminación post-verificación

### Foundation Week - Days 1-5 (March 2026)

#### Added

- **Documentation**: TODO_TRIAGE_REPORT.md with 112 TODOs categorized
- **Documentation**: DEPENDENCY_AUDIT_REPORT.md with 30 vulnerabilities identified
- **Documentation**: TEST_COVERAGE_BASELINE.md with test metrics
- **Tools**: scripts/fellow/todo-triage.ts for automated TODO scanning
- **ADRs**: Architecture Decision Records for recent changes
  - ADR-004: React 18/Next.js 14 Downgrade
  - ADR-005: Auth Unification (Supabase)
  - ADR-006: Type Safety Hardening

#### Changed

- **Dependencies**: Downgrade React 19 canary → 18.3.1 LTS
- **Dependencies**: Downgrade Next.js 16 canary → 14.2.25 LTS
- **Dependencies**: Update @types/react v19 → v18.3.0
- **Auth**: Remove next-auth dependency from apps/web
- **Auth**: Remove CASL (@casl/ability, @casl/react) from apps/admin
- **Type Safety**: Eliminate all explicit `as any` types in production code
- **Linting**: Add Biome strict configuration
- **Linting**: Add ESLint backup configuration

#### Fixed

- **Type Safety**: Fixed Sentry breadcrumb type error in packages/logger
- **Type Safety**: Fixed rate limiter type with Duration from @upstash/ratelimit
- **Type Safety**: Fixed Stripe webhook event types
- **Type Safety**: Fixed checkout session types

#### Security

- **Audit**: Identified 30 vulnerabilities (2 critical, 7 high, 17 moderate, 4 low)
- **Critical**: Next.js RCE in packages/email (react-email@3.0.7 > next@15.1.2)
- **Critical**: Next.js Authorization Bypass in middleware

#### Technical Debt

- **TODOs**: Catalogued 112 TODOs (8 critical, 3 high, 3 medium, 98 low)
- **Dead Code**: Identified 206 unused files via knip
- **Dependencies**: Identified 67 unused dependencies
- **Exports**: Identified 138 unused exports
- **Types**: Identified 66 unused type exports

#### Testing

- **Baseline**: 67 test files, 1,142 tests total
- **Current**: 52 test files passing (77.6%), 14 failing
- **Coverage**: ~45-50% estimated (target: 85%)

## [2.0.0] - Target: April 2026

### Planned

- [ ] Package consolidation (12 → 5 packages)
- [ ] Schema unification (single source of truth)
- [ ] 85% test coverage
- [ ] Complete vulnerability remediation
- [ ] MSW testing infrastructure
- [ ] Contract testing with OpenAPI
- [ ] CI/CD optimization (<5 min build time)
- [ ] Bundle optimization (<200KB)

## [1.0.0] - Previous Release

- Initial e-commerce platform release
- Next.js 14 with App Router
- Supabase integration
- Stripe payments
- Admin panel with Refine

---

## Legend

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Now removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
