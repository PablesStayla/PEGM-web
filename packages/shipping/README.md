# @pranakaia/shipping

**Shipping Bounded Context** — Cálculo de envíos e integración con carriers.

## Instalación

```bash
pnpm add @pranakaia/shipping
```

## Uso

```typescript
import { ShippingService } from '@pranakaia/shipping'
import { ShippingCarrier } from '@pranakaia/shipping/ports'
```

## Exports

| Export | Descripción |
|--------|-------------|
| `@pranakaia/shipping` | Barrel export principal |
| `@pranakaia/shipping/ports` | Carrier ports |

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
