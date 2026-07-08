/**
 * Security Audit Logger
 * ENTERPRISE implementation for tracking security events
 */

import { observabilityLogger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

export enum AuditEventType {
  // Authentication
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  PASSWORD_CHANGED = 'password_changed',

  // Authorization
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PERMISSION_DENIED = 'permission_denied',

  // Account Security
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  TWO_FACTOR_FAILED = 'two_factor_failed',

  // Data Access
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  DATA_EXPORT = 'data_export',
  DATA_DELETION = 'data_deletion',

  // Security Violations
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CSRF_TOKEN_INVALID = 'csrf_token_invalid',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',

  // Admin Actions
  USER_ROLE_CHANGED = 'user_role_changed',
  USER_SUSPENDED = 'user_suspended',
  USER_ACTIVATED = 'user_activated',

  // System
  CONFIGURATION_CHANGED = 'configuration_changed',
  BACKUP_CREATED = 'backup_created',
  BACKUP_RESTORED = 'backup_restored',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

interface AuditLogEntry {
  event_type: AuditEventType;
  severity: AuditSeverity;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  resource?: string;
  action?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

/**
 * Log security audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient();

    // Add timestamp if not provided
    const logEntry = {
      ...entry,
      created_at: entry.created_at || new Date().toISOString(),
    };

    // Store in database (supabase shim - logs to console)
    const client = supabase as unknown as {
      from?: (table: string) => { insert?: (data: unknown) => Promise<{ error: unknown }> };
    };
    const { error } = (await client.from?.('audit_logs')?.insert?.(logEntry)) ?? { error: null };
    observabilityLogger.info('Audit event logged', { eventType: logEntry.event_type });

    if (error) {
      observabilityLogger.error('Audit Logger failed to log event', {
        error: error instanceof Error ? (error as Error).message : String(error),
      });
      // Fallback to console logging
      observabilityLogger.warn('Audit Logger fallback event', {
        event: logEntry as unknown as Record<string, unknown>,
      });
    }

    // Forward critical events to external monitoring (Sentry) — A-09 fix
    if (entry.severity === AuditSeverity.CRITICAL || entry.severity === AuditSeverity.ERROR) {
      const sentryCapture = (
        globalThis as unknown as {
          __sentry_error__?: (msg: string, extra?: Record<string, unknown>) => void;
        }
      ).__sentry_error__;
      if (sentryCapture) {
        sentryCapture(`[AUDIT] ${entry.event_type}`, {
          severity: entry.severity,
          userId: entry.user_id,
          resource: entry.resource,
          action: entry.action,
          ipAddress: entry.ip_address,
          metadata: entry.metadata,
        });
      } else {
        observabilityLogger.error('CRITICAL AUDIT — Sentry not initialized', {
          event: logEntry as unknown as Record<string, unknown>,
        });
      }
    }
  } catch (error) {
    observabilityLogger.error('Audit Logger error logging audit event', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Helper functions for common audit scenarios
 */

export async function logLoginAttempt(
  userId: string | undefined,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  await logAuditEvent({
    event_type: success ? AuditEventType.LOGIN_SUCCESS : AuditEventType.LOGIN_FAILED,
    severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
    user_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: { success },
  });
}

export async function logUnauthorizedAccess(
  userId: string | undefined,
  resource: string,
  ipAddress?: string,
): Promise<void> {
  await logAuditEvent({
    event_type: AuditEventType.UNAUTHORIZED_ACCESS,
    severity: AuditSeverity.WARNING,
    user_id: userId,
    ip_address: ipAddress,
    resource,
  });
}

export async function logRateLimitExceeded(ipAddress: string, endpoint: string): Promise<void> {
  await logAuditEvent({
    event_type: AuditEventType.RATE_LIMIT_EXCEEDED,
    severity: AuditSeverity.WARNING,
    ip_address: ipAddress,
    resource: endpoint,
  });
}

export async function logCsrfViolation(ipAddress?: string, userAgent?: string): Promise<void> {
  await logAuditEvent({
    event_type: AuditEventType.CSRF_TOKEN_INVALID,
    severity: AuditSeverity.ERROR,
    ip_address: ipAddress,
    user_agent: userAgent,
  });
}

export async function logSensitiveDataAccess(
  userId: string,
  resource: string,
  action: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await logAuditEvent({
    event_type: AuditEventType.SENSITIVE_DATA_ACCESS,
    severity: AuditSeverity.INFO,
    user_id: userId,
    resource,
    action,
    metadata,
  });
}

export async function logSuspiciousActivity(
  description: string,
  userId?: string,
  ipAddress?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await logAuditEvent({
    event_type: AuditEventType.SUSPICIOUS_ACTIVITY,
    severity: AuditSeverity.CRITICAL,
    user_id: userId,
    ip_address: ipAddress,
    metadata: {
      description,
      ...metadata,
    },
  });
}

export async function logConfigurationChange(
  userId: string,
  resource: string,
  changes: Record<string, unknown>,
): Promise<void> {
  await logAuditEvent({
    event_type: AuditEventType.CONFIGURATION_CHANGED,
    severity: AuditSeverity.WARNING,
    user_id: userId,
    resource,
    metadata: { changes },
  });
}
