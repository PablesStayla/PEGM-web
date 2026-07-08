/**
 * Use Case Pattern — Application Layer orchestration.
 *
 * Use cases encapsulate a single application-level operation,
 * coordinating domain objects and infrastructure ports.
 *
 * @module @pranakaia/shared-kernel/use-case
 */

import type { Result } from '../domain/result';

/**
 * Use case interface for application-level operations.
 *
 * @template TInput - The input/command DTO type.
 * @template TOutput - The output/result DTO type.
 *
 * @example
 * ```ts
 * class CheckoutUseCase implements UseCase<CheckoutCommand, Order> {
 *   async execute(cmd: CheckoutCommand): Promise<Result<Order>> { ... }
 * }
 * ```
 */
export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<Result<TOutput>>;
}

/**
 * Abstract base class for use cases — provides a standard structure.
 *
 * @template TInput - The input/command DTO type.
 * @template TOutput - The output/result DTO type.
 *
 * @example
 * ```ts
 * class PlaceOrderUseCase extends UseCaseBase<PlaceOrderInput, Order> {
 *   async execute(input: PlaceOrderInput): Promise<Result<Order>> { ... }
 * }
 * ```
 */
export abstract class UseCaseBase<TInput, TOutput> implements UseCase<TInput, TOutput> {
  abstract execute(input: TInput): Promise<Result<TOutput>>;
}
