# @pranakaia/catalog

**Catalog Bounded Context** — Gestión de productos, categorías y marcas para PranaKaia E-Commerce.

## Instalación

```bash
pnpm add @pranakaia/catalog
```

## Uso

```typescript
import { Product, Category, Brand } from '@pranakaia/catalog/entities'
import { ProductRepository } from '@pranakaia/catalog/ports'
import { ProductCreated } from '@pranakaia/catalog/events'
```

## Exports

| Export | Descripción |
|--------|-------------|
| `@pranakaia/catalog` | Barrel export principal |
| `@pranakaia/catalog/entities` | Product, Category, Brand entities |
| `@pranakaia/catalog/value-objects` | SKU, ProductName, Description VOs |
| `@pranakaia/catalog/ports` | Repository ports |
| `@pranakaia/catalog/events` | Domain events |

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
