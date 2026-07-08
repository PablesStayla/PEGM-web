'use client';

import { Button } from '@pranakaia/ui';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useEffect, useMemo } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset?: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  const isLocalDebugHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const formattedTimestamp = useMemo(() => {
    const now = new Date();

    try {
      const datePart = now.toLocaleDateString('es-CL').replace(/-/g, '/');
      const timePart = now.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
      });

      return `${datePart} ${timePart}`;
    } catch {
      return now.toLocaleString().replace(/-/g, '/');
    }
  }, []);

  const showDebugDetails = isLocalDebugHost;

  const handleRetry = () => {
    if (typeof reset === 'function') {
      reset();
    }
  };

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 px-4">
      <div className="min-h-screen flex flex-col items-center justify-center">
        <section className="max-w-md w-full text-center space-y-6">
          <div className="w-32 h-32 mx-auto rounded-full bg-linear-to-br from-red-500 to-orange-500 shadow-lg">
            <div className="flex h-full w-full items-center justify-center">
              <AlertTriangle data-testid="alert-triangle-icon" className="w-16 h-16 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">¡Oops! Algo salió mal</h1>
          <p className="text-base text-gray-600">
            Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y estamos trabajando
            para solucionarlo.
          </p>

          {showDebugDetails && (
            <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left space-y-2">
              <h2 className="text-sm font-semibold text-red-800">Error Details:</h2>
              <p className="text-sm text-red-700 font-mono break-all">
                {error.message || 'Error sin mensaje'}
              </p>
              {error.digest ? (
                <p className="text-xs text-gray-600">Error ID: {error.digest}</p>
              ) : null}
            </div>
          )}

          <div className="space-y-3">
            <Button className="w-full" onClick={handleRetry} aria-label="intentar de nuevo">
              <RefreshCw data-testid="refresh-icon" className="w-4 h-4" />
              <span>Intentar de nuevo</span>
            </Button>
            <Button
              className="w-full variant-outline"
              variant="outline"
              onClick={handleGoHome}
              aria-label="ir al inicio"
            >
              <Home data-testid="home-icon" className="w-4 h-4" />
              <span>Ir al inicio</span>
            </Button>
          </div>

          <div className="flex justify-center space-x-6">
            <p className="text-sm text-gray-600">Si el problema persiste:</p>
            <a className="text-primary-600 hover:underline" href="/contact">
              Contactar soporte
            </a>
            <a className="text-primary-600 hover:underline" href="/faq">
              Ver FAQ
            </a>
            <a className="text-primary-600 hover:underline" href="mailto:soporte@pranakaia.com">
              Enviar Email
            </a>
          </div>

          <p className="text-xs text-gray-400">
            Error reportado automáticamente el {formattedTimestamp}
          </p>
        </section>
      </div>
    </div>
  );
}
