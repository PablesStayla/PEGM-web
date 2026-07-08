# @pranakaia/cart

**Cart Bounded Context** — Gestión del carrito de compras para PranaKaia E-Commerce.

## Instalación

```bash
pnpm add @pranakaia/cart
```

## Uso

```typescript
import { Cart, CartItem } from '@pranakaia/cart/entities'
import { CartRepository } from '@pranakaia/cart/ports'
```

## Exports

| Export | Descripción |
|--------|-------------|
| `@pranakaia/cart` | Barrel export principal |
| `@pranakaia/cart/entities` | Cart, CartItem entities |
| `@pranakaia/cart/ports` | Repository ports |

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
