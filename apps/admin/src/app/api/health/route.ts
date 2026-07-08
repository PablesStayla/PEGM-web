import { and, eq, gte } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db, orders, sql, webhookLogs } from '@/lib/db';
import { env } from '@/lib/env';

type CheckStatus = 'healthy' | 'degraded' | 'unhealthy';

function aggregateStatus(statuses: CheckStatus[]): CheckStatus {
  if (statuses.includes('unhealthy')) {
    return 'unhealthy';
  }
  if (statuses.includes('degraded')) {
    return 'degraded';
  }
  return 'healthy';
}

export async function POST() {
  const requestStart = Date.now();
  const now = new Date().toISOString();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const dbProbeStart = Date.now();
  let dbStatus: CheckStatus = 'healthy';
  let dbDetails: Record<string, unknown> = { provider: 'PostgreSQL (Supabase)' };

  try {
    await db.select({ now: sql<string>`now()` });
  } catch (error) {
    dbStatus = 'unhealthy';
    dbDetails = {
      ...dbDetails,
      error: error instanceof Error ? error.message : 'Unknown DB error',
    };
  }

  const dbResponseTime = Date.now() - dbProbeStart;

  let totalOrders24h = 0;
  let failedOrders24h = 0;
  let totalWebhooks24h = 0;
  let failedWebhooks24h = 0;

  if (dbStatus !== 'unhealthy') {
    const [ordersTotalRows, failedOrdersRows, webhooksTotalRows, failedWebhooksRows] =
      await Promise.all([
        db
          .select({ total: sql<number>`count(*)` })
          .from(orders)
          .where(gte(orders.createdAt, since24h)),
        db
          .select({ total: sql<number>`count(*)` })
          .from(orders)
          .where(and(gte(orders.createdAt, since24h), eq(orders.status, 'FAILED'))),
        db
          .select({ total: sql<number>`count(*)` })
          .from(webhookLogs)
          .where(gte(webhookLogs.createdAt, since24h)),
        db
          .select({ total: sql<number>`count(*)` })
          .from(webhookLogs)
          .where(and(gte(webhookLogs.createdAt, since24h), eq(webhookLogs.status, 'FAILED'))),
      ]);

    totalOrders24h = ordersTotalRows[0]?.total ?? 0;
    failedOrders24h = failedOrdersRows[0]?.total ?? 0;
    totalWebhooks24h = webhooksTotalRows[0]?.total ?? 0;
    failedWebhooks24h = failedWebhooksRows[0]?.total ?? 0;
  }

  const authConfigured = Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const sentryConfigured = Boolean(env.NEXT_PUBLIC_SENTRY_DSN);
  const cronConfigured = Boolean(env.CRON_SECRET);

  const checks = [
    {
      name: 'Database',
      status: dbStatus,
      responseTime: dbResponseTime,
      lastCheck: now,
      details: dbDetails,
    },
    {
      name: 'API Server',
      status: 'healthy' as const,
      responseTime: Math.max(Date.now() - requestStart, 1),
      lastCheck: now,
      details: { framework: 'Next.js 15', runtime: 'Node.js' },
    },
    {
      name: 'Auth Service',
      status: (authConfigured ? 'healthy' : 'degraded') as CheckStatus,
      responseTime: 0,
      lastCheck: now,
      details: {
        provider: 'Supabase Auth',
        configured: authConfigured,
      },
    },
    {
      name: 'Observability',
      status: (sentryConfigured ? 'healthy' : 'degraded') as CheckStatus,
      responseTime: 0,
      lastCheck: now,
      details: {
        provider: 'Sentry',
        configured: sentryConfigured,
      },
    },
    {
      name: 'Cron Security',
      status: (cronConfigured ? 'healthy' : 'degraded') as CheckStatus,
      responseTime: 0,
      lastCheck: now,
      details: {
        secretConfigured: cronConfigured,
      },
    },
  ];

  const avgResponseTime = Math.round(
    checks.reduce((sum, check) => sum + check.responseTime, 0) / checks.length,
  );
  const orderFailureRate = totalOrders24h > 0 ? (failedOrders24h / totalOrders24h) * 100 : 0;
  const webhookFailureRate =
    totalWebhooks24h > 0 ? (failedWebhooks24h / totalWebhooks24h) * 100 : 0;
  const overallStatus = aggregateStatus(checks.map((check) => check.status));

  return NextResponse.json({
    status: overallStatus,
    checks: checks,
    metrics: {
      orders24h: totalOrders24h,
      failedOrders24h,
      webhooks24h: totalWebhooks24h,
      failedWebhooks24h,
      performance: { avg: avgResponseTime },
      errors: { avg: Number(orderFailureRate.toFixed(2)) },
      throughput: { sum: totalOrders24h },
    },
    performance: {
      overallHealth: overallStatus,
      uptime: 'n/a',
      avgResponseTime,
      errorRate: Number(orderFailureRate.toFixed(2)),
      webhookErrorRate: Number(webhookFailureRate.toFixed(2)),
      throughput: totalOrders24h,
    },
  });
}

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
