import { Result } from '@pranakaia/shared-kernel';
import { Email } from '../../domain/user/email.vo';
import { User } from '../../domain/user/user.entity';
import { UserId } from '../../domain/user/user-id.vo';
import type { UserRole } from '../../domain/user/user-role.vo';

/** Database representation of the user schema in Supabase. */
export interface UserRow {
  id: string;
  email: string;
  email_verified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export function toError(error: unknown, defaultMsg: string): Error {
  return error instanceof Error ? error : new Error(defaultMsg);
}

/** Maps a raw Supabase UserRow to the domain User aggregate entity. */
export function mapToUser(data: UserRow): Result<User, Error> {
  const userIdResult = UserId.create(data.id);
  if (userIdResult.isFailure) {
    return Result.err(userIdResult.errorValue as unknown as Error);
  }
  const emailResult = Email.create(data.email);
  if (emailResult.isFailure) {
    return Result.err(emailResult.errorValue as unknown as Error);
  }
  return User.create({
    id: userIdResult.getValue(),
    email: emailResult.getValue(),
    emailVerified: data.email_verified,
    role: data.role as UserRole,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }) as unknown as Result<User, Error>;
}

/** Maps a collection of Supabase UserRows to a list of domain User entities. */
export async function mapToUsersList(data: UserRow[] | null): Promise<User[]> {
  const users: User[] = [];
  for (const row of data || []) {
    const userResult = mapToUser(row);
    if (userResult.isSuccess) {
      users.push(userResult.getValue());
    }
  }
  return users;
}
