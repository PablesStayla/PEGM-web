import { DomainError, Result } from '@pranakaia/shared-kernel';
import { describe, expect, it, vi } from 'vitest';
import { RESULT_EXTENSIONS_APPLIED, sequenceResults, traverseResults } from './result-extensions';

import './result-extensions';

describe('Result Extensions — mapError', () => {
  it('transforms error on failure', () => {
    class LowLevelError extends Error {
      constructor() {
        super('db connection failed');
        this.name = 'LowLevelError';
      }
    }
    class AppError extends DomainError {
      constructor(original: Error) {
        super(`Application error: ${original.message}`, 'APP_ERROR', {
          original: original.message,
        });
      }
    }

    const failed: Result<number, Error> = Result.fail(new LowLevelError());
    const mapped = failed.mapError((e) => new AppError(e));
    expect(mapped.isFailure).toBe(true);
    if (mapped.isFailure) {
      expect(mapped.errorValue).toBeInstanceOf(AppError);
      expect(mapped.errorValue.code).toBe('APP_ERROR');
    }
  });

  it('preserves success value', () => {
    const ok: Result<number, Error> = Result.ok(42);
    const mapped = ok.mapError((e) => e);
    expect(mapped.isSuccess).toBe(true);
    if (mapped.isSuccess) {
      expect(mapped.getValue()).toBe(42);
    }
  });
});

describe('Result Extensions — tap', () => {
  it('calls fn on success and returns same result', () => {
    const sideEffect = vi.fn();
    const ok = Result.ok('hello');
    const result = ok.tap(sideEffect);
    expect(sideEffect).toHaveBeenCalledWith('hello');
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.getValue()).toBe('hello');
    }
  });

  it('does not call fn on failure', () => {
    const sideEffect = vi.fn();
    const fail = Result.fail<string, Error>(new Error('nope'));
    const result = fail.tap(sideEffect);
    expect(sideEffect).not.toHaveBeenCalled();
    expect(result.isFailure).toBe(true);
  });
});

describe('Result Extensions — tapError', () => {
  it('calls fn on failure and returns same result', () => {
    const sideEffect = vi.fn();
    const err = new Error('logged');
    const fail = Result.fail<string, Error>(err);
    const result = fail.tapError(sideEffect);
    expect(sideEffect).toHaveBeenCalledWith(err);
    expect(result.isFailure).toBe(true);
  });

  it('does not call fn on success', () => {
    const sideEffect = vi.fn();
    const ok = Result.ok(99);
    const result = ok.tapError(sideEffect);
    expect(sideEffect).not.toHaveBeenCalled();
    expect(result.isSuccess).toBe(true);
  });
});

describe('sequenceResults', () => {
  it('collects all successes', () => {
    const results = [Result.ok(1), Result.ok(2), Result.ok(3)];
    const combined = sequenceResults(results);
    expect(combined.isSuccess).toBe(true);
    if (combined.isSuccess) {
      expect(combined.getValue()).toEqual([1, 2, 3]);
    }
  });

  it('short-circuits on first failure', () => {
    const results = [Result.ok(1), Result.fail<number, Error>(new Error('boom')), Result.ok(3)];
    const combined = sequenceResults(results);
    expect(combined.isFailure).toBe(true);
    if (combined.isFailure) {
      expect((combined.errorValue as Error).message).toBe('boom');
    }
  });

  it('handles empty array', () => {
    const combined = sequenceResults<number, Error>([]);
    expect(combined.isSuccess).toBe(true);
    if (combined.isSuccess) {
      expect(combined.getValue()).toEqual([]);
    }
  });

  it('returns first error when multiple failures', () => {
    const results = [
      Result.fail<number, Error>(new Error('first')),
      Result.fail<number, Error>(new Error('second')),
    ];
    const combined = sequenceResults(results);
    expect(combined.isFailure).toBe(true);
    if (combined.isFailure) {
      expect(combined.errorValue.message).toBe('first');
    }
  });
});

describe('traverseResults', () => {
  it('maps and collects all successes', () => {
    const items = [1, 2, 3];
    const result = traverseResults(items, (n) => Result.ok(n * 10));
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.getValue()).toEqual([10, 20, 30]);
    }
  });

  it('short-circuits on first failure', () => {
    const items = [1, 2, 3];
    const result = traverseResults(items, (n) =>
      n === 2 ? Result.fail<number, Error>(new Error('bad')) : Result.ok(n),
    );
    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect((result.errorValue as Error).message).toBe('bad');
    }
  });

  it('handles empty array', () => {
    const result = traverseResults<number, number, Error>([], (n) => Result.ok(n));
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.getValue()).toEqual([]);
    }
  });

  it('passes index to fn', () => {
    const items = ['a', 'b', 'c'];
    const result = traverseResults(items, (item, idx) => Result.ok(`${item}_${idx}`));
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.getValue()).toEqual(['a_0', 'b_1', 'c_2']);
    }
  });
});

describe('RESULT_EXTENSIONS_APPLIED', () => {
  it('is true after import', () => {
    expect(RESULT_EXTENSIONS_APPLIED).toBe(true);
  });
});
