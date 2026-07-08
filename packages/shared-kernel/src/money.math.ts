import { Result } from './domain/result';
import { Money, MoneyError } from './money';

/** Adds another Money value. Currencies must match. */
export function moneyAdd(self: Money, other: Money): Result<Money, MoneyError> {
  if (self.currency !== other.currency) {
    return Result.err(
      new MoneyError('Cannot add different currencies', 'CURRENCY_MISMATCH', {
        this: self.currency,
        other: other.currency,
      }),
    );
  }
  return Money.fromCents(self.amountInCents + other.amountInCents, self.currency);
}

/** Subtracts another Money value. Currencies must match; result cannot be negative. */
export function moneySubtract(self: Money, other: Money): Result<Money, MoneyError> {
  if (self.currency !== other.currency) {
    return Result.err(
      new MoneyError('Cannot subtract different currencies', 'CURRENCY_MISMATCH', {
        this: self.currency,
        other: other.currency,
      }),
    );
  }
  const newCents = self.amountInCents - other.amountInCents;
  if (newCents < 0) {
    return Result.err(
      new MoneyError('Result cannot be negative', 'NEGATIVE_RESULT', {
        this: self.amountInCents,
        other: other.amountInCents,
      }),
    );
  }
  return Money.fromCents(newCents, self.currency);
}

/** Multiplies by a non-negative factor. Uses integer cents arithmetic internally. */
export function moneyMultiply(self: Money, factor: number): Result<Money, MoneyError> {
  if (factor < 0) {
    return Result.err(new MoneyError('Factor cannot be negative', 'NEGATIVE_FACTOR', { factor }));
  }
  return Money.fromCents(Math.round(self.amountInCents * factor), self.currency);
}

/** Calculates a percentage of this Money value. */
export function moneyPercentage(self: Money, percent: number): Result<Money, MoneyError> {
  if (percent < 0 || percent > 100) {
    return Result.err(
      new MoneyError('Percentage must be between 0 and 100', 'INVALID_PERCENTAGE', { percent }),
    );
  }
  return Money.fromCents(Math.round((self.amountInCents * percent) / 100), self.currency);
}
