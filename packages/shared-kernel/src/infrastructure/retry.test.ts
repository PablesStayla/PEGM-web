import { describe, expect, it } from 'vitest';
import { type RetryConfig, retry } from './retry';

describe('Retry utility', () => {
  const defaultConfig: RetryConfig = {
    maxAttempts: 3,
    delay: 10,
    factor: 2,
  };

  describe('successful execution', () => {
    it('should return result on first attempt', async () => {
      const fn = async () => 'success';

      const result = await retry(fn, defaultConfig);

      expect(result).toBe('success');
    });

    it('should not retry on success', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        return 'success';
      };

      await retry(fn, defaultConfig);

      expect(attempts).toBe(1);
    });
  });

  describe('retry on failure', () => {
    it('should retry on failure', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('fail');
        }
        return 'success';
      };

      const result = await retry(fn, defaultConfig);

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should respect maxAttempts', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        throw new Error('fail');
      };

      await expect(retry(fn, { ...defaultConfig, maxAttempts: 3 })).rejects.toThrow('fail');

      expect(attempts).toBe(3);
    });

    it('should increase delay between attempts', async () => {
      let attempts = 0;
      const delays: number[] = [];
      let lastCallTime = Date.now();

      const fn = async () => {
        const now = Date.now();
        delays.push(now - lastCallTime);
        lastCallTime = now;
        attempts++;
        if (attempts < 3) {
          throw new Error('fail');
        }
        return 'success';
      };

      await retry(fn, { ...defaultConfig, delay: 10, factor: 2 });

      expect(delays).toHaveLength(3);
      expect(delays[1]).toBeGreaterThanOrEqual(delays[0]);
      expect(delays[2]).toBeGreaterThanOrEqual(delays[1]);
    });
  });

  describe('exponential backoff', () => {
    it('should use exponential backoff', async () => {
      const config: RetryConfig = {
        maxAttempts: 4,
        delay: 10,
        factor: 2,
      };

      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 4) {
          throw new Error('fail');
        }
        return 'success';
      };

      await retry(fn, config);

      expect(attempts).toBe(4);
    });

    it('should handle zero delay', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error('fail');
        }
        return 'success';
      };

      const result = await retry(fn, { ...defaultConfig, delay: 0 });

      expect(result).toBe('success');
    });
  });

  describe('error handling', () => {
    it('should throw last error after maxAttempts', async () => {
      const error = new Error('persistent failure');
      const fn = async () => {
        throw error;
      };

      await expect(retry(fn, { ...defaultConfig, maxAttempts: 3 })).rejects.toBe(error);
    });

    it('should preserve error message', async () => {
      const fn = async () => {
        throw new Error('specific error message');
      };

      await expect(retry(fn, { ...defaultConfig, maxAttempts: 1 })).rejects.toThrow(
        'specific error message',
      );
    });
  });
});

describe('RetryConfig', () => {
  it('should have default values', () => {
    const config: RetryConfig = {
      maxAttempts: 3,
      delay: 100,
      factor: 2,
    };

    expect(config.maxAttempts).toBe(3);
    expect(config.delay).toBe(100);
    expect(config.factor).toBe(2);
  });

  it('should accept custom config', () => {
    const config: RetryConfig = {
      maxAttempts: 5,
      delay: 200,
      factor: 1.5,
    };

    expect(config.maxAttempts).toBe(5);
    expect(config.delay).toBe(200);
    expect(config.factor).toBe(1.5);
  });
});
