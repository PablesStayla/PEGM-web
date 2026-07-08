import { db, sql } from '@pranakaia/infrastructure/db';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: HealthStatus;
    redis?: HealthStatus;
    stripe?: HealthStatus;
  };
  uptime: number;
}

interface HealthStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  message?: string;
}

const startTime = Date.now();

/**
 * Health check endpoint for monitoring and load balancers
 * GET /api/health
 */
export async function GET(): Promise<NextResponse> {
  const checks: HealthCheck['checks'] = {
    database: { status: 'down' },
  };

  // Database health check
  const dbStart = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = {
      status: 'up',
      responseTime: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: 'down',
      responseTime: Date.now() - dbStart,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Determine overall health
  const isDatabaseUp = checks.database.status === 'up';
  const overallStatus: HealthCheck['status'] = isDatabaseUp ? 'healthy' : 'unhealthy';

  const health: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: env.NEXT_PUBLIC_APP_VERSION,
    environment: env.NODE_ENV,
    checks,
    uptime: Date.now() - startTime,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 503;

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Liveness probe - minimal check for Kubernetes
 * HEAD /api/health
 */
export async function HEAD(): Promise<NextResponse> {
  return new NextResponse(null, { status: 200 });
}
