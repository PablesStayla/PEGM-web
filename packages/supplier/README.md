# @pranakaia/supplier

**Supplier Bounded Context** — Gestión de proveedores e integración dropshipping.

## Instalación

```bash
pnpm add @pranakaia/supplier
```

## Uso

```typescript
import { Supplier, SupplierProduct } from '@pranakaia/supplier/entities'
import { SupplierRepository } from '@pranakaia/supplier/ports'
```

## Exports

| Export | Descripción |
|--------|-------------|
| `@pranakaia/supplier` | Barrel export principal |
| `@pranakaia/supplier/entities` | Supplier, SupplierProduct entities |
| `@pranakaia/supplier/value-objects` | Supplier VOs |
| `@pranakaia/supplier/ports` | Repository ports |

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
