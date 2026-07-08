import { Result } from '@pranakaia/shared-kernel';
import type { Email } from '../../domain/user/email.vo';
import type { User } from '../../domain/user/user.entity';
import type { UserRepositoryPort } from '../../domain/user/user.repository.port';
import type { UserId } from '../../domain/user/user-id.vo';
import { mapToUser, mapToUsersList, toError, type UserRow } from './supabase-user.mapper';

/** Supabase query error shape — matches PostgREST error responses. */
interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  [key: string]: unknown;
}

interface SupabaseQueryBuilder {
  select(columns: string): SupabaseQueryBuilder;
  eq(field: string, value: unknown): SupabaseQueryBuilder;
  single(): Promise<{ data: UserRow | null; error: SupabaseError | null }>;
  limit(n: number): SupabaseQueryBuilder;
  range(from: number, to: number): SupabaseQueryBuilder;
  then: Promise<{ data: UserRow[] | null; error: SupabaseError | null }>['then'];
}

interface SupabaseClient {
  from(table: string): {
    select(columns: string): SupabaseQueryBuilder;
    upsert(values: Record<string, unknown>): Promise<{ error: SupabaseError | null }>;
    delete(): SupabaseQueryBuilder;
  };
}

/**
 * Supabase User Repository Implementation.
 *
 * Adapter that implements UserRepositoryPort using Supabase.
 *
 * @example
 * ```ts
 * const repo = new SupabaseUserRepository(supabaseClient);
 * const user = await repo.findById(userId);
 * ```
 */
export class SupabaseUserRepository implements UserRepositoryPort {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: UserId): Promise<Result<User | null, Error>> {
    try {
      const { data, error } = await this.supabase.from('users').select('*').eq('id', id).single();

      if (error) {
        throw error;
      }
      if (!data) {
        return Result.ok(null);
      }
      return mapToUser(data);
    } catch (error) {
      return Result.err(toError(error, 'Failed to find user'));
    }
  }

  async findByEmail(email: Email): Promise<Result<User | null, Error>> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email.value)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          throw error;
        }
      }
      if (!data) {
        return Result.ok(null);
      }
      return mapToUser(data);
    } catch (error) {
      return Result.err(toError(error, 'Failed to find user by email'));
    }
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<Result<User[], Error>> {
    try {
      const query = this.buildFindAllQuery(options);
      const { data, error } = (await query) as unknown as {
        data: UserRow[] | null;
        error: SupabaseError | null;
      };
      if (error) {
        throw error;
      }
      const users = await mapToUsersList(data);
      return Result.ok(users);
    } catch (error) {
      return Result.err(toError(error, 'Failed to find users'));
    }
  }

  private buildFindAllQuery(options?: { limit?: number; offset?: number }): SupabaseQueryBuilder {
    const { limit, offset } = options || {};
    let query = this.supabase.from('users').select('*');
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.range(offset, offset + (limit ?? 10) - 1);
    }
    return query;
  }

  async save(user: User): Promise<Result<void, Error>> {
    try {
      const { error } = await this.supabase.from('users').upsert({
        id: user.id,
        email: user.email.value,
        email_verified: user.emailVerified,
        role: user.role,
        created_at: user.createdAt.toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (error) {
        throw error;
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(toError(error, 'Failed to save user'));
    }
  }

  async delete(id: UserId): Promise<Result<void, Error>> {
    try {
      const { error } = await this.supabase.from('users').delete().eq('id', id);
      if (error) {
        throw error;
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(toError(error, 'Failed to delete user'));
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
      return Result.err(new Error(`User with id ${id} not found`));
    }
    return Result.ok(user);
  }
}
