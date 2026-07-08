import { requireAdmin } from '@pranakaia/infrastructure/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';
import { createLogger } from '@/lib/logger';
import { ADMIN_AUDIT_EVENTS, logAdminAuditEvent } from '@/lib/security/audit';

const log = createLogger({ module: 'api:internal:audit:access' });

const accessAuditPayloadSchema = z.object({
  pathname: z.string().min(1).max(512),
  method: z.string().trim().min(1).max(16).default('GET'),
  responseStatus: z.number().int().min(100).max(599).optional(),
  referer: z.string().max(2048).optional().nullable(),
});

const ACCESS_AUDIT_THROTTLE_MS = 60_000;
const ACCESS_AUDIT_CACHE_MAX_SIZE = 5000;
const recentAccessAudit = new Map<string, number>();

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (!forwardedFor) {
    return 'unknown';
  }

  return forwardedFor.split(',')[0]?.trim() || 'unknown';
}

function shouldThrottleAudit(ipAddress: string, pathname: string): boolean {
  const key = `${ipAddress}:${pathname}`;
  const now = Date.now();
  const lastSeenAt = recentAccessAudit.get(key);

  if (lastSeenAt && now - lastSeenAt < ACCESS_AUDIT_THROTTLE_MS) {
    return true;
  }

  recentAccessAudit.set(key, now);

  if (recentAccessAudit.size > ACCESS_AUDIT_CACHE_MAX_SIZE) {
    for (const [cacheKey, timestamp] of recentAccessAudit.entries()) {
      if (now - timestamp > ACCESS_AUDIT_THROTTLE_MS * 5) {
        recentAccessAudit.delete(cacheKey);
      }

      if (recentAccessAudit.size <= ACCESS_AUDIT_CACHE_MAX_SIZE) {
        break;
      }
    }
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const auditSecret = env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    if (!auditSecret || authHeader !== `Bearer ${auditSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsedBody = accessAuditPayloadSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { pathname, method, responseStatus, referer } = parsedBody.data;
    const ipAddress = getClientIp(request);

    if (shouldThrottleAudit(ipAddress, pathname)) {
      return NextResponse.json({ success: true, skipped: 'throttled' }, { status: 202 });
    }

    const adminUser = await requireAdmin().catch(() => null);

    if (!adminUser) {
      return NextResponse.json({ success: true, skipped: 'not_admin' }, { status: 202 });
    }

    await logAdminAuditEvent({
      eventType: ADMIN_AUDIT_EVENTS.ACCESS_RECORDED,
      severity: responseStatus && responseStatus >= 400 ? 'warning' : 'info',
      userId: adminUser.id,
      resource: 'admin_access',
      action: 'route_access',
      metadata: {
        pathname,
        method,
        responseStatus: responseStatus ?? null,
        referer: referer ?? null,
        source: 'admin_middleware',
      },
    });

    return NextResponse.json({ success: true }, { status: 202 });
  } catch (error) {
    log.error('Admin access audit endpoint error', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
