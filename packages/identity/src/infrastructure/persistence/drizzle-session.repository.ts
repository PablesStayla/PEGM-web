import type { DrizzleDB, SessionInsert } from '@pranakaia/db';
import { sessionsTable } from '@pranakaia/db';
import { Result } from '@pranakaia/shared-kernel';
import { and, eq, gt, lte } from 'drizzle-orm';
import { inject, injectable } from 'tsyringe';
import { Session } from '../../domain/session/session.entity';
import type { SessionRepositoryPort } from '../../domain/session/session.repository.port';
import type { SessionId } from '../../domain/session/session-id.vo';
import type { UserId } from '../../domain/user/user-id.vo';

@injectable()
export class DrizzleSessionRepository implements SessionRepositoryPort {
  constructor(@inject('Database') readonly db: DrizzleDB) {}

  async findById(id: SessionId): Promise<Result<Session | null, Error>> {
    try {
      const row = await this.db.query.sessionsTable.findFirst({
        where: eq(sessionsTable.id, id),
      });

      if (!row) {
        return Result.ok(null);
      }

      return Result.ok(this.toDomain(row));
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to find session'));
    }
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<Result<Session[], Error>> {
    try {
      const rows = await this.db.query.sessionsTable.findMany({
        limit: options?.limit,
        offset: options?.offset,
      });

      return Result.ok(rows.map((row) => this.toDomain(row)));
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to find sessions'));
    }
  }

  async findByUserId(userId: UserId): Promise<Result<Session[], Error>> {
    try {
      const rows = await this.db.query.sessionsTable.findMany({
        where: eq(sessionsTable.userId, userId),
      });

      return Result.ok(rows.map((row) => this.toDomain(row)));
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to find user sessions'));
    }
  }

  async findValidByUserId(userId: UserId): Promise<Result<Session[], Error>> {
    try {
      const now = new Date();
      const rows = await this.db.query.sessionsTable.findMany({
        where: and(
          eq(sessionsTable.userId, userId),
          eq(sessionsTable.isRevoked, false),
          gt(sessionsTable.expiresAt, now),
        ),
      });

      return Result.ok(rows.map((row) => this.toDomain(row)));
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error('Failed to find valid user sessions'),
      );
    }
  }

  async findByToken(token: string): Promise<Result<Session | null, Error>> {
    try {
      const row = await this.db.query.sessionsTable.findFirst({
        where: eq(sessionsTable.token, token),
      });

      if (!row) {
        return Result.ok(null);
      }

      return Result.ok(this.toDomain(row));
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error('Failed to find session by token'),
      );
    }
  }

  async save(session: Session): Promise<Result<void, Error>> {
    try {
      const data = this.toPersistence(session);
      await this.db.insert(sessionsTable).values(data).onConflictDoUpdate({
        target: sessionsTable.id,
        set: data,
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to save session'));
    }
  }

  async delete(id: SessionId): Promise<Result<void, Error>> {
    try {
      await this.db.delete(sessionsTable).where(eq(sessionsTable.id, id));
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to delete session'));
    }
  }

  async exists(id: SessionId): Promise<Result<boolean, Error>> {
    const result = await this.findById(id);
    if (result.isFailure) {
      return Result.fail(result.errorValue);
    }
    return Result.ok(result.getValue() !== null);
  }

  async revokeAllForUser(userId: UserId): Promise<Result<void, Error>> {
    try {
      await this.db
        .update(sessionsTable)
        .set({ isRevoked: true, updatedAt: new Date() })
        .where(eq(sessionsTable.userId, userId));
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error('Failed to revoke user sessions'),
      );
    }
  }

  async deleteExpired(): Promise<Result<number, Error>> {
    try {
      const now = new Date();
      const result = await this.db.delete(sessionsTable).where(lte(sessionsTable.expiresAt, now));
      // Drizzle delete result depends on the driver, but we'll assume it returns the count or 0
      return Result.ok((result as unknown as { rowCount?: number }).rowCount ?? 0);
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error('Failed to delete expired sessions'),
      );
    }
  }

  private toDomain(row: Record<string, unknown>): Session {
    return Session.rehydrate(
      row.id as SessionId,
      {
        userId: row.userId as UserId,
        ipAddress: row.ipAddress as string | null,
        userAgent: row.userAgent as string | null,
        expiresAt: row.expiresAt as Date,
        revokedAt: row.isRevoked ? (row.updatedAt as Date) || new Date() : null,
        lastActivityAt: (row.lastUsedAt as Date) || (row.createdAt as Date),
      },
      row.createdAt as Date,
      (row.updatedAt as Date) || (row.createdAt as Date),
      1, // Default version
    );
  }

  private toPersistence(session: Session): SessionInsert {
    return {
      id: session.id,
      userId: session.userId,
      token: session.id, // Using ID as token if not otherwise specified
      ipAddress: session.ipAddress ?? null,
      userAgent: session.userAgent ?? null,
      expiresAt: session.expiresAt,
      isRevoked: session.revokedAt !== null,
      lastUsedAt: session.lastActivityAt,
      updatedAt: new Date(),
    };
  }
}
