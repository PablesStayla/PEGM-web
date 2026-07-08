import type { SupplierId } from '@pranakaia/shared-kernel';
import { type DropshipOrderProps, type IDropshipOrderRepository, Result } from '../index';

/**
 * Dropship order read service.
 *
 * Query operations separated from the command service following CQS.
 * Consumers should inject this alongside {@link DropshipOrderService}
 * when they only need read access.
 */
export class DropshipOrderQueryService {
  constructor(private readonly orderRepo: IDropshipOrderRepository) {}

  /** Returns all dropship orders associated with a given customer order ID. */
  async getByOrder(orderId: string): Promise<Result<DropshipOrderProps[], Error>> {
    try {
      const orders = await this.orderRepo.findByOrderId(orderId);
      return Result.ok(orders.map((o) => o.toPrimitives()));
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error('Failed to get orders by order ID'),
      );
    }
  }

  /** Returns all dropship orders for a given supplier ID. */
  async getBySupplier(supplierId: string): Promise<Result<DropshipOrderProps[], Error>> {
    try {
      const orders = await this.orderRepo.findBySupplier(supplierId as SupplierId);
      return Result.ok(orders.map((o) => o.toPrimitives()));
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error('Failed to get orders by supplier ID'),
      );
    }
  }

  /** Returns all dropship orders in PENDING status awaiting supplier submission. */
  async getPending(): Promise<Result<DropshipOrderProps[], Error>> {
    try {
      const orders = await this.orderRepo.findPending();
      return Result.ok(orders.map((o) => o.toPrimitives()));
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to get pending orders'));
    }
  }
}
