/**
 * Result type for handling success/failure without throwing exceptions
 * Inspired by functional programming error handling
 */
export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error: string | undefined;
  private readonly _value: T | undefined;

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;

    Object.freeze(this);
  }

  /**
   * Get the value from a successful result
   * @throws Error if result is a failure
   */
  get value(): T {
    if (!this.isSuccess) {
      throw new Error(`Cannot get value from failed result: ${this.error}`);
    }
    return this._value!;
  }

  /**
   * Create a successful result
   */
  static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  /**
   * Create a failed result
   */
  static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  /**
   * Combine multiple results - fails if any result fails
   */
  static combine(results: Result<unknown>[]): Result<void> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail<void>(result.error ?? 'Unknown error');
      }
    }
    return Result.ok();
  }
}
