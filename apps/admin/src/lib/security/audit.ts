import { auditLogs } from '@pranakaia/infrastructure/db';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export const ADMIN_AUDIT_EVENTS = {
  ACCESS_RECORDED: 'admin_access_recorded',
  RBAC_ACCESS_DENIED: 'admin_rbac_access_denied',
  CONFIGURATION_CHANGED: 'configuration_changed',
  MFA_ENABLED: 'admin_mfa_enabled',
  MFA_DISABLED: 'admin_mfa_disabled',
  MFA_STEP_UP_VERIFIED: 'admin_mfa_step_up_verified',
  MFA_STEP_UP_FAILED: 'admin_mfa_step_up_failed',
  PRODUCT_STATUS_CHANGED: 'admin_product_status_changed',
  PRODUCT_UPDATED: 'admin_product_updated',
  PRODUCT_ARCHIVED: 'admin_product_archived',
  PRODUCT_CREATED: 'admin_product_created',
  INVENTORY_UPDATED: 'admin_inventory_updated',
  ORDER_STATUS_CHANGED: 'admin_order_status_changed',
  ORDER_CSV_EXPORTED: 'admin_order_csv_exported',
  CMS_PAGE_UPSERTED: 'admin_cms_page_upserted',
  CMS_PAGE_DELETED: 'admin_cms_page_deleted',
} as const;

type AdminAuditEventType =
  | (typeof ADMIN_AUDIT_EVENTS)[keyof typeof ADMIN_AUDIT_EVENTS]
  | (string & {});

type AdminAuditSeverity = 'info' | 'warning' | 'error' | 'critical';

type AdminAuditEntry = {
  eventType: AdminAuditEventType;
  severity?: AdminAuditSeverity;
  userId?: string;
  resource?: string;
  action?: string;
  metadata?: Record<string, unknown>;
};

async function getRequestContext() {
  try {
    const headerStore = await headers();
    const forwardedFor = headerStore.get('x-forwarded-for');
    const ipAddress = forwardedFor?.split(',')[0]?.trim() ?? undefined;

    return {
      ipAddress,
      userAgent: headerStore.get('user-agent') ?? undefined,
    };
  } catch {
    return {
      ipAddress: undefined,
      userAgent: undefined,
    };
  }
}

export async function logAdminAuditEvent(entry: AdminAuditEntry): Promise<void> {
  try {
    const requestContext = await getRequestContext();

    await db.insert(auditLogs).values({
      action: entry.action || entry.eventType,
      entityType: entry.resource || 'admin_action',
      entityId: (entry.metadata?.id as string) || null,
      severity: entry.severity ?? 'info',
      userId: entry.userId,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
      metadata: entry.metadata,
      createdAt: new Date(),
    });
  } catch (error) {
    logger.error('Admin audit logging error', {
      error: error instanceof Error ? error.message : String(error),
      eventType: entry.eventType,
      resource: entry.resource,
      action: entry.action,
    });
  }
}
