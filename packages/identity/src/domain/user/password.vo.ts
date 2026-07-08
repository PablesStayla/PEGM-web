import { DomainError, Result, ValueObject } from '@pranakaia/shared-kernel';
import { z } from 'zod';

/**
 * Password validation schema
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Password Value Object
 *
 * Enforces security policies for plain text passwords before hashing.
 * THIS SHOULD ONLY BE USED FOR INPUT VALIDATION.
 */
export class Password extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): Result<Password, DomainError> {
    const result = passwordSchema.safeParse(value);

    if (!result.success) {
      const error = result.error.errors[0];
      const message = error?.message || 'Invalid password';
      return Result.err(createPasswordError(message));
    }

    return Result.ok(new Password(result.data));
  }

  /**
   * Sensitive data protection
   */
  override toString(): string {
    return '********';
  }

  override toJSON(): string {
    return '********';
  }
}

function createPasswordError(message: string): DomainError {
  let code = 'INVALID_PASSWORD_POLICY';
  if (message.includes('8 characters')) {
    code = 'PASSWORD_TOO_SHORT';
  } else if (message.includes('uppercase')) {
    code = 'PASSWORD_NO_UPPERCASE';
  } else if (message.includes('lowercase')) {
    code = 'PASSWORD_NO_LOWERCASE';
  } else if (message.includes('number')) {
    code = 'PASSWORD_NO_NUMBER';
  } else if (message.includes('special')) {
    code = 'PASSWORD_NO_SPECIAL';
  }
  return new DomainError(message, code, {
    field: 'password',
  });
}
