import {
  resultCombine,
  resultFromPromise,
  resultFromThrowable,
  resultMatch,
  resultUnwrap,
  resultUnwrapOr,
} from './result.utils';

/**
 * Base class for all domain-related errors.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'DOMAIN_ERROR',
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Result pattern (Monad) for functional error handling.
 */
export class Result<T, E = Error> {
  public readonly success: boolean;
  public readonly value: T | null;
  public readonly error: E | null;

  private constructor(success: boolean, error?: E, value?: T) {
    this.success = success;
    this.error = error ?? null;
    this.value = value ?? null;
    Object.freeze(this);
  }

  public get isSuccess(): boolean {
    return this.success;
  }

  public get isFailure(): boolean {
    return !this.success;
  }

  public getValue(): T {
    if (!this.success) {
      throw new Error("Can't get the value of an error result. Use 'errorValue' instead.");
    }
    return this.value as T;
  }

  public get errorValue(): E {
    if (this.success) {
      throw new Error("Can't get the error value of a success result. Use 'getValue' instead.");
    }
    return this.error as E;
  }

  public static ok<U, F>(value?: U): Result<U, F> {
    return new Result<U, F>(true, undefined, value);
  }

  public static fail<U, F>(error: F): Result<U, F> {
    return new Result<U, F>(false, error);
  }

  public static err<U, F>(error: F): Result<U, F> {
    return Result.fail(error);
  }

  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFailure) {
      return Result.fail<U, E>(this.errorValue);
    }
    return Result.ok<U, E>(fn(this.getValue()));
  }

  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFailure) {
      return Result.fail<U, E>(this.errorValue);
    }
    return fn(this.getValue());
  }

  public static combine(results: Result<unknown, unknown>[]): Result<void, unknown> {
    return resultCombine(results);
  }

  public static map<T, E, U>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    return result.map(fn);
  }

  public static flatMap<T, E, U>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>,
  ): Result<U, E> {
    return result.flatMap(fn);
  }

  public static match<T, E, R>(
    result: Result<T, E>,
    handlers: { ok: (value: T) => R; err: (error: E) => R },
  ): R {
    return resultMatch(result, handlers);
  }

  public static unwrap<T, E>(result: Result<T, E>): T {
    return resultUnwrap(result);
  }

  public static isOk<T, E>(
    result: Result<T, E>,
  ): result is Result<T, E> & { success: true; value: T } {
    return result.isSuccess;
  }

  public static isErr<T, E>(
    result: Result<T, E>,
  ): result is Result<T, E> & { success: false; error: E } {
    return result.isFailure;
  }

  public static unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    return resultUnwrapOr(result, defaultValue);
  }

  public static async fromPromise<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
    return resultFromPromise(promise);
  }

  public static fromThrowable<T, E = Error>(
    fn: () => T,
    errorFactory?: (error: unknown) => E,
  ): Result<T, E> {
    return resultFromThrowable(fn, errorFactory);
  }
}

export type ResultFactory = typeof Result;
export type ResultType<T, E> = Result<T, E>;
