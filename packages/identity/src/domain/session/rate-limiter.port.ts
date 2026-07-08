import type { Result } from '@pranakaia/shared-kernel';

/**
 * Port for rate limiting authentication attempts.
 *
 * Prevents brute-force attacks by tracking failed login attempts
 * and enforcing cooldown periods.
 *
 * @example
 * ```ts
 * class RedisRateLimiter implements RateLimiter {
 *   async check(identifier) { ... }
 *   async recordFailure(identifier) { ... }
 *   async getRemainingAttempts(identifier) { ... }
 * }
 * ```
 */
export interface RateLimiter {
  /**
   * Checks if the identifier is currently rate-limited.
   *
   * @returns `true` if the request is allowed, `false` if rate-limited.
   *
   * @example
   * ```ts
   * const allowed = await rateLimiter.check('user_1');
   * if (allowed.isFailure || !allowed.getValue()) { /* too many attempts *\/ }
   * ```
   */
  check(identifier: string): Promise<Result<boolean, Error>>;

  /** Records a failed authentication attempt. */
  recordFailure(identifier: string): Promise<Result<void, Error>>;

  /** Returns the number of remaining attempts before rate-limiting. */
  getRemainingAttempts(identifier: string): Promise<Result<number, Error>>;

  /** Returns the time when the rate limit will reset, or `null` if not limited. */
  getResetTime(identifier: string): Promise<Result<Date | null, Error>>;
}
