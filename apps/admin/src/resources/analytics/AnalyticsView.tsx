'use client';

import { Card } from '@pranakaia/ui';
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';

type AnalyticsData = {
  totalOrders: number;
  recentOrders: number;
  orderGrowth: number;
  totalRevenue: number;
  totalCustomers: number;
  recentCustomers: number;
  totalProducts: number;
  activeProducts: number;
  statusMap: Record<string, number>;
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  trend?: number;
}) {
  return (
    <Card className="luxury-card-admin p-6 group bg-black/60 border-white/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-prana-gold transition-colors duration-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-white tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-white/30 font-medium">{subtitle}</p>
        </div>
        <div className="rounded-xl bg-prana-gold/5 p-3 group-hover:bg-prana-gold/20 transition-all duration-500 shadow-lg">
          <Icon className="h-5 w-5 text-prana-gold" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
          {trend >= 0 ? (
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3 w-3" />
              <span>+{trend.toFixed(1)}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full">
              <ArrowDownRight className="h-3 w-3" />
              <span>{trend.toFixed(1)}%</span>
            </div>
          )}
          <span className="text-white/20">vs período anterior</span>
        </div>
      )}
    </Card>
  );
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendientes', color: 'bg-yellow-500' },
  CONFIRMED: { label: 'Confirmadas', color: 'bg-blue-500' },
  PROCESSING: { label: 'En Proceso', color: 'bg-indigo-500' },
  SHIPPED: { label: 'Enviadas', color: 'bg-purple-500' },
  DELIVERED: { label: 'Entregadas', color: 'bg-green-500' },
  CANCELLED: { label: 'Canceladas', color: 'bg-red-500' },
  REFUNDED: { label: 'Reembolsadas', color: 'bg-gray-500' },
};

export function AnalyticsView({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Analytics</h1>
        <p className="text-sm text-white/40 font-bold uppercase tracking-widest mt-1">
          Métricas de Rendimiento Estratégico
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Ingresos"
          value={`$${data.totalRevenue.toLocaleString('es-CL')}`}
          subtitle="Últimos 30 días"
          icon={DollarSign}
        />
        <StatCard
          title="Órdenes"
          value={data.recentOrders}
          subtitle={`${data.totalOrders} totales`}
          icon={ShoppingCart}
          trend={data.orderGrowth}
        />
        <StatCard
          title="Clientes"
          value={data.totalCustomers}
          subtitle={`+${data.recentCustomers} nuevos este mes`}
          icon={Users}
        />
        <StatCard
          title="Productos"
          value={data.activeProducts}
          subtitle={`${data.totalProducts} totales`}
          icon={Package}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Status Breakdown */}
        <Card className="lg:col-span-2 luxury-card-admin p-8 bg-black/60 border-white/5">
          <div className="mb-8 flex items-center gap-3">
            <div className="p-2 bg-prana-gold/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-prana-gold" />
            </div>
            <h2 className="text-sm font-black text-white/60 tracking-[0.2em] uppercase">
              Estado de Órdenes
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Object.entries(statusLabels).map(([status, meta]) => {
              const count = data.statusMap[status] ?? 0;
              return (
                <div
                  key={status}
                  className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 group hover:border-prana-gold/30 transition-all duration-500"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${meta.color} shadow-[0_0_10px_currentColor]`}
                  />
                  <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-white/60 transition-colors">
                      {meta.label}
                    </p>
                    <p className="text-xl font-black text-white tabular-nums">{count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick summary */}
        <Card className="luxury-card-admin p-8 bg-black/60 border-white/5">
          <div className="mb-8 flex items-center gap-3">
            <div className="p-2 bg-prana-gold/10 rounded-lg">
              <Package className="h-5 w-5 text-prana-gold" />
            </div>
            <h2 className="text-sm font-black text-white/60 tracking-[0.2em] uppercase">
              Resumen Rápido
            </h2>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[11px] font-black text-white/30 uppercase tracking-widest">
                Ticket Promedio
              </span>
              <span className="text-lg font-black text-prana-gold tabular-nums">
                $
                {data.recentOrders > 0
                  ? Math.round(data.totalRevenue / data.recentOrders).toLocaleString('es-CL')
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[11px] font-black text-white/30 uppercase tracking-widest">
                Tasa de Conversión
              </span>
              <span className="text-lg font-black text-emerald-400 tabular-nums">
                {data.totalCustomers > 0
                  ? ((data.totalOrders / data.totalCustomers) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black text-white/30 uppercase tracking-widest">
                Utilización Catálogo
              </span>
              <span className="text-lg font-black text-blue-400 tabular-nums">
                {data.totalProducts > 0
                  ? ((data.activeProducts / data.totalProducts) * 100).toFixed(0)
                  : 0}
                %
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
