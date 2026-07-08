import { DomainError } from '@pranakaia/shared-kernel';

/** Base error for all cart domain failures. */
export class CartError extends DomainError {
  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message, `CART_${code}`, context);
    this.name = 'CartError';
  }
}

/** Thrown when cart creation or mutation input fails structural validation. */
export class CartValidationError extends CartError {
  constructor(details: string, context?: Record<string, unknown>) {
    super(`Validation failed: ${details}`, 'VALIDATION_FAILED', context);
    this.name = 'CartValidationError';
  }
}
