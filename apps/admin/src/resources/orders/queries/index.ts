import { container } from '@/providers/container';
import { unwrapAsync } from '@/providers/data/result-bridge';
import type { OrderFilters } from '../application/order.service';

/**
 * Orders Resource Queries — RSC Data Fetching
 *
 * Logic:
 * 1. Internal business logic is called directly (no network overhead)
 * 2. Result is unwrapped
 * 3. Returns pure data for the page/component
 */
export async function getAdminOrdersQuery(filters: OrderFilters) {
  // RSCs can call services directly via the container
  return await unwrapAsync(container.orderService.getAdminOrders(filters));
}

export async function getAdminOrderByIdQuery(id: string) {
  return await unwrapAsync(container.orderService.getOrderById(id));
}
