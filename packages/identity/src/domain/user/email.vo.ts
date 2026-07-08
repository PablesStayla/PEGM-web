import { DomainError, Result, ValueObject } from '@pranakaia/shared-kernel';
import { z } from 'zod';

/**
 * Email validation schema
 */
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .max(254, 'Email too long')
  .email('Invalid email format');

/**
 * Email Value Object with robust Zod validation
 */
export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): Result<Email, DomainError> {
    const result = emailSchema.safeParse(value);

    if (!result.success) {
      const error = result.error.errors[0];
      const message = error?.message || 'Invalid email';
      return Result.err(createEmailError(message, value));
    }

    return Result.ok(new Email(result.data));
  }

  /**
   * Unsafe factory for trusted data (e.g., from DB)
   */
  static from(value: string): Email {
    return new Email(value.toLowerCase().trim());
  }

  get domain(): string {
    return this.value.split('@')[1] ?? '';
  }

  get localPart(): string {
    return this.value.split('@')[0] ?? '';
  }
}

function createEmailError(message: string, value: string): DomainError {
  let code = 'INVALID_EMAIL_FORMAT';
  if (message.includes('required')) {
    code = 'EMPTY_EMAIL';
  } else if (message.includes('too long')) {
    code = 'EMAIL_TOO_LONG';
  }
  return new DomainError(message, code, {
    field: 'email',
    received: value,
  });
}
