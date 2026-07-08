/**
 * OrderItem Value Object — Checkout Bounded Context
 *
 * Snapshot pattern: OrderItem is an immutable copy of product data
 * at the moment the order was placed. It does NOT reference the
 * Product aggregate from @pranakaia/catalog — it owns its own data.
 *
 * This is intentional. Order history must be preserved even if the
 * original product is deleted, renamed or repriced.
 *
 * @example
 * ```ts
 * const item = OrderItem.create({
 *   id: OrderItemId.generate(),
 *   productId: 'prod_1',
 *   name: 'Camiseta Eco',
 *   sku: 'CAM-ECO-M',
 *   unitPrice: moneySnapshot(29990, 'CLP'),
 *   quantity: 2,
 * });
 * if (item.isSuccess) {
 *   console.log(item.getValue().subtotal); // { amount: 59980, currency: 'CLP' }
 * }
 * ```
 */
import { Result, ValueObject } from '@pranakaia/shared-kernel';

// ── Money snapshot (owned by checkout — no @pranakaia/catalog import) ──────

/**
 * Immutable money representation for order snapshots.
 * Owned by checkout — does not import Money from shared-kernel
 * to keep order history independent of Money VO evolution.
 *
 * @example
 * ```ts
 * const price: MoneySnapshot = moneySnapshot(29990, 'CLP');
 * ```
 */
export interface MoneySnapshot {
  readonly amount: number;
  readonly currency: string;
}

/** Creates a frozen MoneySnapshot. */
export function moneySnapshot(amount: number, currency: string): MoneySnapshot {
  return Object.freeze({ amount, currency });
}

/** Adds two MoneySnapshots of the same currency. Returns err on mismatch. */
export function addMoney(a: MoneySnapshot, b: MoneySnapshot): Result<MoneySnapshot, Error> {
  if (a.currency !== b.currency) {
    return Result.err(new Error('Currency mismatch'));
  }
  return Result.ok(moneySnapshot(a.amount + b.amount, a.currency));
}

/** Multiplies a MoneySnapshot by a quantity (line total). */
export function multiplyMoney(m: MoneySnapshot, qty: number): MoneySnapshot {
  return moneySnapshot(Math.round(m.amount * qty * 100) / 100, m.currency);
}

// ── OrderItemId branded type ────────────────────────────────────────────────

/** Branded type for OrderItem identifiers. */
export type OrderItemId = string & { readonly __brand: 'OrderItemId' };

/**
 * Factory namespace for OrderItemId.
 *
 * @example
 * ```ts
 * const id = OrderItemId.generate(); // oi_1715566800000_abc123
 * const fromDb = OrderItemId.from('oi_42');
 * ```
 */
export const OrderItemId = {
  /** Generates a new unique OrderItemId. */
  generate: (): OrderItemId =>
    `oi_${Date.now()}_${Math.random().toString(36).substring(2, 11)}` as OrderItemId,
  /** Creates an OrderItemId from a trusted string. */
  from: (value: string): OrderItemId => value as OrderItemId,
};

// ── OrderItem props (snapshot — frozen at order time) ──────────────────────

/** Immutable properties of an order line item. */
export interface OrderItemProps {
  readonly id: OrderItemId;
  readonly productId: string;
  readonly name: string;
  readonly sku: string;
  readonly unitPrice: MoneySnapshot;
  readonly quantity: number;
  readonly imageUrl?: string;
}

// ── OrderItem Value Object ──────────────────────────────────────────────────

/**
 * Immutable order line item using the Snapshot pattern.
 *
 * @example
 * ```ts
 * const result = OrderItem.create({
 *   id: OrderItemId.generate(),
 *   productId: 'prod_1',
 *   name: 'Camiseta Eco',
 *   sku: 'CAM-ECO-M',
 *   unitPrice: moneySnapshot(29990, 'CLP'),
 *   quantity: 2,
 * });
 * ```
 */
export class OrderItem extends ValueObject<OrderItemProps> {
  private constructor(props: OrderItemProps) {
    super(props);
  }

  /**
   * Creates a validated OrderItem. Returns err for invalid input.
   *
   * @example
   * ```ts
   * const item = OrderItem.create({ ... });
   * if (item.isFailure) console.error(item.errorValue);
   * ```
   */
  static create(props: OrderItemProps): Result<OrderItem, Error> {
    if (props.quantity <= 0) {
      return Result.err(new Error('Quantity must be positive'));
    }
    if (props.unitPrice.amount <= 0) {
      return Result.err(new Error('Unit price must be positive'));
    }
    if (!props.name.trim()) {
      return Result.err(new Error('Product name is required'));
    }
    if (!props.productId.trim()) {
      return Result.err(new Error('ProductId is required'));
    }
    return Result.ok(new OrderItem(Object.freeze({ ...props })));
  }

  /** Line subtotal (unitPrice × quantity). */
  get subtotal(): MoneySnapshot {
    return multiplyMoney(this._value.unitPrice, this._value.quantity);
  }

  get id(): OrderItemId {
    return this._value.id;
  }
  get productId(): string {
    return this._value.productId;
  }
  get name(): string {
    return this._value.name;
  }
  get sku(): string {
    return this._value.sku;
  }
  get unitPrice(): MoneySnapshot {
    return this._value.unitPrice;
  }
  get quantity(): number {
    return this._value.quantity;
  }
  get imageUrl(): string | undefined {
    return this._value.imageUrl;
  }

  /** Serializes to plain object including computed subtotal. */
  toPrimitives() {
    return {
      id: this._value.id,
      productId: this._value.productId,
      name: this._value.name,
      sku: this._value.sku,
      unitPrice: this._value.unitPrice,
      quantity: this._value.quantity,
      subtotal: this.subtotal,
      imageUrl: this._value.imageUrl,
    };
  }
}
