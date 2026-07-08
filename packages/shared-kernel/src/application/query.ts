/**
 * Query Pattern — CQRS read side.
 *
 * Queries represent intent to read state without side effects.
 * They are handled by {@link QueryHandler} implementations and return a {@link Result}.
 *
 * @module @pranakaia/shared-kernel/query
 */

import type { Result } from '../domain/result';

/**
 * Query interface for CQRS read operations.
 *
 * @template TResponse - The data returned by the query.
 *
 * @example
 * ```ts
 * class GetCartQuery implements Query<Cart> {
 *   async execute(): Promise<Result<Cart>> { ... }
 * }
 * ```
 */
export interface Query<TResponse> {
  execute(): Promise<Result<TResponse>>;
}

/**
 * Handler that processes a query and returns data.
 *
 * @template TQuery - The query type to handle.
 * @template TResponse - The data returned by the query.
 *
 * @example
 * ```ts
 * class GetCartHandler implements QueryHandler<GetCartQuery, Cart> {
 *   async execute(query: GetCartQuery): Promise<Result<Cart>> { ... }
 * }
 * ```
 */
export interface QueryHandler<TQuery, TResponse> {
  execute(query: TQuery): Promise<Result<TResponse>>;
}

/**
 * Abstract base class for queries — provides a standard structure.
 *
 * @template TResponse - The data returned by the query.
 *
 * @example
 * ```ts
 * class FindUserQuery extends QueryBase<User> {
 *   async execute(): Promise<Result<User>> { ... }
 * }
 * ```
 */
export abstract class QueryBase<TResponse> implements Query<TResponse> {
  abstract execute(): Promise<Result<TResponse>>;
}
