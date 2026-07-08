import { Result } from '@/shared/application/result';
import { ValueObject } from '@/shared/domain/value-object';

interface ProductIdProps {
  value: string;
}

/**
 * ProductId Value Object
 * Ensures Product IDs are always valid
 */
export class ProductId extends ValueObject<ProductIdProps> {
  private constructor(props: ProductIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * Factory method to create a ProductId with validation
   */
  static create(id: string): Result<ProductId> {
    if (!id || id.trim().length === 0) {
      return Result.fail('ProductId cannot be empty');
    }

    // Add more validation if needed (UUID format, etc)
    if (id.length > 100) {
      return Result.fail('ProductId is too long');
    }

    return Result.ok(new ProductId({ value: id }));
  }

  /**
   * Create a new ProductId with a random UUID
   */
  static createNew(): Result<ProductId> {
    return ProductId.create(crypto.randomUUID());
  }
}
