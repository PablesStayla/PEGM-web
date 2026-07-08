/**
 * Command Pattern — CQRS write side.
 *
 * Commands represent intent to change state. They are handled by
 * {@link CommandHandler} implementations and return a {@link Result}.
 *
 * @module @pranakaia/shared-kernel/command
 */

import type { Result } from '../domain/result';

/**
 * Command interface for CQRS write operations.
 *
 * @template TResponse - The success payload type. Defaults to `void`.
 *
 * @example
 * ```ts
 * class AddToCartCommand implements Command<Cart> {
 *   async execute(): Promise<Result<Cart>> { ... }
 * }
 * ```
 */
export interface Command<TResponse = void> {
  execute(): Promise<Result<TResponse>>;
}

/**
 * Handler that processes a command and returns a result.
 *
 * @template TCommand - The command type to handle.
 * @template TResponse - The success payload type.
 *
 * @example
 * ```ts
 * class AddToCartHandler implements CommandHandler<AddToCartCommand, Cart> {
 *   async execute(cmd: AddToCartCommand): Promise<Result<Cart>> { ... }
 * }
 * ```
 */
export interface CommandHandler<TCommand, TResponse = void> {
  execute(command: TCommand): Promise<Result<TResponse>>;
}

/**
 * Abstract base class for commands — provides a standard structure.
 *
 * @template TResponse - The success payload type.
 *
 * @example
 * ```ts
 * class CreateOrderCommand extends CommandBase<Order> {
 *   async execute(): Promise<Result<Order>> { ... }
 * }
 * ```
 */
export abstract class CommandBase<TResponse = void> implements Command<TResponse> {
  abstract execute(): Promise<Result<TResponse>>;
}
