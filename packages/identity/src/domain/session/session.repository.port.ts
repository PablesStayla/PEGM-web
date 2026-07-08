import type { RepositoryPort, Result } from '@pranakaia/shared-kernel';
import type { UserId } from '../user/user-id.vo';
import type { Session } from './session.entity';
import type { SessionId } from './session-id.vo';

/**
 * Repository port for Session persistence.
 *
 * @example
 * ```ts
 * class DrizzleSessionRepository implements SessionRepositoryPort {
 *   async findByUserId(userId) { ... }
 *   async findValidByUserId(userId) { ... }
 *   async revokeAllForUser(userId) { ... }
 * }
 * ```
 */
export interface SessionRepositoryPort extends RepositoryPort<Session, SessionId> {
  /** Finds all sessions (including expired/revoked) for a user. */
  findByUserId(userId: UserId): Promise<Result<Session[], Error>>;
  /** Finds only valid (non-expired, non-revoked) sessions for a user. */
  findValidByUserId(userId: UserId): Promise<Result<Session[], Error>>;
  /** Finds a session by its token string. Returns `null` if not found. */
  findByToken(token: string): Promise<Result<Session | null, Error>>;
  /** Revokes all sessions for a user (e.g. on password change). */
  revokeAllForUser(userId: UserId): Promise<Result<void, Error>>;
  /** Deletes expired sessions and returns the count removed. */
  deleteExpired(): Promise<Result<number, Error>>;
}
