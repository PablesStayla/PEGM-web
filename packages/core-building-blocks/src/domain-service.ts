/**
 * Base class for stateless domain services.
 *
 * Domain services encapsulate cross-aggregate business logic that
 * does not naturally belong to a single entity or value object.
 * Subclasses should remain stateless — all state comes from
 * method parameters or injected ports.
 *
 * @example
 * ```ts
 * class PricingService extends DomainService {
 *   constructor(private readonly taxPort: TaxRatePort) {
 *     super();
 *   }
 *
 *   calculateFinalPrice(product: Product, region: Region): Result<Money, DomainError> {
 *     // cross-aggregate logic here
 *   }
 * }
 * ```
 */
export abstract class DomainService {
  /** Returns the canonical name of this domain service. */
  get serviceName(): string {
    return this.constructor.name;
  }
}
