/**
 * Result Bridge — converts `Result<T, E>` (from `@pranakaia/shared-kernel`)
 * into thrown `AdminUIError` instances so that:
 *
 *  1. The Data Provider's public API can be `Promise<T>` (idiomatic for UI).
 *  2. Next.js `error.tsx` boundaries catch failures uniformly.
 *  3. `next-safe-action` middleware can map them to `serverError` payloads
 *     with a stable `code` and `cause` chain.
 *
 * This is the "Result-Aware" piece you asked for — instead of forcing every
 * UI component to `Result.match(...)` (which Refine cannot do), we centralise
 * the unwrap here.
 *
 * @module providers/data/result-bridge
 */

import { DomainError, type Result } from '@pranakaia/shared-kernel';

/**
 * Error class that React error boundaries and toast bridge recognise as a
 * domain failure (vs. an unexpected runtime crash).
 */
export class AdminUIError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown> | undefined;
  public readonly cause?: unknown;

  constructor(source: DomainError | Error | string, options?: { cause?: unknown }) {
    if (source instanceof DomainError) {
      super(source.message);
      this.code = source.code;
      this.context = source.context;
    } else if (source instanceof Error) {
      super(source.message);
      this.code = (source as { code?: string }).code ?? 'UNKNOWN_ERROR';
    } else {
      super(source);
      this.code = 'UNKNOWN_ERROR';
    }

    this.name = 'AdminUIError';
    if (options?.cause) {
      this.cause = options.cause;
    }
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AdminUIError);
    }
  }

  /** True when the error originated from a domain rule violation (4xx-like). */
  get isDomainError(): boolean {
    return this.code !== 'UNKNOWN_ERROR' && this.code !== 'INTERNAL_ERROR';
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
    };
  }
}

/**
 * Unwrap a `Result<T, E>`. Throws `AdminUIError` on failure.
 * Use this at the **boundary** between application use-cases and the UI layer.
 */
export function unwrapOrThrow<T, E>(result: Result<T, E>): T {
  if (result.success) {
    return result.getValue();
  }

  const error = result.error;
  if (error instanceof DomainError) {
    throw new AdminUIError(error);
  }
  if (error instanceof Error) {
    throw new AdminUIError(error);
  }
  throw new AdminUIError(String(error));
}

/**
 * Unwrap an async `Promise<Result<T, E>>`. Convenience for the common
 * use-case: `await unwrapAsync(useCase.execute(...))`.
 */
export async function unwrapAsync<T, E>(promise: Promise<Result<T, E>>): Promise<T> {
  return unwrapOrThrow(await promise);
}

/**
 * Run an arbitrary async function and lift any thrown error into an
 * `AdminUIError` — used by the Data Provider adapter to wrap legacy code that
 * still throws.
 */
export async function liftToAdminError<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof AdminUIError) {
      throw e;
    }
    if (e instanceof DomainError) {
      throw new AdminUIError(e);
    }
    if (e instanceof Error) {
      throw new AdminUIError(e, { cause: e });
    }
    throw new AdminUIError(String(e));
  }
}
