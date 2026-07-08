import { describe, expect, it } from 'vitest';
import { Result } from './result';

describe('Result Pattern - Utilities', () => {
  describe('combine', () => {
    it('should return ok when all results are ok', () => {
      const results = [Result.ok(1), Result.ok('two'), Result.ok(true)];
      const combined = Result.combine(results);

      expect(combined.success).toBe(true);
    });

    it('should return first error when any result fails', () => {
      const error = new Error('test error');
      const results = [Result.ok(1), Result.err(error), Result.ok('three')];
      const combined = Result.combine(results);

      expect(combined.success).toBe(false);
      if (!combined.success) {
        expect(combined.error).toBe(error);
      }
    });

    it('should handle empty array', () => {
      const combined = Result.combine([]);
      expect(combined.success).toBe(true);
    });
  });

  describe('unwrap', () => {
    it('should return value on success', () => {
      const result = Result.ok('test');
      const value = Result.unwrap(result);

      expect(value).toBe('test');
    });

    it('should throw error on failure', () => {
      const error = new Error('unwrap error');
      const result = Result.err(error);

      expect(() => Result.unwrap(result)).toThrow(error);
    });
  });

  describe('unwrapOr', () => {
    it('should return value on success', () => {
      const result = Result.ok(42);
      const value = Result.unwrapOr(result, 0);

      expect(value).toBe(42);
    });

    it('should return default on failure', () => {
      const result = Result.err(new Error('test'));
      const value = Result.unwrapOr(result, 100);

      expect(value).toBe(100);
    });

    it('should accept falsy default value', () => {
      const result = Result.err(new Error('test'));
      const value = Result.unwrapOr(result, 0);

      expect(value).toBe(0);
    });
  });
});

describe('Result Pattern - Async Operations', () => {
  describe('fromPromise', () => {
    it('should resolve promise to ok result', async () => {
      const promise = Promise.resolve(42);
      const result = await Result.fromPromise(promise);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(42);
      }
    });

    it('should catch promise rejection', async () => {
      const error = new Error('promise error');
      const promise = Promise.reject(error);
      const result = await Result.fromPromise(promise);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it('should handle non-Error rejections', async () => {
      const promise = Promise.reject('string error');
      const result = await Result.fromPromise(promise);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('string error');
      }
    });
  });

  describe('fromThrowable', () => {
    it('should wrap successful execution', () => {
      const result = Result.fromThrowable(
        () => 42,
        (e: unknown) => new Error(String(e)),
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(42);
      }
    });

    it('should catch thrown errors', () => {
      const result = Result.fromThrowable(
        () => {
          throw new Error('test');
        },
        (e: unknown) => new Error(`Wrapped: ${e}`),
      );

      expect(result.success).toBe(false);
    });

    it('should use custom error factory', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(`Custom: ${message}`);
        }
      }

      const result = Result.fromThrowable(
        () => {
          throw new Error('original');
        },
        (e: unknown) => new CustomError(String(e)),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(CustomError);
      }
    });
  });
});
