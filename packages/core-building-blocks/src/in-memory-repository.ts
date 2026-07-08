import type { Entity, EntityIdType, RepositoryPort } from '@pranakaia/shared-kernel';
import { Result } from '@pranakaia/shared-kernel';

/**
 * In-memory implementation of `RepositoryPort` for testing and prototyping.
 *
 * Provides a fully-functional repository backed by a `Map`, enabling
 * deterministic unit tests without database infrastructure.
 *
 * @template T - The entity type stored in the repository.
 * @template ID - The entity identifier type.
 *
 * @example
 * ```ts
 * const repo = new InMemoryRepository<Cart, CartId>(c => c.id);
 * await repo.save(cart);
 * const found = await repo.findById(cartId);
 * ```
 */
export class InMemoryRepository<T extends Entity<ID>, ID extends EntityIdType>
  implements RepositoryPort<T, ID>
{
  protected readonly store: Map<string, T> = new Map();

  constructor(private readonly extractId: (entity: T) => ID) {}

  async findById(id: ID): Promise<Result<T | null, Error>> {
    const key = this.toKey(id);
    const entity = this.store.get(key) ?? null;
    return Result.ok(entity);
  }

  async findAll(_options?: { limit?: number; offset?: number }): Promise<Result<T[], Error>> {
    const all = [...this.store.values()];
    return Result.ok(all);
  }

  async save(entity: T): Promise<Result<void, Error>> {
    const key = this.toKey(this.extractId(entity));
    this.store.set(key, entity);
    return Result.ok(undefined);
  }

  async delete(id: ID): Promise<Result<void, Error>> {
    const key = this.toKey(id);
    this.store.delete(key);
    return Result.ok(undefined);
  }

  async exists(id: ID): Promise<Result<boolean, Error>> {
    const key = this.toKey(id);
    return Result.ok(this.store.has(key));
  }

  /** Clears all stored entities. Useful between test cases. */
  clear(): void {
    this.store.clear();
  }

  /** Returns the number of stored entities. */
  get count(): number {
    return this.store.size;
  }

  private toKey(id: ID): string {
    if (typeof id === 'string') {
      return id;
    }
    if (typeof id === 'object' && id !== null && 'value' in id) {
      return String((id as { value: unknown }).value);
    }
    return String(id);
  }
}
