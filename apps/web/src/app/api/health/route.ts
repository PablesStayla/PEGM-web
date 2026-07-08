/**
 * @file apps/web/src/app/api/health/route.ts
 *
 * Health check endpoint — GET /api/health
 *
 * Returns the operational status of the service and its dependencies.
 * Designed to be polled by Vercel, Uptime Robot, or any monitoring platform.
 *
 * Shape: { status, timestamp, version, responseTimeMs, checks }
 *
 * status  ‘healthy’  → HTTP 200
 * status  ‘degraded’ → HTTP 200  (partially functional, alerting warranted)
 * status  ‘unhealthy’→ HTTP 503  (load-balancer should stop routing)
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { createLogger } from '@/lib/logger';
import {
  HealthChecker,
  MetricsCollector,
  PerformanceMonitor,
} from '@/lib/monitoring/enterprise-monitoring';
import { EnterpriseAuditor } from '@/lib/security/enterprise-security';

const log = createLogger({ module: 'health' });

const CACHE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

function statusCode(health: HealthStatus): 200 | 503 {
  return health === 'unhealthy' ? 503 : 200;
}

// ── GET /api/health ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const startTime = performance.now();

  try {
    const ip =
      request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';

    const healthChecker = HealthChecker.getInstance();
    const performanceMonitor = PerformanceMonitor.getInstance();
    const metricsCollector = MetricsCollector.getInstance();

    const [healthChecks, aggregatedMetrics] = await Promise.all([
      healthChecker.runHealthChecks(),
      Promise.resolve(metricsCollector.getAggregatedMetrics(300_000)), // last 5 min
    ]);

    const overallHealth = healthChecker.getOverallHealth() as HealthStatus;
    const responseTimeMs = Math.round(performance.now() - startTime);

    // Non-blocking side effects — do not await to keep response latency minimal
    void performanceMonitor.trackRequest(request, responseTimeMs, 200);
    void EnterpriseAuditor.logEvent({
      action: 'health_check_accessed',
      resource: '/api/health',
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') ?? 'unknown',
      metadata: { overallHealth, responseTimeMs, checksCount: healthChecks.length },
      severity: 'low',
      success: true,
    });

    log.debug('Health check complete', { overallHealth, responseTimeMs });

    return NextResponse.json(
      {
        status: overallHealth,
        timestamp: new Date().toISOString(),
        responseTimeMs,
        version: env.NEXT_PUBLIC_APP_VERSION,
        environment: env.NODE_ENV,
        checks: healthChecks,
        metrics: {
          performance: aggregatedMetrics['performance.response_time'] ?? { avg: 0, count: 0 },
          errors: aggregatedMetrics['performance.error_rate'] ?? { avg: 0, count: 0 },
          throughput: aggregatedMetrics['performance.throughput'] ?? { sum: 0, count: 0 },
        },
      },
      {
        status: statusCode(overallHealth),
        headers: {
          ...CACHE_HEADERS,
          'X-Health-Status': overallHealth,
          'X-Response-Time': `${responseTimeMs}ms`,
        },
      },
    );
  } catch (error) {
    const responseTimeMs = Math.round(performance.now() - startTime);
    const message = error instanceof Error ? error.message : 'Unknown error';

    log.error('Health check failed', { error: message, responseTimeMs });

    // Intentionally do not await audit on error path to avoid double-failure risk
    void EnterpriseAuditor.logEvent({
      action: 'health_check_error',
      resource: '/api/health',
      ipAddress: request.headers.get('x-forwarded-for') ?? 'unknown',
      userAgent: request.headers.get('user-agent') ?? 'unknown',
      metadata: { error: message, responseTimeMs },
      severity: 'high',
      success: false,
    });

    return NextResponse.json(
      {
        status: 'unhealthy' satisfies HealthStatus,
        timestamp: new Date().toISOString(),
        responseTimeMs,
        error: 'Health check failed',
      },
      { status: 503, headers: CACHE_HEADERS },
    );
  }
}

// ── POST /api/health (detailed, authenticated) ────────────────────────────────

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const includeMetrics = body['includeMetrics'] === true;

    const healthChecker = HealthChecker.getInstance();
    const metricsCollector = MetricsCollector.getInstance();

    const [healthChecks, metrics] = await Promise.all([
      healthChecker.runHealthChecks(),
      includeMetrics
        ? Promise.resolve(metricsCollector.getMetrics(undefined, undefined, 1_000))
        : Promise.resolve([]),
    ]);

    const overallHealth = healthChecker.getOverallHealth() as HealthStatus;
    const responseTimeMs = Math.round(performance.now() - startTime);

    log.info('Detailed health check requested', { overallHealth, responseTimeMs, includeMetrics });

    return NextResponse.json(
      {
        status: overallHealth,
        timestamp: new Date().toISOString(),
        responseTimeMs,
        checks: healthChecks,
        metrics: includeMetrics ? metrics : undefined,
        summary: {
          total: healthChecks.length,
          healthy: healthChecks.filter((c) => c.status === 'healthy').length,
          degraded: healthChecks.filter((c) => c.status === 'degraded').length,
          unhealthy: healthChecks.filter((c) => c.status === 'unhealthy').length,
        },
      },
      { status: statusCode(overallHealth), headers: CACHE_HEADERS },
    );
  } catch (error) {
    const responseTimeMs = Math.round(performance.now() - startTime);
    const message = error instanceof Error ? error.message : 'Unknown error';

    log.error('Detailed health check failed', { error: message });

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        responseTimeMs,
        error: message,
      },
      { status: 500, headers: CACHE_HEADERS },
    );
  }
}
