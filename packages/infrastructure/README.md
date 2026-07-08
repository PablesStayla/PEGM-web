# @pranakaia/infrastructure

**Infrastructure Layer** — Implementaciones concretas: base de datos, APIs, cache, autenticación, email, gateways.

## Instalación

```bash
pnpm add @pranakaia/infrastructure
```

## Uso

```typescript
import { Database, Redis, Logger } from '@pranakaia/infrastructure'
```

## Exports

| Export | Descripción |
|--------|-------------|
| `@pranakaia/infrastructure` | Barrel export principal |
| `@pranakaia/infrastructure/db` | Database layer |
| `@pranakaia/infrastructure/redis` | Redis cache |
| `@pranakaia/infrastructure/email` | Email service |
| `@pranakaia/infrastructure/supabase` | Supabase client |
| `@pranakaia/infrastructure/logger` | Logger |
| `@pranakaia/infrastructure/auth` | Authentication |
| `@pranakaia/infrastructure/gateways` | External gateways |
| `@pranakaia/infrastructure/inngest` | Background jobs |
| `@pranakaia/infrastructure/repositories` | Repository implementations |
| `@pranakaia/infrastructure/circuit-breaker` | Circuit breaker pattern |
| `@pranakaia/infrastructure/cqrs` | CQRS utilities |
| `@pranakaia/infrastructure/event-bus` | Event bus |
| `@pranakaia/infrastructure/idempotency` | Idempotency handling |
| `@pranakaia/infrastructure/outbox` | Outbox pattern |
| `@pranakaia/infrastructure/saga` | Saga pattern |
| `@pranakaia/infrastructure/specification` | Specifications |
| `@pranakaia/infrastructure/shipping` | Shipping providers |
| `@pranakaia/infrastructure/payments` | Payment providers |
| `@pranakaia/infrastructure/cart` | Cart infrastructure |

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
