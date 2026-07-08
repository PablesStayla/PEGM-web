import { Result } from '@pranakaia/shared-kernel';
import type { UserId } from '../user/user-id.vo';
import type { Session } from './session.entity';
import type { SessionRepositoryPort } from './session.repository.port';
import type { SessionId } from './session-id.vo';

export class InMemorySessionRepository implements SessionRepositoryPort {
  private sessions: Map<string, Session> = new Map();

  async findById(id: SessionId): Promise<Result<Session | null, Error>> {
    const session = this.sessions.get(id as string) || null;
    return Result.ok(session);
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<Result<Session[], Error>> {
    let result = Array.from(this.sessions.values());
    if (options?.offset) {
      result = result.slice(options.offset);
    }
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }
    return Result.ok(result);
  }

  async exists(id: SessionId): Promise<Result<boolean, Error>> {
    return Result.ok(this.sessions.has(id as string));
  }

  async findByIdOrThrow(id: SessionId): Promise<Result<Session, Error>> {
    const session = this.sessions.get(id as string);
    if (!session) {
      return Result.err(new Error(`Session not found: ${id}`));
    }
    return Result.ok(session);
  }

  async findByUserId(userId: UserId): Promise<Result<Session[], Error>> {
    const sessions = Array.from(this.sessions.values()).filter(
      (s) => (s.userId as string) === (userId as string),
    );
    return Result.ok(sessions);
  }

  async findValidByUserId(userId: UserId): Promise<Result<Session[], Error>> {
    const sessions = Array.from(this.sessions.values()).filter(
      (s) => (s.userId as string) === (userId as string) && s.isValid(),
    );
    return Result.ok(sessions);
  }

  async save(session: Session): Promise<Result<void, Error>> {
    this.sessions.set(session.id as string, session);
    return Result.ok(undefined);
  }

  async update(session: Session): Promise<Result<void, Error>> {
    this.sessions.set(session.id as string, session);
    return Result.ok(undefined);
  }

  async delete(id: SessionId): Promise<Result<void, Error>> {
    this.sessions.delete(id as string);
    return Result.ok(undefined);
  }

  async revokeAllForUser(userId: UserId): Promise<Result<void, Error>> {
    for (const [id, session] of this.sessions) {
      if ((session.userId as string) === (userId as string)) {
        session.revoke();
        this.sessions.set(id, session);
      }
    }
    return Result.ok(undefined);
  }

  async deleteExpired(): Promise<Result<number, Error>> {
    let count = 0;
    for (const [id, session] of this.sessions) {
      if (session.isExpired()) {
        this.sessions.delete(id);
        count++;
      }
    }
    return Result.ok(count);
  }

  async findByToken(token: string): Promise<Result<Session | null, Error>> {
    const session = Array.from(this.sessions.values()).find((s) => s.id === token) ?? null;
    return Result.ok(session);
  }

  // Test helpers
  clear(): void {
    this.sessions.clear();
  }

  count(): number {
    return this.sessions.size;
  }
}
