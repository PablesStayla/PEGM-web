import { auditLogs, db, users } from '@pranakaia/infrastructure/db';
import { Result } from '@pranakaia/shared-kernel';
import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export interface AuditLogFilters {
  userId?: string;
  resource?: string;
  action?: string;
  severity?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

export class AuditService {
  /**
   * Retrieves paginated audit logs.
   */
  async getAuditLogs(filters: AuditLogFilters): Promise<Result<any, Error>> {
    try {
      const { userId, resource, action, severity, page = 1, pageSize = 50, search } = filters;

      const whereConditions = [];
      if (userId) {
        whereConditions.push(eq(auditLogs.userId, userId));
      }
      if (resource) {
        whereConditions.push(eq(auditLogs.entityType, resource));
      }
      if (action) {
        whereConditions.push(eq(auditLogs.action, action));
      }
      if (severity) {
        whereConditions.push(eq(auditLogs.severity, severity as any));
      }

      if (search) {
        whereConditions.push(
          or(
            ilike(auditLogs.action, `%${search}%`),
            ilike(auditLogs.entityType, `%${search}%`),
            ilike(users.email, `%${search}%`),
          ),
        );
      }

      const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const [logs, totalResult] = await Promise.all([
        db
          .select({
            id: auditLogs.id,
            action: auditLogs.action,
            entityType: auditLogs.entityType,
            entityId: auditLogs.entityId,
            severity: auditLogs.severity,
            createdAt: auditLogs.createdAt,
            ipAddress: auditLogs.ipAddress,
            userAgent: auditLogs.userAgent,
            metadata: auditLogs.metadata,
            user: {
              email: users.email,
              firstName: users.firstName,
              lastName: users.lastName,
            },
          })
          .from(auditLogs)
          .leftJoin(users, eq(auditLogs.userId, users.id))
          .where(where)
          .orderBy(desc(auditLogs.createdAt))
          .limit(pageSize)
          .offset((page - 1) * pageSize),
        db
          .select({ count: count() })
          .from(auditLogs)
          .leftJoin(users, eq(auditLogs.userId, users.id))
          .where(where),
      ]);

      return Result.ok({
        items: logs,
        total: totalResult[0]?.count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((totalResult[0]?.count || 0) / pageSize),
      });
    } catch (error) {
      logger.error('AuditService.getAuditLogs error', { error });
      return Result.err(error instanceof Error ? error : new Error('Failed to get audit logs'));
    }
  }
}
