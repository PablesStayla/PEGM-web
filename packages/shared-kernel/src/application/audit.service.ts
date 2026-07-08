export type AuditAction =
  | 'signup'
  | 'login'
  | 'mfa_verify'
  | 'logout'
  | 'password_change'
  | 'checkout_started'
  | 'checkout_completed'
  | 'checkout_failed'
  | 'payment_initiated'
  | 'payment_verified'
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'cart_cleared'
  | 'order_status_changed'
  | string;

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLogEntry {
  action: AuditAction;
  entityType: string;
  entityId?: string | undefined;
  severity: AuditSeverity;
  userId?: string | undefined;
  oldData?: unknown | undefined;
  newData?: unknown | undefined;
  metadata?: unknown | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  correlationId?: string | undefined;
}

export type AuditWriter = (entry: AuditLogEntry) => Promise<void>;

const noopWriter: AuditWriter = async () => {
  // Deliberately empty: domain layer must stay infra-agnostic.
};

/**
 * AuditService: Centralizes forensic audit logging across bounded contexts.
 * Part of Shared Kernel to avoid circular dependencies between domain packages and application layer.
 */
export class AuditService {
  private static writer: AuditWriter = noopWriter;

  static configureWriter(writer: AuditWriter | null | undefined): void {
    AuditService.writer = writer ?? noopWriter;
  }

  /**
   * Registers an action in the forensic audit log.
   * Centralizes traceability for compliance and security.
   */
  static async log(params: Omit<AuditLogEntry, 'severity'> & { severity?: AuditSeverity }) {
    const entry: AuditLogEntry = {
      ...params,
      severity: params.severity ?? 'info',
    };

    try {
      await AuditService.writer(entry);
    } catch {
      // SRE Protocol: If audit fails, we don't block the main action to protect critical flows.
    }
  }
}
