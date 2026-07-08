'use client';

import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Lock, RefreshCw, ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';
import { AdminUIError } from '@/providers/data/result-bridge';

/**
 * Dashboard Error Boundary — Result-Aware
 *
 * Special handling for AdminUIError (expected domain errors mapped to UI)
 * and generic runtime crashes.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Only log unexpected crashes to Sentry.
    // Domain errors (AdminUIError) are usually handled by the UI/Middleware
    // but if they reach here, we check if they are high severity.
    if (!(error instanceof AdminUIError) || error.code === 'INTERNAL_ERROR') {
      Sentry.captureException(error, {
        tags: { app: 'admin', boundary: 'dashboard' },
        extra: { digest: (error as any).digest },
      });
    }
  }, [error]);

  const isAuthError =
    error instanceof AdminUIError && (error.code === 'FORBIDDEN' || error.code === 'UNAUTHORIZED');
  const isDomainError = error instanceof AdminUIError && !isAuthError;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full ${isAuthError ? 'bg-amber-100' : 'bg-destructive/10'}`}
      >
        {isAuthError ? (
          <Lock className="h-8 w-8 text-amber-600" />
        ) : isDomainError ? (
          <ShieldAlert className="h-8 w-8 text-blue-600" />
        ) : (
          <AlertTriangle className="h-8 w-8 text-destructive" />
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          {isAuthError ? 'Acceso Denegado' : 'Ocurrió un problema'}
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {error.message ||
            'El error fue registrado automáticamente. Puedes intentar recargar esta sección.'}
        </p>
        {(error as any).digest && !isDomainError && (
          <p className="font-mono text-xs text-muted-foreground">ID: {(error as any).digest}</p>
        )}
      </div>

      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </button>
    </div>
  );
}
