'use client';

import { Button } from '@pranakaia/ui';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // In production, this would send to Sentry/Datadog
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
    }
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Oops! Algo salió mal</h1>

            <p className="text-gray-600 mb-6">
              Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y
              estamos trabajando para solucionarlo.
            </p>

            {typeof window !== 'undefined' &&
              (window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1') &&
              this.state.error && (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                  <p className="text-xs font-mono text-red-600 mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}

            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir al Inicio
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Si el problema persiste, contáctanos en{' '}
              <a href="mailto:soporte@pranakaia.com" className="text-primary-600 hover:underline">
                soporte@pranakaia.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
