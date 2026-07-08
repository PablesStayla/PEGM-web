import type { DropshipOrderId } from '@pranakaia/shared-kernel';
import {
  type DropshipOrderProps,
  type IDropshipOrderRepository,
  type ISupplierGateway,
  Result,
} from '../index';
import { processSingleCheckoutItem } from './dropship-order.service.helpers';

/** Input DTO for creating dropship orders from a checkout event. */
export interface CreateDropshipOrderDTO {
  tenantId: string;
  orderId: string;
  orderItemId: string;
  supplierId: string;
  supplierProductId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  shippingAddress: Record<string, unknown>;
  notes?: string;
}

/** Port for notification delivery after dropship order state transitions. */
export interface INotificationService {
  notifyNewDropshipOrder(order: DropshipOrderProps): Promise<void>;
  notifyDropshipOrderShipped(order: DropshipOrderProps): Promise<void>;
  notifyDropshipOrderFailed(order: DropshipOrderProps): Promise<void>;
}

/**
 * Dropship order command service.
 *
 * Handles state-changing operations: order creation, shipping updates,
 * delivery confirmation, failure marking, and cancellation.
 * Read operations live in {@link DropshipOrderQueryService}.
 */
export class DropshipOrderService {
  constructor(
    private readonly orderRepo: IDropshipOrderRepository,
    private readonly supplierGateway: ISupplierGateway,
    private readonly notifications?: INotificationService,
  ) {}

  /** Creates dropship orders from checkout items and auto-submits them to the supplier gateway. */
  async createFromCheckout(
    items: CreateDropshipOrderDTO[],
  ): Promise<Result<DropshipOrderProps[], Error>> {
    const createdProps: DropshipOrderProps[] = [];

    for (const item of items) {
      const processRes = await processSingleCheckoutItem(item, {
        orderRepo: this.orderRepo,
        supplierGateway: this.supplierGateway,
        notifications: this.notifications,
      });
      if (processRes.isFailure) {
        return Result.err(processRes.errorValue);
      }
      createdProps.push(processRes.getValue());
    }

    return Result.ok(createdProps);
  }

  /** Updates shipping tracking for a dropship order and notifies stakeholders. */
  async updateShipping(
    dropshipOrderId: string,
    trackingNumber: string,
    carrier?: string,
  ): Promise<Result<DropshipOrderProps, Error>> {
    try {
      const orderEntity = await this.orderRepo.findById(dropshipOrderId as DropshipOrderId);
      if (!orderEntity) {
        return Result.err(new Error(`DropshipOrder ${dropshipOrderId} not found`));
      }

      orderEntity.markShipped(trackingNumber, carrier);
      await this.orderRepo.save(orderEntity);

      const updatedProps = orderEntity.toPrimitives();
      if (this.notifications) {
        await this.notifications.notifyDropshipOrderShipped(updatedProps).catch(() => {});
      }

      return Result.ok(updatedProps);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to update shipping'));
    }
  }

  /** Marks a dropship order as delivered to the end customer. */
  async markDelivered(dropshipOrderId: string): Promise<Result<DropshipOrderProps, Error>> {
    try {
      const orderEntity = await this.orderRepo.findById(dropshipOrderId as DropshipOrderId);
      if (!orderEntity) {
        return Result.err(new Error(`DropshipOrder ${dropshipOrderId} not found`));
      }

      orderEntity.markDelivered();
      await this.orderRepo.save(orderEntity);
      return Result.ok(orderEntity.toPrimitives());
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to mark as delivered'));
    }
  }

  /** Marks a dropship order as failed with a reason and notifies stakeholders. */
  async markFailed(
    dropshipOrderId: string,
    error: string,
  ): Promise<Result<DropshipOrderProps, Error>> {
    try {
      const orderEntity = await this.orderRepo.findById(dropshipOrderId as DropshipOrderId);
      if (!orderEntity) {
        return Result.err(new Error(`DropshipOrder ${dropshipOrderId} not found`));
      }

      orderEntity.markFailed(error);
      await this.orderRepo.save(orderEntity);

      const updatedProps = orderEntity.toPrimitives();
      if (this.notifications) {
        await this.notifications.notifyDropshipOrderFailed(updatedProps).catch(() => {});
      }

      return Result.ok(updatedProps);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to mark as failed'));
    }
  }

  /** Cancels a dropship order if the supplier allows it. */
  async cancel(
    dropshipOrderId: string,
    reason?: string,
  ): Promise<Result<DropshipOrderProps, Error>> {
    try {
      const orderEntity = await this.orderRepo.findById(dropshipOrderId as DropshipOrderId);
      if (!orderEntity) {
        return Result.err(new Error(`DropshipOrder ${dropshipOrderId} not found`));
      }

      orderEntity.cancel(reason);
      await this.orderRepo.save(orderEntity);
      return Result.ok(orderEntity.toPrimitives());
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to cancel order'));
    }
  }
}
