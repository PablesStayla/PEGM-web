# @pranakaia/shared-kernel

**Shared Kernel** — Núcleo compartido del monorepo PranaKaia. Contiene los fundamentos del Domain-Driven Design:

- **Result Pattern**: Railway-oriented programming sin excepciones
- **Branded Types**: Type safety para IDs (ProductId, OrderId, etc.)
- **Entity**: Clase base para entidades del dominio
- **Value Object**: Base para objetos de valor
- **Domain Events**: Sistema de eventos de dominio
- **Application Layer**: Use cases, commands, queries

## Instalación

```bash
pnpm add @pranakaia/shared-kernel
```

## Uso

### Result Pattern

```typescript
import { Result } from '@pranakaia/shared-kernel'

const success = Result.success('data')
const error = Result.error(new Error('message'))

// Pattern matching
result.match({
  success: (data) => console.log(data),
  error: (error) => console.error(error),
})
```

### Branded Types

```typescript
import { Brand } from '@pranakaia/shared-kernel'

type ProductId = Brand<string, 'ProductId'>
type OrderId = Brand<string, 'OrderId'>

const productId: ProductId = Brand.create<ProductId>('prod_123')
```

### Domain Events

```typescript
import { DomainEvent } from '@pranakaia/shared-kernel'

class ProductCreated implements DomainEvent {
  readonly timestamp: Date
  readonly productId: string
  
  constructor(productId: string) {
    this.productId = productId
    this.timestamp = new Date()
  }
}
```

## API Exports

| Export | Descripción |
|--------|-------------|
| `@pranakaia/shared-kernel` | Barrel export principal |
| `@pranakaia/shared-kernel/result` | Result pattern |
| `@pranakaia/shared-kernel/branded` | Branded types |
| `@pranakaia/shared-kernel/entity` | Entity base class |
| `@pranakaia/shared-kernel/value-object` | Value object base |
| `@pranakaia/shared-kernel/domain-error` | Domain error base |
| `@pranakaia/shared-kernel/events` | Domain events |
| `@pranakaia/shared-kernel/application` | Application layer |
| `@pranakaia/shared-kernel/domain` | Domain layer |

## Development

```bash
# Build
pnpm build

# Type check
pnpm type-check

# Test
pnpm test
pnpm test:coverage

# Lint
pnpm lint
pnpm format

# Validate package
pnpm attw
pnpm publint
```

## License

MIT © PranaKaia
