'use server';

/**
 * Reporting Resource Queries — RSC
 */

import 'server-only';
import { container } from '@/providers/container';
import { unwrapAsync } from '@/providers/data/result-bridge';

export async function getDashboardMetricsQuery(days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  return await unwrapAsync(container.reportingService.getDashboardMetrics(startDate, endDate));
}

export async function getSalesChartQuery(days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  return await unwrapAsync(container.reportingService.getSalesOverTime(startDate, endDate));
}

export async function getTopProductsQuery(limit = 5) {
  return await unwrapAsync(container.reportingService.getTopProducts(limit));
}
