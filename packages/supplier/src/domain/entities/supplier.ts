import { AggregateRoot, createSupplierId, Result, type SupplierId } from '@pranakaia/shared-kernel';
import { type SupplierProps, SupplierPropsSchema } from './supplier.schemas';

export type { SupplierProps, SyncFrequency } from './supplier.schemas';
export { SupplierPropsSchema, SyncFrequencySchema } from './supplier.schemas';

/**
 * Supplier Aggregate Root — represents an external vendor/partner.
 *
 * Manages business info, API credentials, and sync frequency
 * for inventory synchronization from external sources.
 *
 * @example
 * ```ts
 * const result = Supplier.create({
 *   tenantId: 'tenant_1',
 *   name: 'AliExpress Vendor',
 *   slug: 'aliexpress-vendor',
 *   email: 'vendor@aliexpress.com',
 *   businessType: 'DROPSHIPPER',
 *   country: 'CN',
 * });
 * if (result.isSuccess) {
 *   const supplier = result.getValue();
 *   console.log(supplier.shouldSync(lastSync)); // true/false
 * }
 * ```
 */
export class Supplier extends AggregateRoot<SupplierId> {
  private constructor(
    id: SupplierId,
    private _props: SupplierProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  /** Creates a new Supplier with validation. Returns Result — never throws. */
  public static create(
    props: Omit<SupplierProps, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>,
  ): Result<Supplier, Error> {
    const now = new Date();
    const id = `supplier_${crypto.randomUUID()}`;
    const entityProps: SupplierProps = {
      ...props,
      id,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    const validation = SupplierPropsSchema.safeParse(entityProps);
    if (!validation.success) {
      return Result.err(new Error(`Invalid supplier props: ${validation.error.message}`));
    }
    const supplierIdResult = createSupplierId(id);
    if (supplierIdResult.isFailure) {
      return Result.err(supplierIdResult.errorValue);
    }
    return Result.ok(new Supplier(supplierIdResult.getValue(), entityProps, now, now));
  }

  /** Reconstitutes a Supplier from persisted data. */
  public static reconstitute(props: SupplierProps): Result<Supplier, Error> {
    const validation = SupplierPropsSchema.safeParse(props);
    if (!validation.success) {
      return Result.err(
        new Error(`Invalid supplier props for reconstitution: ${validation.error.message}`),
      );
    }
    const idResult = createSupplierId(props.id);
    if (idResult.isFailure) {
      return Result.err(idResult.errorValue);
    }
    return Result.ok(new Supplier(idResult.getValue(), props, props.createdAt, props.updatedAt));
  }

  get supplierId(): SupplierId {
    return this.id;
  }
  get tenantId(): string {
    return this._props.tenantId;
  }
  get name(): string {
    return this._props.name;
  }
  get slug(): string {
    return this._props.slug;
  }
  get email(): string {
    return this._props.email;
  }
  get businessType() {
    return this._props.businessType;
  }
  get country(): string {
    return this._props.country;
  }
  get apiEndpoint() {
    return this._props.apiEndpoint;
  }
  get isActive(): boolean {
    return this._props.isActive;
  }

  /**
   * Determines if the supplier should sync based on last sync time and configured frequency.
   *
   * @example
   * ```ts
   * if (supplier.shouldSync(lastSyncDate)) {
   *   await inventorySource.fetchStock(supplier);
   * }
   * ```
   */
  public shouldSync(lastSync: Date): boolean {
    if (!this._props.isActive) {
      return false;
    }

    const diffMs = Date.now() - lastSync.getTime();

    switch (this._props.syncFrequency) {
      case 'REALTIME':
        return diffMs > 5 * 60 * 1000;
      case 'HOURLY':
        return diffMs > 60 * 60 * 1000;
      case 'DAILY':
        return diffMs > 24 * 60 * 60 * 1000;
      default:
        return false;
    }
  }

  public toPrimitives(): SupplierProps {
    return { ...this._props };
  }

  public rehydrate(_events: import('@pranakaia/shared-kernel').DomainEvent[]): void {}
  protected when(_event: import('@pranakaia/shared-kernel').DomainEvent): void {}
}

/** @deprecated Use Supplier instead */
export const SupplierEntity = Supplier;
/** @deprecated Use SupplierProps instead */
export type SupplierType = SupplierProps;
