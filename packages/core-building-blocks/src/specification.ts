import type { Specification } from '@pranakaia/shared-kernel';

/**
 * Composable specification that requires ALL sub-specifications to be satisfied.
 *
 * @template T - The entity type being evaluated.
 */
export class AndSpecification<T> implements Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>,
  ) {}

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

/**
 * Composable specification that requires EITHER sub-specification to be satisfied.
 *
 * @template T - The entity type being evaluated.
 */
export class OrSpecification<T> implements Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>,
  ) {}

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

/**
 * Composable specification that negates the wrapped specification.
 *
 * @template T - The entity type being evaluated.
 */
export class NotSpecification<T> implements Specification<T> {
  constructor(private readonly spec: Specification<T>) {}

  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}

/**
 * Convenience helper for chaining specification composition.
 *
 * @template T - The entity type being evaluated.
 *
 * @example
 * ```ts
 * const spec = specBuilder<Product>(inStockSpec)
 *   .and(priceBelow100Spec)
 *   .not()
 *   .build();
 * ```
 */
export class SpecificationBuilder<T> {
  private current: Specification<T>;

  constructor(initial: Specification<T>) {
    this.current = initial;
  }

  and(other: Specification<T>): SpecificationBuilder<T> {
    this.current = new AndSpecification(this.current, other);
    return this;
  }

  or(other: Specification<T>): SpecificationBuilder<T> {
    this.current = new OrSpecification(this.current, other);
    return this;
  }

  not(): SpecificationBuilder<T> {
    this.current = new NotSpecification(this.current);
    return this;
  }

  build(): Specification<T> {
    return this.current;
  }
}

/**
 * Entry point for the fluent specification builder API.
 */
export function specBuilder<T>(initial: Specification<T>): SpecificationBuilder<T> {
  return new SpecificationBuilder(initial);
}
