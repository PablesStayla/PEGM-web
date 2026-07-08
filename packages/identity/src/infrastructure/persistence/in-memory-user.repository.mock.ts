import { Result } from '@pranakaia/shared-kernel';
import type { Email } from '../../domain/user/email.vo';
import type { User } from '../../domain/user/user.entity';
import type { UserRepositoryPort } from '../../domain/user/user.repository.port';
import type { UserId } from '../../domain/user/user-id.vo';

export class InMemoryUserRepository implements UserRepositoryPort {
  private users: Map<string, User> = new Map();

  async findById(id: UserId): Promise<Result<User | null, Error>> {
    const user = this.users.get(id) || null;
    return Result.ok(user);
  }

  async findByIdOrThrow(id: UserId): Promise<Result<User, Error>> {
    const user = this.users.get(id);
    if (!user) {
      return Result.err(new Error(`User ${id} not found`));
    }
    return Result.ok(user);
  }

  async findByEmail(email: Email): Promise<Result<User | null, Error>> {
    const user = Array.from(this.users.values()).find((u) => u.email.value === email.value);
    return Result.ok(user || null);
  }

  async existsByEmail(email: Email): Promise<Result<boolean, Error>> {
    const exists = Array.from(this.users.values()).some((u) => u.email.value === email.value);
    return Result.ok(exists);
  }

  async save(user: User): Promise<Result<void, Error>> {
    this.users.set(user.id, user);
    return Result.ok(undefined);
  }

  async update(user: User): Promise<Result<void, Error>> {
    this.users.set(user.id, user);
    return Result.ok(undefined);
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<Result<User[], Error>> {
    let users = Array.from(this.users.values());
    if (options?.offset !== undefined) {
      users = users.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      users = users.slice(0, options.limit);
    }
    return Result.ok(users);
  }

  async exists(id: UserId): Promise<Result<boolean, Error>> {
    return Result.ok(this.users.has(id));
  }

  async delete(id: UserId): Promise<Result<void, Error>> {
    this.users.delete(id);
    return Result.ok(undefined);
  }

  // Test helpers
  clear(): void {
    this.users.clear();
  }

  count(): number {
    return this.users.size;
  }
}
