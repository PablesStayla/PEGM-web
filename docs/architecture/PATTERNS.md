# PATTERNS.md — Patterns Arquitectónicos

> Uso obligatorio en toda la base de código. Sin excepción.

---

## 1. Result Pattern (Railway-Oriented Programming)

### Descripción

Toda operación que pueda fallar retorna `Result<T, E>` en lugar de lanzar excepciones. El manejo de errores es explícito y componible, nunca por try/catch fuera del dominio.

### Código

```typescript
// packages/shared-kernel/src/result.vo.ts

export type Result<T, E extends Error = DomainError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Factory functions
export function success<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function failure<E extends Error>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Combinators
export function map<T, U, E extends Error>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (!result.ok) return result;
  return success(fn(result.value));
}

export function flatMap<T, U, E extends Error>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (!result.ok) return result;
  return fn(result.value);
}

export function match<T, E extends Error, R>(
  result: Result<T, E>,
  handlers: {
    ok: (value: T) => R;
    error: (error: E) => R;
  }
): R {
  return result.ok ? handlers.ok(result.value) : handlers.error(result.error);
}

// Pipeline helper
export function pipe<T, E extends Error>(
  initial: T,
  ...fns: Array<(value: T) => Result<T, E>>
): Result<T, E> {
  let current: Result<T, E> = success(initial);
  for (const fn of fns) {
    if (!current.ok) return current;
    current = fn(current.value);
  }
  return current;
}
```

### Reglas

1. **Nunca** lanzar excepciones en dominio o aplicación. Siempre `Result`.
2. **Solo** infraestructura captura excepciones y las convierte a `Result.failure`.
3. Usar `pipe` para secuencias lineales; `flatMap` para ramificaciones.
4. En Server Actions, hacer `match` al final para decidir respuesta (JSON vs redirect).

### Checklist de implementación

- [ ] ¿La función retorna `Result<T, E>` si puede fallar?
- [ ] ¿El error está tipado como un `DomainError` concreto?
- [ ] ¿Se evitó el `throw`?
- [ ] ¿Se usó `pipe` o `flatMap` para componer?

---

## 2. Branded Types (Type-Safe IDs)

### Descripción

Los IDs de dominio son branded types para que el compilador impida mezclar identificadores de distintas entidades. Un `ProductId` no es asignable a un `OrderId` aunque ambos sean strings.

### Código

```typescript
// packages/shared-kernel/src/branded.vo.ts

export type Brand<K, T> = K & { readonly __brand: T };

// ——— IDs de dominio ———
export type ProductId = Brand<string, 'ProductId'>;
export type OrderId = Brand<string, 'OrderId'>;
export type UserId = Brand<string, 'UserId'>;
export type CartId = Brand<string, 'CartId'>;
export type PaymentId = Brand<string, 'PaymentId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type CategoryId = Brand<string, 'CategoryId'>;

// Factory con validación
import { failure, Result, success } from './result.vo';

export class IdError extends Error {
  constructor(entity: string, raw: unknown) {
    super(`Invalid ${entity} id: ${String(raw)}`);
    this.name = 'IdError';
  }
}

export function createProductId(raw: string): Result<ProductId, IdError> {
  if (!raw || raw.trim().length === 0) {
    return failure(new IdError('ProductId', raw));
  }
  return success(raw as ProductId);
}

export function createOrderId(raw: string): Result<OrderId, IdError> {
  if (!raw || raw.trim().length === 0) {
    return failure(new IdError('OrderId', raw));
  }
  return success(raw as OrderId);
}

// ——— Helper genérico ———
export function createId<T extends Brand<string, unknown>>(
  entityName: string,
  raw: string
): Result<T, IdError> {
  if (!raw || raw.trim().length === 0) {
    return failure(new IdError(entityName, raw));
  }
  return success(raw as unknown as T);
}
```

### Reglas

1. Cada identidad de dominio tiene su propio Branded Type.
2. Solo se crean mediante factory functions que validan.
3. Prohibido castear `string as ProductId` fuera de las factories.
4. Los IDs son serializables (strings) — no usar objetos.

### Checklist de implementación

- [ ] ¿La entidad tiene un Branded Type para su ID?
- [ ] ¿El ID se crea con `createXxxId()`?
- [ ] ¿No hay casteos manuales en el resto del código?

---

## 3. Entity Pattern (Inmutable)

### Descripción

Las entidades de dominio son inmutables. En lugar de mutar propiedades, los métodos retornan una nueva instancia con el cambio aplicado. Esto elimina bugs por efectos laterales y facilita la trazabilidad.

### Código

```typescript
// packages/catalog/domain/product.entity.ts

import { ProductId, Money, ProductStatus } from './product.vo';

export interface ProductState {
  readonly id: ProductId;
  readonly name: string;
  readonly price: Money;
  readonly status: ProductStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Product {
  private constructor(private readonly state: ProductState) {}

  static create(props: {
    id: ProductId;
    name: string;
    price: Money;
    status: ProductStatus;
  }): Product {
    return new Product({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // ——— Getters ———
  get id(): ProductId {
    return this.state.id;
  }

  get name(): string {
    return this.state.name;
  }

  get price(): Money {
    return this.state.price;
  }

  get status(): ProductStatus {
    return this.state.status;
  }

  // ——— Comportamiento (siempre retorna nueva instancia) ———
  changePrice(newPrice: Money): Product {
    return new Product({ ...this.state, price: newPrice, updatedAt: new Date() });
  }

  publish(): Result<Product, DomainError> {
    if (this.state.status === ProductStatus.PUBLISHED) {
      return failure(new DomainError('Product is already published'));
    }
    return success(
      new Product({ ...this.state, status: ProductStatus.PUBLISHED, updatedAt: new Date() })
    );
  }

  archive(): Product {
    return new Product({ ...this.state, status: ProductStatus.ARCHIVED, updatedAt: new Date() });
  }

  // ——— Reconstrucción desde persistencia ———
  static reconstitute(state: ProductState): Product {
    return new Product(state);
  }
}
```

