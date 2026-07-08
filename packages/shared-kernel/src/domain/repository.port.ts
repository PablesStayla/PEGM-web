import type { Entity, EntityIdType } from './entity';
import type { Result } from './result';

/**
 * Generic repository port for aggregate persistence.
 *
 * All methods return `Result` to enforce explicit error handling — no throws.
 *
 * @template T - The entity/aggregate type.
 * @template ID - The identifier type.
 *
 * @example
 * ```ts
 * interface CartRepository extends RepositoryPort<Cart, CartId> {
 *   findByCustomerId(customerId: CustomerId): Promise<Result<Cart | null, Error>>;
 * }
 * ```
 */
export interface RepositoryPort<T extends Entity<ID>, ID extends EntityIdType> {
  /** Finds an entity by its identifier. Returns `null` if not found. */
  findById(id: ID): Promise<Result<T | null, Error>>;
  /** Finds all entities with optional pagination. */
  findAll(options?: { limit?: number; offset?: number }): Promise<Result<T[], Error>>;
  /** Persists an entity (insert or update). */
  save(entity: T): Promise<Result<void, Error>>;
  /** Deletes an entity by its identifier. */
  delete(id: ID): Promise<Result<void, Error>>;
  /** Checks if an entity with the given identifier exists. */
  exists(id: ID): Promise<Result<boolean, Error>>;
}

/**
 * Specification pattern — encapsulates a business rule as a predicate.
 *
 * @template T - The entity type the specification evaluates.
 *
 * @example
 * ```ts
 * const activeOnly: Specification<Product> = {
 *   isSatisfiedBy: (product) => product.status === 'PUBLISHED',
 * };
 * ```
 */
export interface Specification<T> {
  /** Evaluates whether the entity satisfies the specification. */
  isSatisfiedBy(entity: T): boolean;
}

/**
 * Extended repository port that supports specification-based queries.
 *
 * @template T - The entity/aggregate type.
 * @template ID - The identifier type.
 *
 * @example
 * ```ts
 * const products = await productRepo.findBySpec(activeOnly);
 * ```
 */
export interface SpecificationRepositoryPort<T extends Entity<ID>, ID extends EntityIdType>
  extends RepositoryPort<T, ID> {
  /** Finds all entities matching the given specification. */
  findBySpec(spec: Specification<T>): Promise<Result<T[], Error>>;
}
