/**
 * User Repository Port — Repository Pattern
 *
 * Interface defined in domain layer.
 * Implementation in infrastructure layer.
 */
import type { RepositoryPort, Result } from '@pranakaia/shared-kernel';
import type { Email } from './email.vo';
import type { User } from './user.entity';
import type { UserId } from './user-id.vo';

/**
 * Repository port for User persistence.
 *
 * @example
 * ```ts
 * class DrizzleUserRepository implements UserRepositoryPort {
 *   async findByEmail(email) { ... }
 *   async existsByEmail(email) { ... }
 *   async findByIdOrThrow(id) { ... }
 * }
 * ```
 */
export interface UserRepositoryPort extends RepositoryPort<User, UserId> {
  /** Finds a user by email. Returns `null` if not found. */
  findByEmail(email: Email): Promise<Result<User | null, Error>>;
  /** Checks if a user with the given email already exists. */
  existsByEmail(email: Email): Promise<Result<boolean, Error>>;
  /** Finds a user by ID or returns an error if not found. */
  findByIdOrThrow(id: UserId): Promise<Result<User, Error>>;
}
