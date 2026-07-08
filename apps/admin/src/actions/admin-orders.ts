'use server';

import {
  exportAdminOrdersCsvAction,
  getAdminOrderByIdAction,
  getAdminOrdersAction,
  updateOrderStatusAction,
} from './admin-orders.actions';

export async function getAdminOrders(...args: Parameters<typeof getAdminOrdersAction>) {
  return getAdminOrdersAction(...args);
}

export async function updateOrderStatus(...args: Parameters<typeof updateOrderStatusAction>) {
  return updateOrderStatusAction(...args);
}

export async function exportAdminOrdersCsv(...args: Parameters<typeof exportAdminOrdersCsvAction>) {
  return exportAdminOrdersCsvAction(...args);
}

export async function getAdminOrderById(...args: Parameters<typeof getAdminOrderByIdAction>) {
  return getAdminOrderByIdAction(...args);
}
