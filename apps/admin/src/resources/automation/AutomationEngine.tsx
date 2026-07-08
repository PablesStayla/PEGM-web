'use client';

import { motion } from 'framer-motion';
import { Activity, Bot, Cpu, ShieldAlert, Webhook, Zap } from 'lucide-react';

interface StoreWebhookRule {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

interface WebhookDelivery {
  id: string;
  event: string;
  status: string;
  source: string;
  createdAt: Date;
}

interface AutomationEngineProps {
  webhookRules: StoreWebhookRule[];
  successfulEvents: number;
  failedEvents: number;
  processingEvents: number;
  totalEvents: number;
  lowStock: number;
  abandonedCarts: number;
  recentDeliveries: WebhookDelivery[];
}

export function AutomationEngine({
  webhookRules,
  successfulEvents,
  failedEvents,
  processingEvents,
  totalEvents,
  lowStock,
  abandonedCarts,
  recentDeliveries,
}: AutomationEngineProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg border border-white/5">
              <Bot className="h-6 w-6 text-purple-500" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              Automation <span className="text-purple-500">Engine</span>
            </h1>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-[0.3em] ml-12">
            Control de Procesos Reactivos · PranaKaia Lázaro
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/5 border border-purple-500/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-[10px] font-black text-purple-500 tracking-widest uppercase">
            Auto-Scaling Active
          </span>
        </div>
      </div>

      {/* ── Stats Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -4 }} className="luxury-card-admin p-6 text-center group">
          <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
          <p className="text-4xl font-black text-white font-mono tracking-tighter group-hover:text-purple-400 transition-colors">
            {webhookRules.length}
          </p>
          <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mt-1">
            Reglas
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="luxury-card-admin p-6 text-center group">
          <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
          <p className="text-4xl font-black text-emerald-500 font-mono tracking-tighter">
            {successfulEvents}
          </p>
          <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mt-1">
            Exitos 24h
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="luxury-card-admin p-6 text-center group">
          <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
          <p className="text-4xl font-black text-amber-500 font-mono tracking-tighter">
            {lowStock}
          </p>
          <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mt-1">
            Stock Crítico
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="luxury-card-admin p-6 text-center group">
          <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
          <p className="text-4xl font-black text-orange-500 font-mono tracking-tighter">
            {abandonedCarts}
          </p>
          <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mt-1">
            Abandoned
          </p>
        </motion.div>
      </div>

      {/* ── Active Channels & Logs ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Rules Panel */}
        <div className="luxury-card-admin overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-400" />
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                Trigger Rules <span className="text-gray-500 font-medium">/ ACTIVE</span>
              </h2>
            </div>
            <button className="text-[9px] font-black text-purple-400 uppercase tracking-widest hover:text-white transition-colors">
              New Rule +
            </button>
          </div>
          <div className="p-0 overflow-auto flex-1 custom-scrollbar">
            {webhookRules.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Webhook className="h-12 w-12 text-gray-800 mb-4" />
                <p className="text-sm text-gray-600">
                  No hay reglas configuradas en ajustes de tienda.
                </p>
              </div>
            ) : (
              webhookRules.map((rule) => (
                <div
                  key={rule.id}
                  className="px-6 py-4 border-b border-white/4 hover:bg-white/2 transition-colors group flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                      {rule.name}
                    </p>
                    <p className="text-[10px] font-mono text-gray-500 mt-1 break-all opacity-60 group-hover:opacity-100 transition-opacity italic">
                      {rule.url}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                        rule.active
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                      }`}
                    >
                      {rule.active ? 'On' : 'Off'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Delivery Activity */}
        <div className="luxury-card-admin overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#14b8a6]" />
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                Live Webhook Log <span className="text-gray-500 font-medium">/ 24H</span>
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono text-emerald-500 uppercase">Stream</span>
            </div>
          </div>
          <div className="p-0 overflow-auto flex-1 custom-scrollbar">
            {recentDeliveries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Activity className="h-12 w-12 text-gray-800 mb-4" />
                <p className="text-sm text-gray-600">No hay eventos recientes.</p>
              </div>
            ) : (
              recentDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="px-6 py-4 border-b border-white/4 hover:bg-white/2 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                        {delivery.event}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase">
                        <span className="text-[#14b8a6]">{delivery.source}</span>
                        <span className="text-gray-800">|</span>
                        <span>
                          {new Date(delivery.createdAt).toLocaleTimeString('es-CL', {
                            hour12: false,
                          })}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                        delivery.status === 'SUCCESS'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : delivery.status === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}
                    >
                      {delivery.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Summary Footer ──────────────────────────────────────────────── */}
      <div className="luxury-card-admin p-4 flex items-center justify-between relative overflow-hidden group">
        <div className="absolute inset-0 bg-noise opacity-[0.01] pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:scale-110 transition-transform">
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex gap-8">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Total Events
              </p>
              <p className="text-lg font-black text-white font-mono">{totalEvents}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Failures
              </p>
              <p className="text-lg font-black text-rose-500 font-mono">{failedEvents}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                In Queue
              </p>
              <p className="text-lg font-black text-blue-500 font-mono">{processingEvents}</p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
          <ShieldAlert className="h-3 w-3" />
          Worker Node: 0x42AF_LAZARO
        </div>
      </div>
    </div>
  );
}
