import { Result } from '@pranakaia/shared-kernel';
import type Redis from 'ioredis';
import { inject, injectable } from 'tsyringe';
import type { RateLimiter } from '../../domain/session/rate-limiter.port';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

@injectable()
export class RedisRateLimiter implements RateLimiter {
  private readonly config: RateLimitConfig = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  };

  constructor(@inject('Redis') private readonly _redis: Redis) {}

  private get redis(): Redis {
    return this._redis;
  }

  async check(identifier: string): Promise<Result<boolean, Error>> {
    try {
      const key = `ratelimit:${identifier}`;
      const blockKey = `ratelimit:block:${identifier}`;

      // Check if blocked
      const isBlocked = await this.redis.get(blockKey);
      if (isBlocked) {
        const ttl = await this.redis.ttl(blockKey);
        return Result.err(new Error(`Rate limited. Try again in ${ttl} seconds`));
      }

      const attempts = await this.redis.get(key);
      const currentAttempts = attempts ? parseInt(attempts, 10) : 0;

      if (currentAttempts >= this.config.maxAttempts) {
        // Block the identifier
        await this.redis.setex(blockKey, Math.ceil(this.config.blockDurationMs / 1000), '1');
        return Result.err(new Error('Rate limited due to too many attempts'));
      }

      return Result.ok(true);
    } catch (error) {
      return Result.err(toError(error, 'Rate limit check failed'));
    }
  }

  async recordFailure(identifier: string): Promise<Result<void, Error>> {
    try {
      const key = `ratelimit:${identifier}`;
      const pipeline = this.redis.pipeline();

      pipeline.incr(key);
      pipeline.expire(key, Math.ceil(this.config.windowMs / 1000));

      await pipeline.exec();
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(toError(error, 'Failed to record rate limit failure'));
    }
  }

  async getRemainingAttempts(identifier: string): Promise<Result<number, Error>> {
    try {
      const key = `ratelimit:${identifier}`;
      const attempts = await this.redis.get(key);
      const currentAttempts = attempts ? parseInt(attempts, 10) : 0;
      return Result.ok(Math.max(0, this.config.maxAttempts - currentAttempts));
    } catch (error) {
      return Result.err(toError(error, 'Failed to get remaining attempts'));
    }
  }

  async getResetTime(identifier: string): Promise<Result<Date | null, Error>> {
    try {
      const key = `ratelimit:${identifier}`;
      const ttl = await this.redis.ttl(key);
      if (ttl <= 0) {
        return Result.ok(null);
      }

      return Result.ok(new Date(Date.now() + ttl * 1000));
    } catch (error) {
      return Result.err(toError(error, 'Failed to get rate limit reset time'));
    }
  }
}

function toError(error: unknown, defaultMsg: string): Error {
  return error instanceof Error ? error : new Error(defaultMsg);
}
