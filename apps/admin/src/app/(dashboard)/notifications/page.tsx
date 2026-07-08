'use client';

import { BellOff, CheckCheck, Info, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

type Notification = {
  id: string;
  type: 'order' | 'stock' | 'revenue' | 'customer' | 'system';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

const INITIAL: Notification[] = [
  {
    id: '1',
    type: 'order',
    priority: 'high',
    title: 'Nueva orden recibida',
    message: 'Orden #1001 por $25.990 — requiere confirmación de pago',
    timestamp: '2026-03-06T10:30:00',
    read: false,
  },
  {
    id: '2',
    type: 'stock',
    priority: 'high',
    title: 'Stock crítico: Royal Queen Seeds Special Kush',
    message: 'Quedan 2 unidades disponibles. Se recomienda reabastecer.',
    timestamp: '2026-03-06T09:15:00',
    read: false,
  },
  {
    id: '3',
    type: 'revenue',
    priority: 'medium',
    title: 'Meta mensual al 68%',
    message: 'Llevas $34.500 de $50.000 este mes. ¡Vas bien!',
    timestamp: '2026-03-06T08:00:00',
    read: false,
  },
  {
    id: '4',
    type: 'customer',
    priority: 'low',
    title: 'Nuevo cliente registrado',
    message: 'pablo.test@email.com se registró en la tienda',
    timestamp: '2026-03-05T18:45:00',
    read: true,
  },
  {
    id: '5',
    type: 'order',
    priority: 'medium',
    title: 'Orden #999 despachada',
    message: 'El cliente fue notificado con tracking #CH123456789',
    timestamp: '2026-03-05T14:20:00',
    read: true,
  },
  {
    id: '6',
    type: 'system',
    priority: 'low',
    title: 'Backup automático completado',
    message: 'Backup diario de base de datos completado exitosamente',
    timestamp: '2026-03-05T03:00:00',
    read: true,
  },
];

const typeConfig = {
  order: { icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  stock: { icon: Package, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  revenue: { icon: TrendingUp, color: 'text-[#14b8a6]', bg: 'bg-[#14b8a6]/10' },
  customer: { icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  system: { icon: Info, color: 'text-gray-400', bg: 'bg-gray-500/10' },
} as const;

const priorityConfig = {
  high: { label: 'Alta', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  medium: { label: 'Media', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  low: { label: 'Baja', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
};

function timeAgo(ts: string) {
  const secs = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (secs < 60) {
    return 'ahora';
  }
  const mins = Math.floor(secs / 60);
  if (mins < 60) {
    return `${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  return `${Math.floor(hours / 24)}d`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayed = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const dismiss = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const highCount = notifications.filter((n) => !n.read && n.priority === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">Notificaciones</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-[#14b8a6] text-black text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Centro de alertas y eventos importantes del sistema
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todo como leído
          </button>
        )}
      </div>

      {/* Alert banner for high priority */}
      {highCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/8 px-5 py-4">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <p className="text-sm text-red-300 font-medium">
            Tienes <strong>{highCount}</strong> notificación{highCount > 1 ? 'es' : ''} de alta
            prioridad que requieren atención
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-[#161616] border border-white/6 p-1 w-fit">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f ? 'bg-[#14b8a6]/15 text-[#14b8a6]' : 'text-gray-500 hover:text-white'
            }`}
          >
            {f === 'all' ? `Todas (${notifications.length})` : `Sin leer (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-xl border border-white/6 bg-[#161616] overflow-hidden">
        {displayed.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <BellOff className="h-12 w-12 mx-auto mb-3 text-gray-700" />
            <p className="text-white font-medium">Sin notificaciones pendientes</p>
            <p className="text-sm text-gray-500 mt-1">Todo está al día</p>
          </div>
        ) : (
          <div className="divide-y divide-white/4">
            {displayed.map((n) => {
              const cfg = typeConfig[n.type];
              const pc = priorityConfig[n.priority];
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-6 py-4 hover:bg-white/2 transition-colors ${
                    !n.read ? 'bg-white/1' : ''
                  }`}
                >
                  {/* Unread indicator */}
                  <div className="mt-2 shrink-0">
                    {!n.read ? (
                      <div className="h-2 w-2 rounded-full bg-[#14b8a6]" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-transparent" />
                    )}
                  </div>

                  <div className={`rounded-lg p-2 shrink-0 ${cfg.bg}`}>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`text-sm font-semibold ${n.read ? 'text-gray-300' : 'text-white'}`}
                      >
                        {n.title}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${pc.color}`}
                      >
                        {pc.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-600">{timeAgo(n.timestamp)}</span>
                    <div className="flex items-center gap-1.5">
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => markRead(n.id)}
                          className="text-xs text-gray-500 hover:text-[#14b8a6] transition-colors"
                          title="Marcar como leído"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => dismiss(n.id)}
                        className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                        title="Descartar"
                      >
                        ×
                      </button>
                    </div>
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
