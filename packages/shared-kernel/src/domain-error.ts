import { DomainError as BaseDomainError } from './domain/result';

export { BaseDomainError as DomainError };

/**
 * Error thrown when an entity is not found in the persistence store.
 *
 * @example
 * ```ts
 * return Result.err(new NotFoundError('User', userId));
 * ```
 */
export class NotFoundError extends BaseDomainError {
  constructor(entity: string, id?: string) {
    super(id ? `${entity} not found: ${id}` : `${entity} not found`, 'NOT_FOUND', { entity, id });
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when input validation fails.
 *
 * @example
 * ```ts
 * return Result.err(new ValidationError('Email is required', 'email', value));
 * ```
 */
export class ValidationError extends BaseDomainError {
  constructor(message: string, field?: string, value?: unknown) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when a user lacks permission for an action.
 *
 * @example
 * ```ts
 * return Result.err(new UnauthorizedError('Cannot delete another user'));
 * ```
 */
export class UnauthorizedError extends BaseDomainError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error thrown when a user is not authenticated.
 *
 * @example
 * ```ts
 * return Result.err(new AuthenticationError());
 * ```
 */
export class AuthenticationError extends BaseDomainError {
  constructor(message = 'Not authenticated') {
    super(message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when a concurrency or uniqueness conflict occurs.
 *
 * @example
 * ```ts
 * return Result.err(new ConflictError('User already exists', 'User', email));
 * ```
 */
export class ConflictError extends BaseDomainError {
  constructor(message: string, entity?: string, id?: string) {
    super(message, 'CONFLICT', { entity, id });
    this.name = 'ConflictError';
  }
}
