import { DomainError, Result } from './domain/result';
import { ValueObject } from './domain/value-object';
import { moneyFormat } from './money.formatter';
import { moneyAdd, moneyMultiply, moneyPercentage, moneySubtract } from './money.math';

// ---------------------------------------------------------------------------
// Supported currencies
// ---------------------------------------------------------------------------

export const VALID_CURRENCIES = ['USD', 'EUR', 'GBP', 'MXN', 'COP', 'CLP', 'BRL'] as const;
export type CurrencyCode = (typeof VALID_CURRENCIES)[number];

// ---------------------------------------------------------------------------
// Internal props (cents-based for financial safety)
// ---------------------------------------------------------------------------

export interface MoneyProps {
  amountInCents: number;
  currency: CurrencyCode;
}

// ---------------------------------------------------------------------------
// Domain Error
// ---------------------------------------------------------------------------

export class MoneyError extends DomainError {
  constructor(message: string, code = 'MONEY_ERROR', metadata?: Record<string, unknown>) {
    super(message, code, metadata);
    this.name = 'MoneyError';
  }
}

type MoneyCreateInput = number | { amount: number; currency?: string };

// ---------------------------------------------------------------------------
// Money Value Object
// ---------------------------------------------------------------------------

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  // -----------------------------------------------------------------------
  // Factory methods
  // -----------------------------------------------------------------------

  static create(amount: number, currency?: CurrencyCode): Result<Money, MoneyError>;
  static create(input: { amount: number; currency?: string }): Result<Money, MoneyError>;
  static create(
    amountOrInput: MoneyCreateInput,
    currency: CurrencyCode = 'USD',
  ): Result<Money, MoneyError> {
    const normalized = Money.normalizeCreateInput(amountOrInput, currency);

    if (Number.isNaN(normalized.amount)) {
      return Result.err(
        new MoneyError('Amount must be a valid number', 'INVALID_AMOUNT', {
          amount: normalized.amount,
        }),
      );
    }

    if (!VALID_CURRENCIES.includes(normalized.currency)) {
      return Result.err(
        new MoneyError(`Unsupported currency: ${normalized.currency}`, 'UNSUPPORTED_CURRENCY', {
          currency: normalized.currency,
        }),
      );
    }

    if (normalized.amount < 0) {
      return Result.err(
        new MoneyError('Amount cannot be negative', 'NEGATIVE_AMOUNT', {
          amount: normalized.amount,
        }),
      );
    }

    const amountInCents = Math.round(normalized.amount * 100);
    return Result.ok(new Money({ amountInCents, currency: normalized.currency }));
  }

  private static normalizeCreateInput(
    amountOrInput: MoneyCreateInput,
    currency: CurrencyCode,
  ): { amount: number; currency: CurrencyCode } {
    if (typeof amountOrInput === 'number') {
      return { amount: amountOrInput, currency };
    }
    return {
      amount: amountOrInput.amount,
      currency: (amountOrInput.currency ?? currency) as CurrencyCode,
    };
  }

  static of(amount: number, currency: CurrencyCode = 'USD'): Result<Money, MoneyError> {
    return Money.create(amount, currency);
  }

  static fromCents(
    amountInCents: number,
    currency: CurrencyCode = 'USD',
  ): Result<Money, MoneyError> {
    if (!Number.isInteger(amountInCents) || amountInCents < 0) {
      return Result.err(
        new MoneyError('Cents must be a non-negative integer', 'INVALID_CENTS', {
          amountInCents,
        }),
      );
    }
    return Result.ok(new Money({ amountInCents, currency }));
  }

  static zero(currency: CurrencyCode = 'USD'): Money {
    return new Money({ amountInCents: 0, currency });
  }

  // -----------------------------------------------------------------------
  // Getters
  // -----------------------------------------------------------------------

  get amount(): number {
    return this._value.amountInCents / 100;
  }

  get amountInCents(): number {
    return this._value.amountInCents;
  }

  get currency(): CurrencyCode {
    return this._value.currency;
  }

  // -----------------------------------------------------------------------
  // Arithmetic
  // -----------------------------------------------------------------------

  add(other: Money): Result<Money, MoneyError> {
    return moneyAdd(this, other);
  }

  subtract(other: Money): Result<Money, MoneyError> {
    return moneySubtract(this, other);
  }

  multiply(factor: number): Result<Money, MoneyError> {
    return moneyMultiply(this, factor);
  }

  percentage(percent: number): Result<Money, MoneyError> {
    return moneyPercentage(this, percent);
  }

  // -----------------------------------------------------------------------
  // Comparison
  // -----------------------------------------------------------------------

  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      return false;
    }
    return this.amountInCents > other.amountInCents;
  }

  isLessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      return false;
    }
    return this.amountInCents < other.amountInCents;
  }

  equals(other: Money): boolean {
    return this.amountInCents === other.amountInCents && this.currency === other.currency;
  }

  // -----------------------------------------------------------------------
  // Formatting & serialization
  // -----------------------------------------------------------------------

  format(locale = 'en-US'): string {
    return moneyFormat(this, locale);
  }

  toPrimitives(): { amount: number; currency: CurrencyCode } {
    return { amount: this.amount, currency: this.currency };
  }
}
