import { Result } from './result';

/** Combines multiple results into one. Fails if any of the results are failures. */
export function resultCombine(results: Result<unknown, unknown>[]): Result<void, unknown> {
  for (const result of results) {
    if (result.isFailure) {
      return Result.fail(result.errorValue);
    }
  }
  return Result.ok();
}

/** Pattern matches on the result. */
export function resultMatch<T, E, R>(
  result: Result<T, E>,
  handlers: { ok: (value: T) => R; err: (error: E) => R },
): R {
  if (result.isSuccess) {
    return handlers.ok(result.getValue());
  }
  return handlers.err(result.errorValue);
}

/** Unwraps the result, returning the value if successful, or throwing the error if failed. */
export function resultUnwrap<T, E>(result: Result<T, E>): T {
  if (result.isSuccess) {
    return result.getValue();
  }
  throw result.errorValue;
}

/** Unwraps the result, returning the value if successful, or the default value if failed. */
export function resultUnwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (result.isSuccess) {
    return result.getValue();
  }
  return defaultValue;
}

/** Wraps a Promise. Resolves to a successful Result if the promise resolves. */
export async function resultFromPromise<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const val = await promise;
    return Result.ok<T, E>(val);
  } catch (err) {
    return Result.err<T, E>(err as E);
  }
}

/** Executes a throwing function, wrapping its return value in a successful Result. */
export function resultFromThrowable<T, E = Error>(
  fn: () => T,
  errorFactory?: (error: unknown) => E,
): Result<T, E> {
  try {
    const val = fn();
    return Result.ok<T, E>(val);
  } catch (err) {
    const errorValue = errorFactory ? errorFactory(err) : (err as E);
    return Result.err<T, E>(errorValue);
  }
}
