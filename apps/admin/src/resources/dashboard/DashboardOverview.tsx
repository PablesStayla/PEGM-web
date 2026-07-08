'use client';

import { ArrowUpRight, Package, ShoppingBag, Users as UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { DashboardHeader } from './components/DashboardHeader';
import { KpiCard } from './components/KpiCard';
import { SalesChart } from './components/SalesChart';
import { TopProductsTable } from './components/TopProductsTable';

// Local cn utility
function cn(...classes: (string | undefined | boolean | null)[]) {
  return classes.filter(Boolean).join(' ');
}

type RecentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string | number;
  guestEmail: string | null;
  createdAt: Date;
  customerEmail: string | null;
};

const orderStatusStyle: Record<string, string> = {
  PENDING: 'bg-prana-gold/10 text-prana-gold border-prana-gold/20',
  PAID: 'bg-prana-emerald/10 text-prana-emerald border-prana-emerald/20',
  PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SHIPPED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  DELIVERED: 'bg-prana-emerald/20 text-prana-emerald border-prana-emerald/40',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface DashboardOverviewProps {
  recentOrders: RecentOrder[];
  metrics: {
    totalRevenue: number;
    revenueChange: number;
    totalOrders: number;
    ordersChange: number;
    totalUsers: number;
    usersChange: number;
    conversionRate: number;
    conversionChange: number;
  };
  salesData: any[];
  topProducts: any[];
}

export function DashboardOverview({
  recentOrders,
  metrics,
  salesData,
  topProducts,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-12 py-6">
      <DashboardHeader />

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ingresos Consolidados"
          value={`$${metrics.totalRevenue.toLocaleString('es-CL')}`}
          change={metrics.revenueChange}
          icon="DollarSign"
          trend={metrics.revenueChange > 0 ? 'up' : metrics.revenueChange < 0 ? 'down' : 'neutral'}
        />
        <KpiCard
          title="Volumen de Órdenes"
          value={metrics.totalOrders}
          change={metrics.ordersChange}
          icon="ShoppingCart"
          trend={metrics.ordersChange > 0 ? 'up' : metrics.ordersChange < 0 ? 'down' : 'neutral'}
        />
        <KpiCard
          title="Audiencia Activa"
          value={metrics.totalUsers}
          change={metrics.usersChange}
          icon="Users"
          trend={metrics.usersChange > 0 ? 'up' : metrics.usersChange < 0 ? 'down' : 'neutral'}
        />
        <KpiCard
          title="Tasa de Cierre (CR)"
          value={`${metrics.conversionRate.toFixed(2)}%`}
          change={metrics.conversionChange}
          icon="TrendingUp"
          trend={
            metrics.conversionChange > 0 ? 'up' : metrics.conversionChange < 0 ? 'down' : 'neutral'
          }
        />
      </div>

      {/* Main Insights Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <SalesChart data={salesData} />
        <TopProductsTable products={topProducts} />
      </div>

      {/* Secondary Intelligence Area */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity Log — 2 cols */}
        <div className="lg:col-span-2 relative overflow-hidden bg-black/60 border border-white/5 rounded-[2.5rem] shadow-2xl">
          <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />

          <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 relative z-10">
            <div>
              <h2 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase mb-1">
                Registro Maestro
              </h2>
              <h3 className="text-xl font-black text-white tracking-tight">Órdenes Recientes</h3>
            </div>
            <Link
              href="/orders"
              className="group flex items-center gap-2 bg-white/5 hover:bg-prana-gold/10 border border-white/10 hover:border-prana-gold/40 px-5 py-2.5 rounded-full transition-all duration-500"
            >
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                Ver Historial
              </span>
              <ArrowUpRight className="h-4 w-4 text-prana-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="relative z-10">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-30">
                <ShoppingBag className="w-12 h-12 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">
                  Protocolo vacío: Sin órdenes
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] border-b border-white/5">
                    <tr>
                      <th className="px-10 py-4">ID Transacción</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-10 py-4 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {recentOrders.map((order) => {
                      const statusStyle =
                        orderStatusStyle[order.status] ??
                        'bg-white/5 text-white/40 border-white/10';
                      return (
                        <tr
                          key={order.id}
                          className="group hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-10 py-5">
                            <span className="font-mono text-sm font-bold text-white group-hover:text-prana-gold transition-colors tracking-tighter">
                              #{order.orderNumber}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white/70">
                                {order.customerEmail || order.guestEmail || 'Anónimo'}
                              </span>
                              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div
                              className={cn(
                                'inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border',
                                statusStyle,
                              )}
                            >
                              {order.status}
                            </div>
                          </td>
                          <td className="px-10 py-5 text-right">
                            <span className="text-lg font-black text-prana-gold tabular-nums">
                              ${Number(order.totalAmount).toLocaleString('es-CL')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Tactical Quick Actions */}
        <div className="flex flex-col gap-6">
          {[
            {
              href: '/orders',
              icon: ShoppingBag,
              label: 'Despacho de Órdenes',
              desc: 'FLUJO TÁCTICO DE LOGÍSTICA',
              color: 'text-prana-gold',
            },
            {
              href: '/products',
              icon: Package,
              label: 'Control de Inventario',
              desc: 'GESTIÓN DE ACTIVOS Y STOCK',
              color: 'text-blue-400',
            },
            {
              href: '/customers',
              icon: UsersIcon,
              label: 'Terminal de Clientes',
              desc: 'INTELIGENCIA DE AUDIENCIA',
              color: 'text-prana-emerald',
            },
          ].map(({ href, icon: Icon, label, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="group relative overflow-hidden bg-black/60 border border-white/5 hover:border-prana-gold/40 p-8 rounded-[2rem] transition-all duration-500 shadow-xl"
            >
              <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 blur-3xl rounded-full group-hover:bg-prana-gold/10 transition-all duration-700" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div
                    className={cn(
                      'rounded-2xl bg-white/5 border border-white/10 p-4 shadow-2xl group-hover:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all duration-500',
                      color,
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg tracking-tighter leading-none">
                      {label}
                    </h4>
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-2 block">
                      {desc}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-white/10 group-hover:text-prana-gold group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500" />
              </div>
            </Link>
          ))}

          {/* Luxury System Status Card */}
          <div className="mt-auto bg-prana-gold/5 border border-prana-gold/10 rounded-[2rem] p-8 relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[8px] font-black text-prana-gold/60 uppercase tracking-[0.5em] mb-4 block">
                SEGURIDAD NIVEL STAFF
              </span>
              <p className="text-white/50 text-xs font-bold leading-relaxed">
                Todos los activos están cifrados y validados mediante el protocolo de Auth Shield.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
