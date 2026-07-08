import { DomainError } from '@pranakaia/shared-kernel';

/**
 * Error returned when a product name is invalid.
 *
 * @example
 * ```ts
 * return Result.err(new InvalidProductNameError('A'));
 * ```
 */
export class InvalidProductNameError extends DomainError {
  declare name: 'InvalidProductNameError';
  constructor(name: string) {
    super(
      `Product name "${name}" is invalid. Must be at least 2 characters.`,
      'INVALID_PRODUCT_NAME',
      { name },
    );
    this.name = 'InvalidProductNameError';
  }
}

/**
 * Error returned when a product description is invalid.
 *
 * @example
 * ```ts
 * return Result.err(new InvalidProductDescriptionError('short'));
 * ```
 */
export class InvalidProductDescriptionError extends DomainError {
  declare name: 'InvalidProductDescriptionError';
  constructor(description: string) {
    super(
      'Product description is too short. Must be at least 10 characters.',
      'INVALID_PRODUCT_DESCRIPTION',
      { length: description.length },
    );
    this.name = 'InvalidProductDescriptionError';
  }
}

/**
 * Error returned when a product price operation is invalid.
 *
 * @example
 * ```ts
 * return Result.err(new InvalidProductPriceError('Price cannot be negative'));
 * ```
 */
export class InvalidProductPriceError extends DomainError {
  declare name: 'InvalidProductPriceError';
  constructor(message: string) {
    super(message, 'INVALID_PRODUCT_PRICE');
    this.name = 'InvalidProductPriceError';
  }
}

/**
 * Error returned when a product stock operation is invalid.
 *
 * @example
 * ```ts
 * return Result.err(new InvalidStockQuantityError(-5));
 * ```
 */
export class InvalidStockQuantityError extends DomainError {
  declare name: 'InvalidStockQuantityError';
  constructor(quantity: number) {
    super(`Stock quantity "${quantity}" cannot be negative.`, 'INVALID_STOCK_QUANTITY', {
      quantity,
    });
    this.name = 'InvalidStockQuantityError';
  }
}

/**
 * Error returned when an invalid status transition is attempted.
 *
 * @example
 * ```ts
 * return Result.err(new InvalidStatusTransitionError('ARCHIVED', 'PUBLISHED', 'Cannot publish archived product'));
 * ```
 */
export class InvalidStatusTransitionError extends DomainError {
  declare name: 'InvalidStatusTransitionError';
  constructor(from: string, to: string, reason: string) {
    super(
      `Cannot transition product from ${from} to ${to}: ${reason}`,
      'INVALID_STATUS_TRANSITION',
      { from, to, reason },
    );
    this.name = 'InvalidStatusTransitionError';
  }
}

/**
 * Error returned when a product cannot be found.
 *
 * @example
 * ```ts
 * return Result.err(new ProductNotFoundError('prod_123'));
 * ```
 */
export class ProductNotFoundError extends DomainError {
  declare name: 'ProductNotFoundError';
  constructor(id: string) {
    super(`Product with ID "${id}" was not found.`, 'PRODUCT_NOT_FOUND', { id });
    this.name = 'ProductNotFoundError';
  }
}
