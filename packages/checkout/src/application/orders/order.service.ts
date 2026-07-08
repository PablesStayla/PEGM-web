import type { OrderId } from '@pranakaia/shared-kernel';
import { AuditService, DomainError, Result } from '@pranakaia/shared-kernel';
import type { CreateOrderParams, OrderRepository } from '../../domain/ports/order-repository';

export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async createOrder(
    params: CreateOrderParams,
  ): Promise<Result<{ id: OrderId; orderNumber: string }, Error>> {
    const createRes = await this.orderRepository.create(params);
    if (createRes.isFailure) {
      return Result.err(createRes.errorValue);
    }

    const result = createRes.getValue();

    await AuditService.log({
      action: 'order_created',
      entityType: 'order',
      entityId: result.id,
      severity: 'info',
      newData: { orderNumber: result.orderNumber, total: params.totalAmount.amount },
    });

    return Result.ok(result);
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    userId?: string,
  ): Promise<Result<void, Error>> {
    const brandedOrderId = orderId as OrderId;

    const findRes = await this.orderRepository.findById(brandedOrderId);
    if (findRes.isFailure) {
      return Result.err(findRes.errorValue);
    }

    const existing = findRes.getValue();
    if (!existing) {
      return Result.err(
        new DomainError('Orden no encontrada', 'ORDER_NOT_FOUND', { statusCode: 404 }),
      );
    }

    const updateRes = await this.orderRepository.updateStatus(brandedOrderId, status);
    if (updateRes.isFailure) {
      return Result.err(updateRes.errorValue);
    }

    await AuditService.log({
      action: 'order_status_updated',
      entityType: 'order',
      entityId: brandedOrderId,
      severity: 'info',
      userId,
      metadata: {
        oldStatus: (existing as Record<string, unknown>)?.status as string | undefined,
        newStatus: status,
      },
    });

    return Result.ok(undefined);
  }
}
