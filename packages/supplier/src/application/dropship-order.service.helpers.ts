import { Money } from '@pranakaia/shared-kernel';
import {
  DropshipOrder,
  type DropshipOrderProps,
  type IDropshipOrderRepository,
  type ISupplierGateway,
  Result,
} from '../index';
import type { CreateDropshipOrderDTO, INotificationService } from './dropship-order.service';

export interface ServiceDeps {
  orderRepo: IDropshipOrderRepository;
  supplierGateway: ISupplierGateway;
  notifications?: INotificationService | undefined;
}

export async function processSingleCheckoutItem(
  item: CreateDropshipOrderDTO,
  deps: ServiceDeps,
): Promise<Result<DropshipOrderProps, Error>> {
  const unitCostResult = Money.create(item.unitCost, 'CLP');
  if (!unitCostResult.success) {
    return Result.err(unitCostResult.error as Error);
  }

  const orderResult = DropshipOrder.create({
    tenantId: item.tenantId,
    orderId: item.orderId,
    orderItemId: item.orderItemId,
    supplierId: item.supplierId,
    supplierProductId: item.supplierProductId,
    productId: item.productId,
    quantity: item.quantity,
    unitCost: unitCostResult.value!,
    shippingAddress: item.shippingAddress,
    notes: item.notes,
    autoSubmit: true,
  });

  if (orderResult.isFailure) {
    return Result.err(orderResult.errorValue);
  }

  const orderEntity = orderResult.getValue();
  await deps.orderRepo.save(orderEntity);

  return submitAndSaveDropshipOrder(orderEntity, deps);
}

export async function submitAndSaveDropshipOrder(
  orderEntity: DropshipOrder,
  deps: ServiceDeps,
): Promise<Result<DropshipOrderProps, Error>> {
  const props = orderEntity.toPrimitives();

  try {
    const gatewayResult = await deps.supplierGateway.submitOrder(props as unknown as DropshipOrder);

    orderEntity.markSubmitted(gatewayResult.externalOrderId);
    await deps.orderRepo.save(orderEntity);

    const submittedProps = orderEntity.toPrimitives();
    await notifyNewOrderSafely(submittedProps, deps.notifications);

    return Result.ok(submittedProps);
  } catch (err) {
    const errorMessage = `Auto-submit failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
    orderEntity.markFailed(errorMessage);
    await deps.orderRepo.save(orderEntity);

    const failedProps = orderEntity.toPrimitives();
    await notifyFailedOrderSafely(failedProps, deps.notifications);

    return Result.ok(failedProps);
  }
}

export async function notifyNewOrderSafely(
  props: DropshipOrderProps,
  notifications?: INotificationService,
): Promise<void> {
  if (!notifications) {
    return;
  }
  await notifications.notifyNewDropshipOrder(props).catch(() => {});
}

export async function notifyFailedOrderSafely(
  props: DropshipOrderProps,
  notifications?: INotificationService,
): Promise<void> {
  if (!notifications) {
    return;
  }
  await notifications.notifyDropshipOrderFailed(props).catch(() => {});
}
