import { Result } from '@/shared/application/result';
import { ValueObject } from '@/shared/domain/value-object';

interface MoneyProps {
  amount: number;
  currency: string;
}

/**
 * Money Value Object
 * Handles monetary values with currency
 */
export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  /**
   * Factory method with validation
   */
  static create(amount: number, currency = 'USD'): Result<Money> {
    if (amount < 0) {
      return Result.fail('Money amount cannot be negative');
    }

    if (!currency || currency.length !== 3) {
      return Result.fail('Invalid currency code (must be 3 letters, e.g., USD)');
    }

    // Round to 2 decimal places
    const roundedAmount = Math.round(amount * 100) / 100;

    return Result.ok(new Money({ amount: roundedAmount, currency: currency.toUpperCase() }));
  }

  /**
   * Add two money values (must be same currency)
   */
  add(money: Money): Result<Money> {
    if (this.currency !== money.currency) {
      return Result.fail(`Cannot add different currencies: ${this.currency} and ${money.currency}`);
    }

    return Money.create(this.amount + money.amount, this.currency);
  }

  /**
   * Multiply money by a factor
   */
  multiply(factor: number): Result<Money> {
    if (factor < 0) {
      return Result.fail('Cannot multiply money by negative factor');
    }

    return Money.create(this.amount * factor, this.currency);
  }

  /**
   * Check if this money is greater than another
   */
  isGreaterThan(money: Money): boolean {
    if (this.currency !== money.currency) {
      throw new Error('Cannot compare different currencies');
    }
    return this.amount > money.amount;
  }

  /**
   * Format money for display
   */
  format(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }
}
