import { Result } from '@pranakaia/shared-kernel';

declare module '@pranakaia/shared-kernel' {
  interface Result<T, E> {
    /**
     * Transforms the error value while preserving the success channel.
     * Useful for converting low-level errors into domain-specific errors.
     */
    mapError<F>(fn: (error: E) => F): Result<T, F>;

    /**
     * Executes a side-effect on the success value without modifying it.
     * Returns the same Result for chaining.
     */
    tap(fn: (value: T) => void): Result<T, E>;

    /**
     * Executes a side-effect on the error value without modifying it.
     * Returns the same Result for chaining.
     */
    tapError(fn: (error: E) => void): Result<T, E>;
  }
}

/**
 * Augments `Result` with `mapError`, `tap`, and `tapError` via prototype patching.
 *
 * This module must be imported once at application entry to make the
 * enhanced methods available on all `Result` instances.
 *
 * The `declare module` above tells TypeScript about the new methods at
 * compile time; the runtime implementation is added below.
 */
const ResultProto = Result.prototype as {
  mapError?: <T, E, F>(this: Result<T, E>, fn: (error: E) => F) => Result<T, F>;
  tap?: <T, E>(this: Result<T, E>, fn: (value: T) => void) => Result<T, E>;
  tapError?: <T, E>(this: Result<T, E>, fn: (error: E) => void) => Result<T, E>;
};

if (!ResultProto.mapError) {
  ResultProto.mapError = function <T, E, F>(this: Result<T, E>, fn: (error: E) => F): Result<T, F> {
    if (this.isSuccess) {
      return Result.ok<T, F>((this as unknown as { getValue: () => T }).getValue());
    }
    return Result.fail<T, F>(fn((this as unknown as { errorValue: E }).errorValue));
  };
}

if (!ResultProto.tap) {
  ResultProto.tap = function <T, E>(this: Result<T, E>, fn: (value: T) => void): Result<T, E> {
    if (this.isSuccess) {
      fn((this as unknown as { getValue: () => T }).getValue());
    }
    return this;
  };
}

if (!ResultProto.tapError) {
  ResultProto.tapError = function <T, E>(this: Result<T, E>, fn: (error: E) => void): Result<T, E> {
    if (this.isFailure) {
      fn((this as unknown as { errorValue: E }).errorValue);
    }
    return this;
  };
}

/**
 * Converts an array of `Result<T, E>` into a `Result<T[], E>`.
 * Short-circuits on the first failure.
 *
 * @example
 * ```ts
 * const results = [Result.ok(1), Result.ok(2), Result.ok(3)];
 * const combined = sequenceResults(results); // Result.ok([1, 2, 3])
 * ```
 */
export function sequenceResults<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const result of results) {
    if (result.isFailure) {
      return Result.fail<T[], E>((result as unknown as { errorValue: E }).errorValue);
    }
    values.push((result as unknown as { getValue: () => T }).getValue());
  }
  return Result.ok<T[], E>(values);
}

/**
 * Applies a function to each item in an array and collects the results.
 * Short-circuits on the first failure.
 *
 * @example
 * ```ts
 * const result = traverseResults([1, 2, 3], n => Money.create(n, 'USD'));
 * // Result.ok([Money(1), Money(2), Money(3)])
 * ```
 */
export function traverseResults<T, U, E>(
  items: T[],
  fn: (item: T, index: number) => Result<U, E>,
): Result<U[], E> {
  const results = items.map(fn);
  return sequenceResults(results);
}

export const ResultExtensions = {
  sequenceResults,
  traverseResults,
};

/**
 * Marker symbol to check if extensions have been applied.
 * Useful for test setup validation.
 */
export const RESULT_EXTENSIONS_APPLIED = true;
