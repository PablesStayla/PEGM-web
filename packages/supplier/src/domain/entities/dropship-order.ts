import {
  createDropshipOrderId,
  type DropshipOrderId,
  Entity,
  Result,
} from '@pranakaia/shared-kernel';
import type { DropshipOrderProps, DropshipOrderStatus } from './dropship-order.types';
import { DropshipOrderPropsSchema, MAX_RETRIES, TERMINAL_STATUSES } from './dropship-order.types';

/**
 * DropshipOrder Entity — tracks an order line sent to an external supplier.
 *
 * Manages lifecycle from PENDING → SUBMITTED → CONFIRMED → SHIPPED → DELIVERED
 * with retry logic for failed submissions.
 *
 * @example
 * ```ts
 * const result = DropshipOrder.create({
 *   tenantId: 'tenant_1',
 *   orderId: 'order_1',
 *   orderItemId: 'oi_1',
 *   supplierId: 'sup_1',
 *   supplierProductId: 'ext_42',
 *   productId: 'prod_1',
 *   quantity: 2,
 *   unitCost: Money.zero('CLP'),
 *   totalCost: Money.zero('CLP'),
 *   shippingAddress: {},
 * });
 * ```
 */
export class DropshipOrder extends Entity<DropshipOrderId> {
  private constructor(
    id: DropshipOrderId,
    private _props: DropshipOrderProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    input: Pick<
      DropshipOrderProps,
      | 'tenantId'
      | 'orderId'
      | 'orderItemId'
      | 'supplierId'
      | 'supplierProductId'
      | 'productId'
      | 'quantity'
      | 'unitCost'
      | 'shippingAddress'
      | 'notes'
    > & { autoSubmit?: boolean },
  ): Result<DropshipOrder, Error> {
    const now = new Date();
    const totalCostResult = input.unitCost.multiply(input.quantity);
    const totalCost = totalCostResult.success ? totalCostResult.getValue() : input.unitCost;

    const id = `dropship_${crypto.randomUUID()}`;
    const entityProps: DropshipOrderProps = {
      id,
      ...input,
      totalCost,
      status: 'PENDING',
      supplierOrderId: null,
      supplierOrderNumber: null,
      trackingNumber: null,
      carrier: null,
      shippingMethod: null,
      shippingCost: null,
      notes: input.notes ?? null,
      errors: [],
      retryCount: 0,
      autoSubmit: input.autoSubmit ?? true,
      submittedAt: null,
      confirmedAt: null,
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const validation = DropshipOrderPropsSchema.safeParse(entityProps);
    if (!validation.success) {
      return Result.err(new Error(`Invalid dropship order props: ${validation.error.message}`));
    }

    const orderIdResult = createDropshipOrderId(id);
    if (orderIdResult.isFailure) {
      return Result.err(orderIdResult.errorValue);
    }

    return Result.ok(new DropshipOrder(orderIdResult.getValue(), entityProps, now, now));
  }

  public static reconstitute(props: DropshipOrderProps): Result<DropshipOrder, Error> {
    const validation = DropshipOrderPropsSchema.safeParse(props);
    if (!validation.success) {
      return Result.err(
        new Error(`Invalid dropship order props for reconstitution: ${validation.error.message}`),
      );
    }

    const idResult = createDropshipOrderId(props.id);
    if (idResult.isFailure) {
      return Result.err(idResult.errorValue);
    }

    return Result.ok(
      new DropshipOrder(idResult.getValue(), props, props.createdAt, props.updatedAt),
    );
  }

  get dropshipOrderId(): DropshipOrderId {
    return this.id;
  }

  get status(): DropshipOrderStatus {
    return this._props.status;
  }

  get orderId() {
    return this._props.orderId;
  }

  get supplierId() {
    return this._props.supplierId;
  }

  get trackingNumber() {
    return this._props.trackingNumber;
  }

  isTerminal(): boolean {
    return TERMINAL_STATUSES.includes(this._props.status as DropshipOrderStatus);
  }

  canRetry(): boolean {
    return this._props.status === 'FAILED' && this._props.retryCount < MAX_RETRIES;
  }

  markSubmitted(supplierOrderId?: string): void {
    this._props.status = 'SUBMITTED';
    this._props.submittedAt = new Date();
    this._props.supplierOrderId = supplierOrderId ?? null;
    this._props.updatedAt = new Date();
  }

  markConfirmed(supplierOrderNumber?: string): void {
    this._props.status = 'CONFIRMED';
    this._props.confirmedAt = new Date();
    this._props.supplierOrderNumber = supplierOrderNumber ?? null;
    this._props.updatedAt = new Date();
  }

  markShipped(trackingNumber: string, carrier?: string): void {
    this._props.status = 'SHIPPED';
    this._props.shippedAt = new Date();
    this._props.trackingNumber = trackingNumber;
    this._props.carrier = carrier ?? null;
    this._props.updatedAt = new Date();
  }

  markDelivered(): void {
    this._props.status = 'DELIVERED';
    this._props.deliveredAt = new Date();
    this._props.updatedAt = new Date();
  }

  markFailed(error: string): void {
    this._props.status = 'FAILED';
    this._props.errors = [...this._props.errors, error];
    this._props.retryCount++;
    this._props.updatedAt = new Date();
  }

  cancel(reason?: string): void {
    this._props.status = 'CANCELLED';
    this._props.cancelledAt = new Date();
    if (reason) {
      this._props.notes = reason;
    }
    this._props.updatedAt = new Date();
  }

  toPrimitives(): DropshipOrderProps {
    return { ...this._props };
  }
}

/**
 * @deprecated Use DropshipOrder instead
 */
export const DropshipOrderEntity = DropshipOrder;
