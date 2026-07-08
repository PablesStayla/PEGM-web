# @pranakaia/payments

**Payments Bounded Context** — Procesamiento de pagos e integración con gateways.

## Instalación

```bash
pnpm add @pranakaia/payments
```

## Uso

```typescript
import { PaymentService } from '@pranakaia/payments'
import { PaymentGateway } from '@pranakaia/payments/ports'
```

## Exports

| Export | Descripción |
|--------|-------------|
| `@pranakaia/payments` | Barrel export principal |
| `@pranakaia/payments/ports` | Gateway ports |

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
