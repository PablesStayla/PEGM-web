'use client';

import { Button, Skeleton } from '@pranakaia/ui';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  CheckCircle,
  ClipboardList,
  Clock,
  LayoutGrid,
  MoreVertical,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { Suspense } from 'react';
import { TablePagination } from '@/components/shared/TablePagination';
import { OrdersFilters } from './OrdersFilters';
import type { OrderWithCustomer } from './OrdersTable';
import { OrdersTable } from './OrdersTable';

interface OrderListProps {
  orders: OrderWithCustomer[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function OrderList({ orders, pagination }: OrderListProps) {
  // Calculate some quick stats for the resource view
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const processingCount = orders.filter((o) => o.status === 'PROCESSING').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;

  return (
    <div className="space-y-10 py-6 animate-in fade-in duration-700">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg border border-white/5">
              <ShoppingBag className="h-6 w-6 text-prana-emerald" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              Gestión de <span className="text-prana-emerald">Órdenes</span>
            </h1>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-[0.3em] ml-12">
            Fulfillment & Pipeline de Ventas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-prana-emerald animate-pulse" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              {pagination.total} Órdenes Totales
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            title: 'Pendientes',
            value: pendingCount,
            icon: Clock,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
          },
          {
            title: 'En Proceso',
            value: processingCount,
            icon: Truck,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
          },
          {
            title: 'Completadas',
            value: completedCount,
            icon: CheckCircle,
            color: 'text-prana-emerald',
            bg: 'bg-prana-emerald/10',
          },
          {
            title: 'Cumplimiento',
            value: `${pagination.total > 0 ? Math.round((completedCount / orders.length) * 100) : 0}%`,
            icon: ClipboardList,
            color: 'text-white',
            bg: 'bg-white/10',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="luxury-card-admin p-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 ${stat.bg} rounded-lg border border-white/5 transition-colors`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <ArrowUpRight className="h-3 w-3 text-white/20 group-hover:text-white/50 transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-white font-mono tracking-tighter">
                {stat.value}
              </p>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                {stat.title}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="luxury-card-admin p-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
        <Suspense fallback={<Skeleton className="h-16 w-full bg-white/5 rounded-2xl" />}>
          <OrdersFilters />
        </Suspense>
      </div>

      {/* ── Orders Table ─────────────────────────────────────────────────── */}
      <div className="luxury-card-admin overflow-hidden relative shadow-2xl">
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg border border-white/5">
              <LayoutGrid className="h-4 w-4 text-prana-emerald" />
            </div>
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
              Pipeline Maestro <span className="text-gray-600 font-medium">/ SYSLOG</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative z-10">
          <Suspense
            fallback={
              <div className="p-20 flex justify-center">
                <Skeleton className="h-60 w-full max-w-4xl bg-white/5 rounded-3xl" />
              </div>
            }
          >
            <OrdersTable orders={orders} />
          </Suspense>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.01]">
          <TablePagination pagination={pagination} />
        </div>
      </div>
    </div>
  );
}
