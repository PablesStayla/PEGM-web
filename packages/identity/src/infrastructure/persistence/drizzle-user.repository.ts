import type { DrizzleDB, UserInsert } from '@pranakaia/db';
import { usersTable } from '@pranakaia/db';
import { Result } from '@pranakaia/shared-kernel';
import { eq } from 'drizzle-orm';
import { inject, injectable } from 'tsyringe';
import { Email } from '../../domain/user/email.vo';
import { User } from '../../domain/user/user.entity';
import type { UserRepositoryPort } from '../../domain/user/user.repository.port';
import type { UserId } from '../../domain/user/user-id.vo';
import type { UserRole } from '../../domain/user/user-role.vo';

@injectable()
export class DrizzleUserRepository implements UserRepositoryPort {
  constructor(@inject('Database') private readonly _db: DrizzleDB) {}

  private get db(): DrizzleDB {
    return this._db;
  }

  async findById(id: UserId): Promise<Result<User | null, Error>> {
    try {
      const row = await this.db.query.usersTable.findFirst({
        where: eq(usersTable.id, id),
      });

      if (!row) {
        return Result.ok(null);
      }

      return this.toDomain(row);
    } catch (error) {
      return Result.err(toError(error, 'Failed to find user'));
    }
  }

  async findByEmail(email: Email): Promise<Result<User | null, Error>> {
    try {
      const row = await this.db.query.usersTable.findFirst({
        where: eq(usersTable.email, email.value),
      });

      if (!row) {
        return Result.ok(null);
      }

      return this.toDomain(row);
    } catch (error) {
      return Result.err(toError(error, 'Failed to find user by email'));
    }
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<Result<User[], Error>> {
    try {
      const { limit, offset } = options || {};
      const rows = await this.db.query.usersTable.findMany({
        limit,
        offset,
      });

      const users: User[] = [];
      for (const row of rows) {
        const result = this.toDomain(row);
        if (result.isSuccess) {
          users.push(result.getValue());
        }
      }

      return Result.ok(users);
    } catch (error) {
      return Result.err(toError(error, 'Failed to find users'));
    }
  }

  async save(user: User): Promise<Result<void, Error>> {
    try {
      const data = this.toPersistence(user);
      await this.db.insert(usersTable).values(data).onConflictDoUpdate({
        target: usersTable.id,
        set: data,
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to save user'));
    }
  }

  async delete(id: UserId): Promise<Result<void, Error>> {
    try {
      await this.db.delete(usersTable).where(eq(usersTable.id, id));
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to delete user'));
    }
  }

  async exists(id: UserId): Promise<Result<boolean, Error>> {
    const result = await this.findById(id);
    if (result.isFailure) {
      return Result.fail(result.errorValue);
    }
    return Result.ok(result.getValue() !== null);
  }

  async existsByEmail(email: Email): Promise<Result<boolean, Error>> {
    const result = await this.findByEmail(email);
    if (result.isFailure) {
      return Result.fail(result.errorValue);
    }
    return Result.ok(result.getValue() !== null);
  }

  async findByIdOrThrow(id: UserId): Promise<Result<User, Error>> {
    const result = await this.findById(id);
    if (result.isFailure) {
      return Result.fail(result.errorValue);
    }
    const user = result.getValue();
    if (!user) {
      return Result.err(new Error(`User ${id} not found`));
    }
    return Result.ok(user);
  }

  private toDomain(row: Record<string, unknown>): Result<User, Error> {
    const emailResult = Email.create(row.email as string);
    if (emailResult.isFailure) {
      return Result.err(emailResult.errorValue as Error);
    }

    return User.create({
      id: row.id as UserId,
      email: emailResult.getValue(),
      emailVerified: row.isEmailVerified as boolean,
      role: (row.role as UserRole) || 'CUSTOMER',
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
    });
  }

  private toPersistence(user: User): UserInsert {
    return {
      id: user.id,
      email: user.email.value,
      isEmailVerified: user.emailVerified,
      updatedAt: new Date(),
      // Note: Extra fields in DB schema (name, passwordHash) are not currently in domain User entity.
      // role is a domain concept not yet in the DB schema.
      // Defaults are used for new inserts; onConflictDoUpdate only updates what we pass.
      name: 'User',
      passwordHash: '',
    };
  }
}

function toError(error: unknown, defaultMsg: string): Error {
  return error instanceof Error ? error : new Error(defaultMsg);
}
