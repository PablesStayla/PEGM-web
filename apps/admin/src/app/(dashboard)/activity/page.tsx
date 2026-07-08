import { Activity, Clock, Package, ShoppingCart, Users } from 'lucide-react';
import { DashboardService } from '@/lib/admin/dashboard-service';

export const metadata = {
  title: 'Actividad | Admin - PranaKaia',
  description: 'Log de actividad reciente del sistema',
};

export const dynamic = 'force-dynamic';

type ActivityEvent = {
  id: string;
  type: 'order' | 'product' | 'customer' | 'system';
  icon: typeof ShoppingCart;
  color: string;
  bg: string;
  title: string;
  description: string;
  timestamp: Date;
  badge?: string;
  badgeColor?: string;
};

async function getActivityEvents(): Promise<ActivityEvent[]> {
  try {
    const { recentOrders, recentProducts, recentCustomers, recentAuditLogs } =
      await DashboardService.getActivityEvents();

    const events: ActivityEvent[] = [];

    const statusColors = {
      PENDING: {
        badge: 'Pendiente',
        color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      },
      PAID: { badge: 'Pagado', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
      PROCESSING: { badge: 'Procesando', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
      SHIPPED: {
        badge: 'Despachado',
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      },
      DELIVERED: {
        badge: 'Entregado',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      },
      CANCELLED: { badge: 'Cancelado', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    };

    for (const order of recentOrders) {
      const statusKey = String(order.status) as keyof typeof statusColors;
      const sc = statusColors[statusKey] || statusColors.PENDING;
      const fmtTotal = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
      }).format(Number(order.total ?? 0));
      events.push({
        id: `order-${order.id}`,
        type: 'order',
        icon: ShoppingCart,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        title: `Orden #${order.orderNumber}`,
        description: `${fmtTotal} · ${order.guestEmail ?? 'cliente registrado'}`,
        timestamp: new Date(String(order.createdAt)),
        badge: sc.badge,
        badgeColor: sc.color,
      });
    }

    for (const product of recentProducts) {
      events.push({
        id: `product-${product.id}`,
        type: 'product',
        icon: Package,
        color: 'text-[#14b8a6]',
        bg: 'bg-[#14b8a6]/10',
        title: `Producto creado`,
        description: String(product.name),
        timestamp: new Date(String(product.createdAt)),
        badge: String(product.status),
        badgeColor: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
      });
    }

    for (const customer of recentCustomers) {
      events.push({
        id: `customer-${customer.id}`,
        type: 'customer',
        icon: Users,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        title: 'Nuevo cliente',
        description: String(customer.email),
        timestamp: new Date(String(customer.createdAt)),
      });
    }

    for (const auditLog of recentAuditLogs) {
      const severityColor =
        auditLog.severity === 'critical' || auditLog.severity === 'error'
          ? 'text-red-400 bg-red-500/10 border-red-500/20'
          : auditLog.severity === 'warning'
            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

      events.push({
        id: `audit-${auditLog.id}`,
        type: 'system',
        icon: Activity,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        title: auditLog.resource ? `Auditoría ${auditLog.resource}` : 'Auditoría de seguridad',
        description: [auditLog.eventType, auditLog.action].filter(Boolean).join(' · '),
        timestamp: new Date(String(auditLog.createdAt)),
        badge: auditLog.severity,
        badgeColor: severityColor,
      });
    }

    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return events;
  } catch (err) {
    console.error('[activity]', err);
    return [];
  }
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) {
    return 'hace un momento';
  }
  const mins = Math.floor(secs / 60);
  if (mins < 60) {
    return `hace ${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `hace ${hours}h`;
  }
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export default async function ActivityPage() {
  const events = await getActivityEvents();

  const counts = {
    order: events.filter((e) => e.type === 'order').length,
    product: events.filter((e) => e.type === 'product').length,
    customer: events.filter((e) => e.type === 'customer').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Actividad</h1>
        <p className="text-sm text-gray-400 mt-1">Log de eventos del sistema — últimos 7 días</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Órdenes',
            count: counts.order,
            icon: ShoppingCart,
            color: 'text-blue-400',
            bg: 'bg-blue-500/8',
          },
          {
            label: 'Productos',
            count: counts.product,
            icon: Package,
            color: 'text-[#14b8a6]',
            bg: 'bg-[#14b8a6]/8',
          },
          {
            label: 'Clientes',
            count: counts.customer,
            icon: Users,
            color: 'text-purple-400',
            bg: 'bg-purple-500/8',
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-xl border border-white/6 bg-[#161616] p-4 flex items-center gap-3"
            >
              <div className={`rounded-lg p-2.5 ${s.bg}`}>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{s.count}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event feed */}
      <div className="rounded-xl border border-white/6 bg-[#161616] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#14b8a6]" />
            Eventos recientes
          </h2>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        {events.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-700" />
            <p className="text-white font-medium">Sin actividad reciente</p>
            <p className="text-sm text-gray-500 mt-1">Los eventos aparecerán aquí en tiempo real</p>
          </div>
        ) : (
          <div className="divide-y divide-white/4">
            {events.map((event) => {
              const Icon = event.icon;
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-white/2 transition-colors"
                >
                  <div className={`rounded-lg p-2 shrink-0 mt-0.5 ${event.bg}`}>
                    <Icon className={`h-4 w-4 ${event.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{event.title}</p>
                      {event.badge && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${event.badgeColor}`}
                        >
                          {event.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{event.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-500">{timeAgo(event.timestamp)}</p>
                    <p className="text-xs text-gray-700 mt-0.5">
                      {event.timestamp.toLocaleDateString('es-CL')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
