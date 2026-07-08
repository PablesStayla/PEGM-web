# @pranakaia/inventory

**Inventory Bounded Context** — Gestión de stock, scrapers y sincronización reactiva para PranaKaia Dropshipping.

## Instalación

```bash
pnpm add @pranakaia/inventory
```

## Uso

```typescript
import { Inventory, Stock } from '@pranakaia/inventory/entities'
import { InventorySyncService } from '@pranakaia/inventory/services'
```

## Exports

| Export | Descripción |
|--------|-------------|
| `@pranakaia/inventory` | Barrel export principal |
| `@pranakaia/inventory/entities` | Inventory, Stock entities |
| `@pranakaia/inventory/services` | Sync services, scrapers |

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
