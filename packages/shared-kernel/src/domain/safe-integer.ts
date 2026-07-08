import { DomainError, Result } from './result';
import {
  safeIntAbs,
  safeIntAdd,
  safeIntApplyPercent,
  safeIntClamp,
  safeIntDivide,
  safeIntMultiply,
  safeIntNegate,
  safeIntSubtract,
} from './safe-integer.math';

/**
 * Error thrown when a SafeInteger operation fails.
 */
export class SafeIntegerError extends DomainError {
  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message, `SAFE_INT_${code}`, context);
    this.name = 'SafeIntegerError';
  }
}

/**
 * Branded type for a validated safe integer.
 */
export type SafeInt = number & { readonly __brand: 'SafeInt' };

/**
 * Utility namespace for integer-safe arithmetic.
 */
export namespace SafeInteger {
  export const MIN = Number.MIN_SAFE_INTEGER;
  export const MAX = Number.MAX_SAFE_INTEGER;

  function validateType(raw: number): Result<SafeInt, SafeIntegerError> | null {
    if (typeof raw !== 'number' || Number.isNaN(raw)) {
      return Result.err(
        new SafeIntegerError('Value is not a valid number', 'NOT_A_NUMBER', { raw }),
      );
    }
    if (!Number.isFinite(raw)) {
      return Result.err(
        new SafeIntegerError('Value must be finite (not Infinity)', 'NOT_FINITE', { raw }),
      );
    }
    return null;
  }

  function validateInteger(raw: number): Result<SafeInt, SafeIntegerError> | null {
    if (!Number.isInteger(raw)) {
      return Result.err(
        new SafeIntegerError('Value must be an integer (no decimals)', 'NOT_INTEGER', { raw }),
      );
    }
    if (raw < MIN || raw > MAX) {
      return Result.err(
        new SafeIntegerError('Value is outside safe integer range', 'OUT_OF_RANGE', { raw }),
      );
    }
    return null;
  }

  export function create(raw: number): Result<SafeInt, SafeIntegerError> {
    const typeError = validateType(raw);
    if (typeError) {
      return typeError;
    }
    const intError = validateInteger(raw);
    if (intError) {
      return intError;
    }
    return Result.ok(raw as SafeInt);
  }

  export function from(value: number): SafeInt {
    return value as SafeInt;
  }

  export const add = safeIntAdd;
  export const subtract = safeIntSubtract;
  export const multiply = safeIntMultiply;
  export const divide = safeIntDivide;
  export const abs = safeIntAbs;
  export const negate = safeIntNegate;
  export const applyPercent = safeIntApplyPercent;
  export const clamp = safeIntClamp;

  export function isValid(raw: number): boolean {
    return Number.isInteger(raw) && Number.isFinite(raw) && raw >= MIN && raw <= MAX;
  }

  export function zero(): SafeInt {
    return 0 as SafeInt;
  }

  export function compare(a: SafeInt, b: SafeInt): -1 | 0 | 1 {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }

  export function max(a: SafeInt, b: SafeInt): SafeInt {
    return (a >= b ? a : b) as SafeInt;
  }

  export function min(a: SafeInt, b: SafeInt): SafeInt {
    return (a <= b ? a : b) as SafeInt;
  }
}
