'use client';

import { Bell, Check, Package, Star, Tag, TrendingDown, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'price_drop' | 'back_in_stock' | 'new_product' | 'review' | 'offer' | 'order';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  productImage?: string;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones');
      return;
    }

    const permission = await Notification.requestPermission();
    setIsPushEnabled(permission === 'granted');

    if (permission === 'granted') {
      // Enviar notificación de bienvenida
      new Notification('¡Notificaciones activadas! 🎉', {
        body: 'Te avisaremos sobre ofertas, bajadas de precio y productos en stock',
        icon: '/logo.png',
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'price_drop':
        return <TrendingDown className="w-5 h-5 text-green-600" />;
      case 'back_in_stock':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'new_product':
        return <Star className="w-5 h-5 text-yellow-600" />;
      case 'review':
        return <Star className="w-5 h-5 text-purple-600" />;
      case 'offer':
        return <Tag className="w-5 h-5 text-red-600" />;
      case 'order':
        return <Package className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) {
      return 'Ahora';
    }
    if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m`;
    }
    if (seconds < 86400) {
      return `${Math.floor(seconds / 3600)}h`;
    }
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <button
            type="button"
            aria-label="Cerrar notificaciones"
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 max-h-150 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-900">Notificaciones</h3>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Push Notification Toggle */}
              {!isPushEnabled && (
                <button
                  onClick={requestNotificationPermission}
                  className="w-full flex items-center gap-2 p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors text-sm"
                >
                  <Bell className="w-4 h-4 text-primary-600" />
                  <span className="flex-1 text-left text-primary-900 font-medium">
                    Activar notificaciones push
                  </span>
                </button>
              )}

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        'w-full p-4 text-left hover:bg-gray-50 transition-colors cursor-pointer',
                        !notification.read && 'bg-primary-50/30',
                      )}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl;
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          markAsRead(notification.id);
                          if (notification.actionUrl) {
                            window.location.href = notification.actionUrl;
                          }
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm text-gray-900">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 shrink-0">
                              {getTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          {notification.productImage && (
                            <div className="w-16 h-16 rounded overflow-hidden">
                              <Image
                                src={notification.productImage}
                                alt=""
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Marcar como leída"
                            >
                              <Check className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Eliminar"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
                onClick={() => {
                  window.location.href = '/notifications';
                }}
              >
                Ver todas las notificaciones
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
