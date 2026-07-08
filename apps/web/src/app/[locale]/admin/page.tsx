import { Card } from '@pranakaia/ui';
import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react';
import { formatCLP } from '@/lib/format';
import { getDashboardMetrics, getRevenueOverTime } from '../actions/admin-analytics';

export const metadata = { title: 'Admin Dashboard | PranaKaia' };
export const dynamic = 'force-dynamic'; // Prevent static caching to show live metrics

// We need a wrapper client component for Recharts because `AreaChart` and `ResponsiveContainer`
// use window APIs / hooks that require 'use client'
import RevenueChartClient from './RevenueChartClient';

export default async function AdminDashboardPage() {
  const [metrics, revenueData] = await Promise.all([getDashboardMetrics(), getRevenueOverTime(30)]);

  const KPIS = [
    {
      title: 'Ingresos Totales',
      value: formatCLP(metrics.totalRevenue),
      icon: DollarSign,
      trend: '+12%',
    },
    { title: 'Órdenes', value: metrics.totalOrders, icon: ShoppingBag, trend: '+4%' },
    { title: 'Clientes Activos', value: metrics.totalCustomers, icon: Users, trend: '+18%' },
    {
      title: 'Productos Activos',
      value: metrics.activeProducts,
      icon: Package,
      trend: 'En catálogo',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dashboard General
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Resumen de operaciones e ingresos (Últimos 30 días)
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi, index) => (
          <Card
            key={index}
            className="p-6 transition-all hover:scale-[1.02] shadow-sm glass-morphism"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-[#1a4d2e] dark:text-green-400">
                <kpi.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span
                className={kpi.trend.includes('+') ? 'text-green-600 font-medium' : 'text-gray-500'}
              >
                {kpi.trend}
              </span>
              <span className="text-gray-500 ml-2">vs el periodo anterior</span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 shadow-sm glass-morphism border-gray-100 dark:border-gray-800">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Resumen de Ingresos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fluctuación de ingresos diarios
          </p>
        </div>
        <div className="h-[400px] w-full">
          {revenueData.length > 0 ? (
            <RevenueChartClient data={revenueData} />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
              <DollarSign className="h-10 w-10 mb-2 opacity-50" />
              <p>No hay órdenes completadas aún.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
