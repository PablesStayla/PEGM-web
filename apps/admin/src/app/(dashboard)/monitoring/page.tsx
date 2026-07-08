/**
 * 📊 Staff SRE Dashboard — Obsidian Operations Center
 *
 * Panel de telemetría Staff-grade que combina:
 *   - Monitoring Tier 0 (DB, Webhooks, Órdenes)
 *   - Sentinel Heartbeat & Architecture Violations
 *   - Historial del Health Ledger
 *   - Estado de Inngest (Proyecto Lázaro)
 */

import fs from 'node:fs';
import path from 'node:path';
import { auditLogs, orders, webhookLogs } from '@pranakaia/infrastructure/db';
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { MonitoringDashboard } from '@/resources/monitoring/MonitoringDashboard';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // SRE: Refresco cada 60s

export const metadata = {
  title: 'Staff Operations Center | Admin — PranaKaia',
  description: 'Panel SRE Staff-grade con telemetría del Sentinel, Health Ledger y Lázaro.',
};

// ── Lee el Health Ledger del disco ────────────────────────────────────────────
function readHealthLedger(): string[] {
  try {
    const ledgerPath = path.join(process.cwd(), '../../docs/reports/HEALTH_LEDGER.log');
    if (!fs.existsSync(ledgerPath)) {
      return ['[LEDGER] Archivo no encontrado.'];
    }
    const raw = fs.readFileSync(ledgerPath, 'utf-8');
    return raw.split('\n').filter(Boolean).slice(-25).reverse();
  } catch {
    return ['[LEDGER] Error al leer el archivo.'];
  }
}

// ── Lee los incidentes del Sentinel ──────────────────────────────────────────
function readIncidentLog(): string[] {
  try {
    const logPath = path.join(process.cwd(), '../../docs/reports/INCIDENTS.log');
    if (!fs.existsSync(logPath)) {
      return ['[SENTINEL] Sin incidentes registrados.'];
    }
    const raw = fs.readFileSync(logPath, 'utf-8');
    return raw.split('\n').filter(Boolean).slice(-15).reverse();
  } catch {
    return ['[SENTINEL] Error al leer incidentes.'];
  }
}

export default async function StaffOperationsPage() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // ── DB Probe ──────────────────────────────────────────────────────────────
  const dbProbeStart = Date.now();
  await db.select({ now: sql<string>`now()` });
  const dbLatencyMs = Date.now() - dbProbeStart;
  const dbStatus = dbLatencyMs < 100 ? 'healthy' : dbLatencyMs < 300 ? 'degraded' : 'critical';

  // ── Métricas de Base de Datos (24h) ──────────────────────────────────────
  const [
    webhooks24h,
    failedWebhooks24h,
    totalOrders24h,
    failedOrders24h,
    criticalAudits24h,
    recentAudits,
  ] = await Promise.all([
    db
      .select({ total: sql<number>`count(*)` })
      .from(webhookLogs)
      .where(gte(webhookLogs.createdAt, since24h)),
    db
      .select({ total: sql<number>`count(*)` })
      .from(webhookLogs)
      .where(and(gte(webhookLogs.createdAt, since24h), eq(webhookLogs.status, 'FAILED'))),
    db.select({ total: sql<number>`count(*)` }).from(orders).where(gte(orders.createdAt, since24h)),
    db
      .select({ total: sql<number>`count(*)` })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, since24h),
          inArray(orders.status, ['FAILED', 'CANCELLED'] as const),
        ),
      ),
    db
      .select({ total: sql<number>`count(*)` })
      .from(auditLogs)
      .where(
        and(
          gte(auditLogs.createdAt, since24h),
          inArray(auditLogs.severity, ['critical', 'error'] as const),
        ),
      ),
    db
      .select({
        id: auditLogs.id,
        eventType: auditLogs.action,
        severity: auditLogs.severity,
        action: auditLogs.action,
        resource: auditLogs.entityType,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(20),
  ]);

  const webhookTotal = webhooks24h[0]?.total ?? 0;
  const webhookFailed = failedWebhooks24h[0]?.total ?? 0;
  const ordersTotal = totalOrders24h[0]?.total ?? 0;
  const ordersFailed = failedOrders24h[0]?.total ?? 0;
  const criticalAudits = criticalAudits24h[0]?.total ?? 0;
  const orderSuccessRate =
    ordersTotal > 0 ? ((ordersTotal - ordersFailed) / ordersTotal) * 100 : 100;

  // ── Logs del Filesystem ───────────────────────────────────────────────────
  const ledgerEntries = readHealthLedger();
  const incidentEntries = readIncidentLog();

  return (
    <MonitoringDashboard
      dbLatencyMs={dbLatencyMs}
      dbStatus={dbStatus as any}
      criticalAudits={criticalAudits}
      ordersTotal={ordersTotal}
      ordersFailed={ordersFailed}
      orderSuccessRate={orderSuccessRate}
      webhookTotal={webhookTotal}
      webhookFailed={webhookFailed}
      ledgerEntries={ledgerEntries}
      incidentEntries={incidentEntries}
      recentAudits={recentAudits as any}
    />
  );
}
