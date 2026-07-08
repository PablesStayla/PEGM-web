import { Result } from '@pranakaia/shared-kernel';
import type { RateLimiter } from './rate-limiter.port';

export class FakeRateLimiter implements RateLimiter {
  private failures: Map<string, number> = new Map();
  private maxAttempts = 5;

  async check(identifier: string): Promise<Result<boolean, Error>> {
    const attempts = this.failures.get(identifier) || 0;
    return Result.ok(attempts < this.maxAttempts);
  }

  async recordFailure(identifier: string): Promise<Result<void, Error>> {
    const attempts = this.failures.get(identifier) || 0;
    this.failures.set(identifier, attempts + 1);
    return Result.ok(undefined);
  }

  async getRemainingAttempts(identifier: string): Promise<Result<number, Error>> {
    const attempts = this.failures.get(identifier) || 0;
    return Result.ok(Math.max(0, this.maxAttempts - attempts));
  }

  async getResetTime(_identifier: string): Promise<Result<Date | null, Error>> {
    return Result.ok(new Date(Date.now() + 3600000)); // 1 hour later
  }

  // Test helpers
  reset(identifier: string): void {
    this.failures.delete(identifier);
  }

  block(identifier: string): void {
    this.failures.set(identifier, this.maxAttempts);
  }
}
