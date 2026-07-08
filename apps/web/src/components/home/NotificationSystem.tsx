'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, ShoppingBag, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'cart';
  title?: string;
  message: string;
  duration?: number;
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newNotification = { ...notification, id };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove después del duration
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    },
    [removeNotification],
  );

  useEffect(() => {
    const handleCartItemAdded = (event: Event) => {
      const customEvent = event as CustomEvent<{ product?: unknown; message: string }>;
      if (!customEvent.detail) {
        return;
      }
      const { message } = customEvent.detail;

      addNotification({
        type: 'cart',
        title: 'Producto agregado',
        message,
        duration: 3000,
      });
    };

    const handleError = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (!customEvent.detail) {
        return;
      }
      const { message } = customEvent.detail;

      addNotification({
        type: 'error',
        title: 'Error',
        message,
        duration: 5000,
      });
    };

    const handleSuccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (!customEvent.detail) {
        return;
      }
      const { message } = customEvent.detail;

      addNotification({
        type: 'success',
        title: 'Éxito',
        message,
        duration: 5000,
      });
    };

    const handleInfo = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (!customEvent.detail) {
        return;
      }
      const { message } = customEvent.detail;

      addNotification({
        type: 'info',
        title: 'Información',
        message,
        duration: 5000,
      });
    };

    // Add all event listeners
    window.addEventListener('cart:item-added', handleCartItemAdded);
    window.addEventListener('notification:error', handleError);
    window.addEventListener('notification:success', handleSuccess);
    window.addEventListener('notification:info', handleInfo);

    return () => {
      window.removeEventListener('cart:item-added', handleCartItemAdded);
      window.removeEventListener('notification:error', handleError);
      window.removeEventListener('notification:success', handleSuccess);
      window.removeEventListener('notification:info', handleInfo);
    };
  }, [addNotification]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" data-testid="success-icon" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" data-testid="error-icon" />;
      case 'cart':
        return <ShoppingBag className="w-5 h-5 text-primary-600" data-testid="cart-icon" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" data-testid="info-icon" />;
    }
  };

  const getStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'cart':
        return 'bg-primary-50 border-primary-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md"
      role="region"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${getStyles(notification.type)}`}
            role="alert"
          >
            <div className="shrink-0 mt-0.5">{getIcon(notification.type)}</div>

            <div className="flex-1 min-w-0">
              {notification.title && (
                <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
              )}
              <p className="text-sm text-gray-700">{notification.message}</p>
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
