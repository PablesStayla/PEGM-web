import { type UserId as BrandedUserId, createUserId, type Result } from '@pranakaia/shared-kernel';

/**
 * UserId Value Object — branded type for type-safe user identifiers.
 *
 * @example
 * ```ts
 * const id = UserId.generate(); // user_abc123def
 * const fromDb = UserId.from('user_42');
 * const validated = UserId.create('user_42'); // Result<UserId, Error>
 * ```
 */
export type UserId = BrandedUserId;

/**
 * Factory namespace for UserId creation and comparison.
 *
 * @example
 * ```ts
 * const a = UserId.generate();
 * const b = UserId.from('user_1');
 * UserId.equals(a, b); // false
 * ```
 */
export const UserId = {
  /** Creates a validated UserId. Returns Result — never throws. */
  create: (value: string): Result<UserId, Error> => {
    return createUserId(value);
  },
  /** Creates a UserId from a trusted string (no validation). */
  from: (value: string): UserId => value as UserId,
  /** Generates a new unique UserId. */
  generate: (): UserId => `user_${Math.random().toString(36).substring(2, 11)}` as UserId,
  /** Strict equality check. */
  equals: (a: UserId, b: UserId): boolean => a === b,
};
