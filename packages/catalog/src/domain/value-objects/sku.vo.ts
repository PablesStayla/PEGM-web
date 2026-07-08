import { DomainError, Result } from '@pranakaia/shared-kernel';

const PATTERN = /^[A-Z0-9-]+$/i;

/**
 * Error returned when a SKU value object fails validation.
 *
 * @example
 * ```ts
 * const result = SKU.create('invalid sku!');
 * if (result.isFailure) {
 *   console.log(result.errorValue); // SKUError
 * }
 * ```
 */
class SKUError extends DomainError {
  constructor(raw: unknown) {
    super(`Invalid SKU: "${String(raw)}"`, 'INVALID_SKU');
    this.name = 'SKUError';
  }
}

/**
 * SKU (Stock Keeping Unit) Value Object.
 *
 * Validates format (alphanumeric + hyphens) and max length (50 chars).
 * Extracts the category prefix from the first hyphen-delimited segment.
 *
 * @example
 * ```ts
 * const result = SKU.create('CAM-ECO-M');
 * if (result.isSuccess) {
 *   console.log(result.getValue().value);          // 'CAM-ECO-M'
 *   console.log(result.getValue().categoryPrefix);  // 'CAM'
 * }
 *
 * // Unsafe cast (no validation)
 * const legacy = SKU.from('OLD-SKU');
 * ```
 */
export class SKU {
  private constructor(
    private readonly _value: string,
    private readonly _categoryPrefix: string,
  ) {
    Object.freeze(this);
  }

  /**
   * Creates a validated SKU from a raw string.
   *
   * @param raw - The SKU string to validate. Must be alphanumeric + hyphens, max 50 chars.
   * @returns `Result<SKU, SKUError>` — never throws.
   *
   * @example
   * ```ts
   * const sku = SKU.create('SHO-RUN-42');
   * if (sku.isSuccess) { /* use sku.getValue() *\/ }
   * ```
   */
  static create(raw: string): Result<SKU, SKUError> {
    if (!raw || raw.trim().length === 0) {
      return Result.err(new SKUError(raw));
    }
    if (raw.length > 50) {
      return Result.err(new SKUError(raw));
    }
    if (!PATTERN.test(raw)) {
      return Result.err(new SKUError(raw));
    }
    const categoryPrefix = raw.split('-')[0] ?? 'MISC';
    return Result.ok(new SKU(raw, categoryPrefix));
  }

  /**
   * Unsafely creates a SKU without validation.
   * Use only when the value is guaranteed valid (e.g. from trusted persistence).
   *
   * @param raw - A string that is known to be a valid SKU.
   *
   * @example
   * ```ts
   * const sku = SKU.from('CAM-ECO-L'); // no validation
   * ```
   */
  static from(raw: string): SKU {
    return new SKU(raw, raw.split('-')[0] ?? 'MISC');
  }

  /** The raw SKU string. */
  get value(): string {
    return this._value;
  }

  /** The category prefix (first segment before hyphen). */
  get categoryPrefix(): string {
    return this._categoryPrefix;
  }

  /**
   * Case-insensitive equality check.
   *
   * @example
   * ```ts
   * SKU.from('CAM-ECO').equals(SKU.from('cam-eco')); // true
   * ```
   */
  equals(other: SKU): boolean {
    return this._value.toLowerCase() === other._value.toLowerCase();
  }

  /** Returns the raw SKU string. */
  toString(): string {
    return this._value;
  }

  /** JSON serialization — returns the raw SKU string. */
  toJSON(): string {
    return this._value;
  }
}
