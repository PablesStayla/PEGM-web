'use server';

/**
 * Audit Resource Queries — RSC
 */

import 'server-only';
import { container } from '@/providers/container';
import { unwrapAsync } from '@/providers/data/result-bridge';
import type { AuditLogFilters } from '../application/audit.service';

export async function getAuditLogsQuery(filters: AuditLogFilters = {}) {
  return await unwrapAsync(container.auditService.getAuditLogs(filters));
}
