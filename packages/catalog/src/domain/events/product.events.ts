import { DomainEventBase } from '@pranakaia/shared-kernel';

/**
 * Emitted when a new product is created in the catalog.
 *
 * @example
 * ```ts
 * const event = new ProductCreated(productId, 'CAM-ECO-M', 'Camiseta Eco', 29990);
 * ```
 */
export class ProductCreated extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly sku: string,
    readonly name: string,
    readonly price: number,
  ) {
    super('ProductCreated', aggregateId, 1);
  }
}

/**
 * Emitted when a product's price is changed.
 *
 * @example
 * ```ts
 * const event = new ProductPriceChanged(productId, 29990, 24990);
 * ```
 */
export class ProductPriceChanged extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly oldPrice: number,
    readonly newPrice: number,
  ) {
    super('ProductPriceChanged', aggregateId, 1);
  }
}

/**
 * Emitted when a product's stock quantity is updated.
 *
 * @example
 * ```ts
 * const event = new ProductStockUpdated(productId, 50, 'IN_STOCK', 'IN_STOCK');
 * ```
 */
export class ProductStockUpdated extends DomainEventBase {
  constructor(
    aggregateId: string,
    readonly quantity: number,
    readonly oldStatus: string,
    readonly newStatus: string,
  ) {
    super('ProductStockUpdated', aggregateId, 1);
  }
}

/** Emitted when a product is published and becomes visible in the storefront. */
export class ProductPublished extends DomainEventBase {
  constructor(aggregateId: string) {
    super('ProductPublished', aggregateId, 1);
  }
}

/** Emitted when a product is archived and removed from the storefront. */
export class ProductArchived extends DomainEventBase {
  constructor(aggregateId: string) {
    super('ProductArchived', aggregateId, 1);
  }
}

/** Union type of all catalog domain events. */
export type ProductEvent =
  | ProductCreated
  | ProductPriceChanged
  | ProductStockUpdated
  | ProductPublished
  | ProductArchived;
