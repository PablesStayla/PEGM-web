import type { Result } from '@pranakaia/shared-kernel';

/**
 * Authenticator Port — External service interface.
 *
 * Abstracts the authentication mechanism (better-auth, Supabase, etc.)
 * so the domain doesn't depend on any specific auth provider.
 *
 * @example
 * ```ts
 * class BetterAuthAdapter implements Authenticator {
 *   async authenticate(userId, password) { ... }
 *   async verify2FA(userId, token) { ... }
 * }
 * ```
 */

/**
 * Result of a successful authentication attempt.
 *
 * @example
 * ```ts
 * const result: AuthenticationResult = { success: true, requires2FA: false };
 * ```
 */
export interface AuthenticationResult {
  readonly success: true;
  readonly requires2FA: boolean;
  readonly tempToken?: string;
}

export interface Authenticator {
  /**
   * Authenticates a user with credentials.
   *
   * @param userId - The user's identifier.
   * @param password - Plain text password.
   * @returns Authentication result or error.
   *
   * @example
   * ```ts
   * const result = await auth.authenticate('user_1', 'p@ssword');
   * if (result.isSuccess && result.getValue().requires2FA) { /* prompt 2FA *\/ }
   * ```
   */
  authenticate(userId: string, password: string): Promise<Result<AuthenticationResult, Error>>;

  /**
   * Verifies a TOTP 2FA token.
   *
   * @example
   * ```ts
   * const valid = await auth.verify2FA('user_1', '123456');
   * ```
   */
  verify2FA(userId: string, token: string): Promise<Result<boolean, Error>>;

  /**
   * Hashes a password for storage.
   *
   * @example
   * ```ts
   * const hash = await auth.hashPassword('p@ssword');
   * ```
   */
  hashPassword(password: string): Promise<Result<string, Error>>;

  /**
   * Verifies a password against a stored hash.
   *
   * @example
   * ```ts
   * const valid = await auth.verifyPassword('p@ssword', storedHash);
   * ```
   */
  verifyPassword(password: string, hash: string): Promise<Result<boolean, Error>>;
}
