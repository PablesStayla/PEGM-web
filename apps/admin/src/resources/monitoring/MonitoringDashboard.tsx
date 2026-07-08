'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle,
  Database,
  Heart,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  eventType: string;
  severity: string;
  action: string | null;
  resource: string | null;
  createdAt: Date;
}

interface MonitoringDashboardProps {
  dbLatencyMs: number;
  dbStatus: 'healthy' | 'degraded' | 'critical';
  criticalAudits: number;
  ordersTotal: number;
  ordersFailed: number;
  orderSuccessRate: number;
  webhookTotal: number;
  webhookFailed: number;
  ledgerEntries: string[];
  incidentEntries: string[];
  recentAudits: AuditLogEntry[];
}

const statusColor: Record<string, string> = {
  healthy: 'text-emerald-400',
  degraded: 'text-amber-400',
  critical: 'text-red-400',
};

export function MonitoringDashboard({
  dbLatencyMs,
  dbStatus,
  criticalAudits,
  orderSuccessRate,
  webhookTotal,
  ledgerEntries,
  incidentEntries,
  recentAudits,
}: MonitoringDashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg border border-white/5">
              <Terminal className="h-6 w-6 text-[#14b8a6]" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              Staff <span className="text-[#14b8a6]">Ops</span> Center
            </h1>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-[0.3em] ml-12">
            Protocolo de Telemetría v2.4.0 — PranaKaia Sentinel
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">
              Operational: S+
            </span>
          </div>
        </div>
      </div>

      {/* ── Real-time Status Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* DB Latency */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="luxury-card-admin p-6 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
              <Database className="h-4 w-4 text-[#14b8a6]" />
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${statusColor[dbStatus]}`}
            >
              {dbStatus}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-black text-white font-mono tracking-tighter">
              {dbLatencyMs}
              <span className="text-sm text-gray-600 ml-1">ms</span>
            </p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Latencia Postgres
            </p>
          </div>
        </motion.div>

        {/* Violaciones de Seguridad */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="luxury-card-admin p-6 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${criticalAudits > 0 ? 'text-rose-400' : 'text-emerald-400'}`}
            >
              {criticalAudits === 0 ? 'Secure' : 'Alert'}
            </span>
          </div>
          <div className="space-y-1">
            <p
              className={`text-4xl font-black font-mono tracking-tighter ${criticalAudits > 0 ? 'text-rose-400' : 'text-white'}`}
            >
              {criticalAudits}
            </p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Audit Violations (24h)
            </p>
          </div>
        </motion.div>

        {/* Success Rate */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="luxury-card-admin p-6 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
              <Activity className="h-4 w-4 text-orange-400" />
            </div>
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
              Flow Rate
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-black text-white font-mono tracking-tighter">
              {orderSuccessRate.toFixed(1)}
              <span className="text-sm text-gray-600 ml-1">%</span>
            </p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Éxito en Órdenes
            </p>
          </div>
        </motion.div>

        {/* Webhooks Activity */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="luxury-card-admin p-6 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
              Relay Stats
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-black text-white font-mono tracking-tighter">
              {webhookTotal}
              <span className="text-sm text-gray-600 ml-1">evt</span>
            </p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Webhooks Recibidos
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Telemetry Panels ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Ledger */}
        <div className="luxury-card-admin overflow-hidden flex flex-col h-[400px]">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-[#14b8a6]" />
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                Health Ledger <span className="text-gray-500 font-medium">/ SYSLOG</span>
              </h2>
            </div>
            <div className="flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <div className="h-1.5 w-1.5 rounded-full bg-gray-800" />
              <div className="h-1.5 w-1.5 rounded-full bg-gray-800" />
            </div>
          </div>
          <div className="p-6 overflow-auto font-mono text-[11px] leading-relaxed bg-black/40 flex-1 custom-scrollbar">
            {ledgerEntries.map((line, i) => (
              <div key={i} className="flex gap-4 group">
                <span className="text-gray-700 shrink-0 select-none">
                  {(i + 1).toString().padStart(3, '0')}
                </span>
                <p className="text-emerald-400/80 group-hover:text-emerald-300 transition-colors">
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sentinel Incidents */}
        <div className="luxury-card-admin overflow-hidden flex flex-col h-[400px]">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                Sentinel Incidents <span className="text-gray-500 font-medium">/ LIVE</span>
              </h2>
            </div>
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="p-6 overflow-auto font-mono text-[11px] leading-relaxed bg-black/40 flex-1 custom-scrollbar">
            {incidentEntries.map((line, i) => (
              <div key={i} className="flex gap-4 group border-l border-white/5 ml-2 pl-4 mb-1">
                <p
                  className={`${
                    line.includes('CRIT') || line.includes('ERROR')
                      ? 'text-rose-400'
                      : 'text-amber-300/80'
                  } group-hover:brightness-125 transition-all`}
                >
                  {line}
                </p>
              </div>
            ))}
            {incidentEntries.length === 0 && (
              <p className="text-gray-600 italic">No incidents recorded in the last cycle.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Real-time Audit Stream ────────────────────────────────────────── */}
      <div className="luxury-card-admin overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
              Real-time Audit Stream <span className="text-gray-500 font-medium">/ TRACE</span>
            </h2>
          </div>
          <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/5">
            Buffer: 20 entries
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/2 border-b border-white/5">
                <th className="px-6 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  Level
                </th>
                <th className="px-6 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  Event
                </th>
                <th className="px-6 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  Resource
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {recentAudits.map((event) => (
                <tr key={event.id} className="group hover:bg-white/2 transition-colors">
                  <td className="px-6 py-3 text-[10px] font-mono text-gray-500">
                    {new Date(event.createdAt).toLocaleTimeString('es-CL', { hour12: false })}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border ${
                        event.severity === 'critical'
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : event.severity === 'error'
                            ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}
                    >
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs font-bold text-gray-300 group-hover:text-white transition-colors">
                    {event.eventType}
                    {event.action && (
                      <span className="text-gray-600 font-normal ml-2">→ {event.action}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-[10px] font-mono text-[#14b8a6]">
                    {event.resource || 'SYSTEM'}
                  </td>
                </tr>
              ))}
              {recentAudits.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-8 w-8 text-emerald-500/20" />
                      <p className="text-sm font-mono text-gray-500">
                        System is clean. No anomalies detected.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
