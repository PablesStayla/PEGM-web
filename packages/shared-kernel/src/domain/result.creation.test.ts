import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { DomainError, Result } from './result';

describe('Result Pattern - Creation', () => {
  describe('ok', () => {
    it('should create a success result with value', () => {
      const result = Result.ok('test-value');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('test-value');
      }
    });

    it('should infer correct types', () => {
      const result = Result.ok(42);

      expectTypeOf(result.success).toBeBoolean();
      if (result.success) {
        expectTypeOf(result.value).toEqualTypeOf<number | null>();
        expectTypeOf(result.getValue()).toEqualTypeOf<number>();
      }
    });
  });

  describe('err', () => {
    it('should create an error result', () => {
      const error = new Error('test error');
      const result = Result.err(error);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });

    it('should accept custom error types', () => {
      class CustomError extends DomainError {
        constructor() {
          super('Custom error', 'CUSTOM_CODE');
        }
      }

      const result = Result.err(new CustomError());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(CustomError);
      }
    });
  });

  describe('fail', () => {
    it('should create a failed result (alias of err)', () => {
      const error = new Error('failure');
      const result = Result.fail(error);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });
  });
});

describe('Result Pattern - Match & Transform', () => {
  describe('match', () => {
    it('should call ok handler on success', () => {
      const result = Result.ok('success');
      const okHandler = vi.fn();
      const errHandler = vi.fn();

      Result.match(result, {
        ok: okHandler,
        err: errHandler,
      });

      expect(okHandler).toHaveBeenCalledWith('success');
      expect(errHandler).not.toHaveBeenCalled();
    });

    it('should call err handler on failure', () => {
      const error = new Error('failure');
      const result = Result.err(error);
      const okHandler = vi.fn();
      const errHandler = vi.fn();

      Result.match(result, {
        ok: okHandler,
        err: errHandler,
      });

      expect(okHandler).not.toHaveBeenCalled();
      expect(errHandler).toHaveBeenCalledWith(error);
    });

    it('should return the result of the handler', () => {
      const successResult = Result.ok(42);
      const errorResult = Result.err(new Error('test'));

      const successValue = Result.match(successResult, {
        ok: (v) => v * 2,
        err: () => 0,
      });

      const errorValue = Result.match(errorResult, {
        ok: () => 100,
        err: () => -1,
      });

      expect(successValue).toBe(84);
      expect(errorValue).toBe(-1);
    });
  });

  describe('map', () => {
    it('should transform success value', () => {
      const result = Result.ok(21);
      const mapped = Result.map(result, (v) => v * 2);

      expect(mapped.success).toBe(true);
      if (mapped.success) {
        expect(mapped.value).toBe(42);
      }
    });

    it('should not transform error value', () => {
      const error = new Error('test');
      const result = Result.err(error);
      const mapped = Result.map(result, () => 100);

      expect(mapped.success).toBe(false);
      if (!mapped.success) {
        expect(mapped.error).toBe(error);
      }
    });

    it('should preserve error type', () => {
      class CustomError extends Error {}
      const result = Result.err<number, CustomError>(new CustomError('test'));
      const mapped = Result.map(result, (v) => v.toString());

      expectTypeOf(mapped.error).toEqualTypeOf<CustomError | null>();
    });
  });

  describe('flatMap', () => {
    it('should chain result-returning functions', () => {
      const result = Result.ok(21);
      const chained = Result.flatMap(result, (v) => Result.ok(v * 2));

      expect(chained.success).toBe(true);
      if (chained.success) {
        expect(chained.value).toBe(42);
      }
    });

    it('should short-circuit on error', () => {
      const error = new Error('first error');
      const result = Result.err(error);
      const chained = Result.flatMap(result, () => Result.ok(100));

      expect(chained.success).toBe(false);
      if (!chained.success) {
        expect(chained.error).toBe(error);
      }
    });

    it('should handle errors in the chain', () => {
      const result = Result.ok(21);
      const chained = Result.flatMap(result, () => Result.err(new Error('chain error')));

      expect(chained.success).toBe(false);
    });
  });
});

describe('Result Pattern - Type Safety', () => {
  it('should preserve types through operations', () => {
    const initial = Result.ok(42);
    const mapped = Result.map(initial, (n) => n.toString());
    const flatMapped = Result.flatMap(mapped, (s) => Result.ok(s.length));

    expectTypeOf(initial.success).toBeBoolean();
    expectTypeOf(mapped.success).toBeBoolean();
    expectTypeOf(flatMapped.success).toBeBoolean();
  });

  it('should handle union types', () => {
    type MyResult = Result<string | number, Error>;

    const result: MyResult = Result.ok(42);

    expectTypeOf(result).toMatchTypeOf<MyResult>();
  });
});
