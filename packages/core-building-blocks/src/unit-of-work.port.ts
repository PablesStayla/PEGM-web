import { Result } from '@pranakaia/shared-kernel';

/**
 * Unit of Work port for transactional boundaries.
 *
 * Coordinates commit/rollback semantics across multiple repositories,
 * ensuring atomicity for operations that span aggregates (e.g.
 * payment capture + order confirmation + inventory decrement).
 *
 * Implementations wrap a database transaction, message broker
 * transaction, or any other atomic boundary.
 *
 * @example
 * ```ts
 * class DrizzleUnitOfWork implements UnitOfWorkPort {
 *   async begin() { this.tx = await this.db.transaction(); }
 *   async commit() { await this.tx.commit(); }
 *   async rollback() { await this.tx.rollback(); }
 * }
 * ```
 */
export interface UnitOfWorkPort {
  /**
   * Begins a transactional boundary.
   * All repository operations within the same UoW share this boundary.
   */
  begin(): Promise<Result<void, Error>>;

  /**
   * Commits all pending changes within the boundary.
   * After commit, the UoW is no longer active.
   */
  commit(): Promise<Result<void, Error>>;

  /**
   * Rolls back all pending changes within the boundary.
   * After rollback, the UoW is no longer active.
   */
  rollback(): Promise<Result<void, Error>>;

  /** Returns true if a transactional boundary is currently active. */
  isActive(): boolean;
}

/**
 * Decorator that runs `fn` inside a Unit of Work.
 *
 * Automatically begins, commits on success, and rolls back on failure.
 * If the callback returns a failed `Result`, the UoW is rolled back.
 *
 * @example
 * ```ts
 * const result = await withUnitOfWork(uow, async () => {
 *   const order = await orderRepo.save(order);
 *   if (order.isFailure()) return order;
 *   const inventory = await inventoryRepo.save(inventory);
 *   return inventory;
 * });
 * ```
 */
async function commitOrRollback<T>(
  uow: UnitOfWorkPort,
  result: Result<T, Error>,
): Promise<Result<T, Error>> {
  if (result.isFailure) {
    await uow.rollback();
    return result;
  }
  const commitResult = await uow.commit();
  if (commitResult.isFailure) {
    await uow.rollback();
    return Result.fail(commitResult.errorValue);
  }
  return result;
}

export async function withUnitOfWork<T>(
  uow: UnitOfWorkPort,
  fn: () => Promise<Result<T, Error>>,
): Promise<Result<T, Error>> {
  const beginResult = await uow.begin();
  if (beginResult.isFailure) {
    return Result.fail(beginResult.errorValue);
  }

  try {
    const result = await fn();
    return commitOrRollback(uow, result);
  } catch (error) {
    await uow.rollback();
    return Result.fail(error instanceof Error ? error : new Error(String(error)));
  }
}
