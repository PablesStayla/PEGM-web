# @pranakaia/checkout

**Checkout Bounded Context** — Procesamiento de pedidos y flujo de pago.

## Instalación

```bash
pnpm add @pranakaia/checkout
```

## Uso

```typescript
import { Order, OrderItem } from '@pranakaia/checkout/entities'
import { OrderRepository } from '@pranakaia/checkout/ports'
```

## Exports

| Export | Descripción |
|--------|-------------|
| `@pranakaia/checkout` | Barrel export principal |
| `@pranakaia/checkout/entities` | Order, OrderItem entities |
| `@pranakaia/checkout/ports` | Repository ports |

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
