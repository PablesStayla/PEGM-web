import { Result } from './result';
import { type SafeInt, SafeInteger, SafeIntegerError } from './safe-integer';

/** Adds two safe integers. Fails if the result overflows. */
export function safeIntAdd(a: SafeInt, b: SafeInt): Result<SafeInt, SafeIntegerError> {
  const result = a + b;
  if (result > SafeInteger.MAX || result < SafeInteger.MIN) {
    return Result.err(new SafeIntegerError('Addition overflow', 'OVERFLOW', { a, b, result }));
  }
  return Result.ok(result as SafeInt);
}

/** Subtracts b from a. Fails if the result underflows. */
export function safeIntSubtract(a: SafeInt, b: SafeInt): Result<SafeInt, SafeIntegerError> {
  const result = a - b;
  if (result > SafeInteger.MAX || result < SafeInteger.MIN) {
    return Result.err(new SafeIntegerError('Subtraction underflow', 'UNDERFLOW', { a, b, result }));
  }
  return Result.ok(result as SafeInt);
}

/** Multiplies two safe integers. Fails if the result overflows. */
export function safeIntMultiply(a: SafeInt, b: SafeInt): Result<SafeInt, SafeIntegerError> {
  const result = a * b;
  if (result > SafeInteger.MAX || result < SafeInteger.MIN || !Number.isFinite(result)) {
    return Result.err(
      new SafeIntegerError('Multiplication overflow', 'OVERFLOW', { a, b, result }),
    );
  }
  return Result.ok(result as SafeInt);
}

/** Divides a by b, rounding to the nearest integer. Rejects division by zero. */
export function safeIntDivide(a: SafeInt, b: SafeInt): Result<SafeInt, SafeIntegerError> {
  if (b === 0) {
    return Result.err(new SafeIntegerError('Division by zero', 'DIVISION_BY_ZERO', { a, b }));
  }
  const result = Math.round(a / b);
  return Result.ok(result as SafeInt);
}

/** Returns the absolute value of a safe integer. */
export function safeIntAbs(a: SafeInt): SafeInt {
  return (a < 0 ? -a : a) as SafeInt;
}

/** Returns the negation of a safe integer. Fails if value is MIN. */
export function safeIntNegate(a: SafeInt): Result<SafeInt, SafeIntegerError> {
  if (a === SafeInteger.MIN) {
    return Result.err(
      new SafeIntegerError('Negation overflow (MIN_SAFE_INTEGER)', 'OVERFLOW', { a }),
    );
  }
  return Result.ok(-a as SafeInt);
}

/** Applies a percentage in basis points (100 = 1%, 1900 = 19%) to a safe integer, rounding the result. */
export function safeIntApplyPercent(
  base: SafeInt,
  percentBasisPoints: SafeInt,
): Result<SafeInt, SafeIntegerError> {
  const result = Math.round((base * percentBasisPoints) / 10_000);
  if (!Number.isFinite(result)) {
    return Result.err(
      new SafeIntegerError('Percentage calculation overflow', 'OVERFLOW', {
        base,
        percentBasisPoints,
        result,
      }),
    );
  }
  return Result.ok(result as SafeInt);
}

/** Clamps a safe integer between a minimum and maximum. */
export function safeIntClamp(value: SafeInt, min: SafeInt, max: SafeInt): SafeInt {
  if (min > max) {
    return value;
  }
  return Math.min(Math.max(value, min), max) as SafeInt;
}