### Reglas

1. Constructor privado — solo `create()` y `reconstitute()` pueden instanciar.
2. `reconstitute()` es el único método que no valida (viene de BD, se asume válido).
3. Todos los métodos de comportamiento retornan `Product` (nueva instancia) o `Result<Product, E>`.
4. No hay setters. No hay `update()` genérico. Cada cambio es un método con nombre semántico.
5. `ProductState` es el contrato de serialización — se exporta para infraestructura.

### Checklist de implementación

- [ ] ¿Constructor es `private`?
- [ ] ¿Hay `static create()` y `static reconstitute()`?
- [ ] ¿Cada cambio de estado es un método nombrado (no `set field()`)?
- [ ] ¿Los métodos retornan nueva instancia o `Result`?

---

## 4. Value Object Pattern

### Descripción

Los Value Objects son inmutables, se comparan por valor, y encapsulan validación en su constructor. No tienen identidad propia.

### Código

```typescript
// packages/catalog/domain/money.vo.ts

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    Object.freeze(this);
  }

  static create(amount: number, currency: string = 'CLP'): Result<Money, MoneyError> {
    if (!Number.isFinite(amount) || amount < 0) {
      return failure(new MoneyError('Amount must be a positive finite number'));
    }
    if (currency.length !== 3 || currency !== currency.toUpperCase()) {
      return failure(new MoneyError('Currency must be a 3-letter ISO code'));
    }
    return success(new Money(amount, currency));
  }

  // ——— Comportamiento ———
  add(other: Money): Result<Money, MoneyError> {
    if (this.currency !== other.currency) {
      return failure(new MoneyError('Cannot add different currencies'));
    }
    return Money.create(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Result<Money, MoneyError> {
    return Money.create(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toJSON(): { amount: number; currency: string } {
    return { amount: this.amount, currency: this.currency };
  }
}

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MoneyError';
  }
}
```

### Reglas

1. Constructor privado — solo `create()` con validación.
2. `Object.freeze(this)` en constructor.
3. `equals()` para comparación por valor (no `===`).
4. `toJSON()` para serialización explícita.
5. Inmutabilidad garantizada: `readonly` en propiedades públicas.

### Checklist de implementación

- [ ] ¿Constructor privado?
- [ ] ¿Validación en `create()`?
- [ ] ¿`Object.freeze(this)`?
- [ ] ¿Implementa `equals()` y `toJSON()`?
- [ ] ¿Propiedades `readonly`?

---

## 5. Orchestrator Pattern (Service Modularization)

### Descripción

Los servicios complejos (especialmente en la capa de Aplicación) deben evitar convertirse en "God Objects". Se utiliza un **Orquestador** que delega la lógica pesada a servicios especializados internos.

### Código

```typescript
// packages/application/src/checkout/checkout.service.ts

export class CheckoutService {
  constructor(
    private readonly validator: CheckoutValidator,
    private readonly paymentService: CheckoutPaymentService,
    // ...
  ) {}

  async processCheckout(cartId: CartId): Promise<Result<Order, CheckoutError>> {
    // 1. Delegar validación
    const validation = await this.validator.validate(cartId);
    if (!validation.ok) return validation;

    // 2. Orquestar lógica
    const order = await this.createOrder(validation.value);
    
    // 3. Delegar pago
    return this.paymentService.processPayment(order);
  }
}
```

### Reglas

1. El orquestador **no contiene** lógica de validación compleja (usa un `Validator`).
2. El orquestador **no contiene** lógica de integración directa con pasarelas (usa un `PaymentService`).
3. El orquestador **coordina** el flujo de datos entre los servicios especializados.
4. Cada servicio especializado tiene una responsabilidad única y clara.

### Checklist de implementación

- [ ] ¿El servicio principal delega la validación a un `Validator`?
- [ ] ¿La lógica de integración externa está en un servicio especializado (ej: `PaymentService`)?
- [ ] ¿El orquestador solo maneja el flujo de éxito/error (Railway) y la coordinación?

---

## Sufijos de archivo

| Sufijo         | Tipo                  | Ejemplo                        |
|----------------|-----------------------|--------------------------------|
| `*.entity.ts`  | Entity (DDD)          | `product.entity.ts`            |
| `*.vo.ts`      | Value Object          | `money.vo.ts`                  |
| `*.use-case.ts`| Caso de uso           | `add-to-cart.use-case.ts`      |
| `*.port.ts`    | Puerto (interfaz)     | `product-repository.port.ts`   |
| `*.adapter.ts` | Adaptador (impl.)     | `drizzle-product.adapter.ts`   |
| `*.event.ts`   | Domain Event          | `order-placed.event.ts`        |
| `*.aggregate.ts`| Aggregate Root       | `cart.aggregate.ts`            |
| `*.service.ts` | Servicio (Orquestador)| `checkout.service.ts`          |
| `*.validator.ts`| Validador especializado| `checkout.validator.ts`        |
| `*.builder.ts` | Builder de dominio    | `order.builder.ts`             |
| `*.dto.ts`     | Data Transfer Object  | `create-order.dto.ts`          |
| `*.schema.ts`  | Esquema Drizzle/Zod   | `product.schema.ts`            |