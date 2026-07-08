# PranaKaia Test Suite

Estructura profesional de tests para el monorepo PranaKaia E-Commerce.

## Estructura

```
tests/
├── e2e/
│   ├── playwright.config.ts          # Configuración central de Playwright
│   ├── setup/
│   │   ├── global-setup.ts           # Seed de datos + health check pre-suite
│   │   ├── global-teardown.ts        # Cleanup post-suite
│   │   └── auth.setup.ts             # Helpers: bypassAgeGate, authenticateUser, authenticateAdmin
│   └── flows/
│       ├── checkout.spec.ts          # Flujo completo: catálogo → carrito → checkout → pago
│       ├── admin-inventory.spec.ts   # Flujo admin: age gate → login → productos → inventario → órdenes
│       └── supplier-onboarding.spec.ts # Flujo proveedor: registro → validación → dropship
├── integration/
│   ├── api-to-db.spec.ts             # API → Drizzle ORM → PostgreSQL (round-trip real)
│   └── webhooks.spec.ts              # Stripe webhooks → HMAC → idempotencia → DB
├── load/
│   ├── k6/
│   │   ├── spike-test.js             # k6 spike: 0→500→0 usuarios
│   │   └── checkout-load.js          # k6 load: checkout completo bajo carga
│   └── scenarios/
│       └── catalog-browse.js         # k6 scenario: navegación de catálogo sostenida
├── performance/
│   ├── lighthouse/
│   │   └── lighthouse.config.json    # Lighthouse CI: Core Web Vitals thresholds
│   └── bundlesize/
│       └── bundlesize.config.json    # Bundle size budgets por ruta
├── smoke/
│   └── health-check.spec.ts          # Health checks: web, API, admin, productos
├── security/
│   └── owasp-top10.spec.ts           # OWASP Top 10: XSS, SQLi, CSRF, headers, SSRF, auth
└── README.md
```

## Ejecución

```bash
# E2E
pnpm exec playwright test --config tests/e2e/playwright.config.ts

# E2E — solo checkout flow
pnpm exec playwright test --config tests/e2e/playwright.config.ts checkout

# E2E — headed (navegador visible)
pnpm exec playwright test --config tests/e2e/playwright.config.ts --headed

# Integration (Vitest)
pnpm exec vitest run tests/integration/

# Smoke
pnpm exec playwright test tests/smoke/health-check.spec.ts

# Security
pnpm exec playwright test tests/security/owasp-top10.spec.ts

# Load (k6)
k6 run tests/load/k6/checkout-load.js
k6 run tests/load/k6/spike-test.js

# Performance (Lighthouse CI)
lhci autorun --config=tests/performance/lighthouse/lighthouse.config.json

# Bundle size
bundlesize --config tests/performance/bundlesize/bundlesize.config.json
```

## Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `WEB_BASE_URL` | `http://localhost:3000` | URL del storefront |
| `ADMIN_BASE_URL` | `http://localhost:3001` | URL del admin |
| `API_BASE_URL` | `http://localhost:3002` | URL de la API Hono |
| `TEST_DATABASE_URL` | `postgresql://test:test@localhost:5432/pranakaia_test` | DB de test |
| `TEST_REDIS_URL` | `redis://localhost:6379/1` | Redis de test |
| `ADMIN_SEED_TOKEN` | `test-admin-token` | Token para seed de datos admin |

## Principios

1. **No duplicación** — Cada flujo de usuario tiene un solo archivo spec
2. **Resilient selectors** — `data-testid` + ARIA roles con fallback `.or()`
3. **Chilean locale** — Direcciones, RUT, IVA 19%, CLP
4. **Idempotencia** — Webhooks y mutaciones son idempotentes por diseño
5. **Real DB integration** — Los tests de integración tocan PostgreSQL real vía Drizzle
6. **k6 para carga** — Scripts JS ejecutables con `k6 run`, no YAMLs estáticos
7. **OWASP Top 10** — Cobertura de seguridad mapeada a las 10 categorías OWASP 2021
