'use client';

import { Button } from '@pranakaia/ui';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Forward to Sentry for tracking — this is the correct place for client errors
    Sentry.captureException(error, {
      tags: { boundary: 'page', digest: error.digest ?? 'unknown' },
    });
  }, [error]);

  const isDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-linear-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-white" aria-hidden="true" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Oops! Algo salió mal</h1>
        <p className="text-gray-600 mb-2 leading-relaxed">
          Ha ocurrido un error inesperado. Nuestro equipo ya fue notificado y estamos trabajando
          para resolverlo.
        </p>

        {/* Error details — only shown in development */}
        {isDev && (
          <details className="my-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <summary className="font-semibold text-red-800 cursor-pointer select-none">
              Error details (dev only)
            </summary>
            <p className="mt-2 text-sm text-red-700 font-mono break-all">{error.message}</p>
            {error.digest && <p className="text-xs text-red-600 mt-2">Error ID: {error.digest}</p>}
          </details>
        )}

        {/* Error ID in production (shows to user for support reference) */}
        {!isDev && error.digest && (
          <p className="text-xs text-gray-400 mb-6">Código de error: {error.digest}</p>
        )}

        {/* Actions */}
        <div className="space-y-3 mt-8">
          <Button onClick={reset} className="w-full" size="lg">
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            Intentar de nuevo
          </Button>

          <Button variant="outline" className="w-full" size="lg" onClick={() => router.push('/')}>
            <Home className="w-4 h-4 mr-2" aria-hidden="true" />
            Ir al inicio
          </Button>
        </div>

        {/* Support links */}
        <nav className="mt-12 pt-8 border-t border-gray-200" aria-label="Opciones de soporte">
          <p className="text-sm text-gray-500 mb-4">Si el problema persiste:</p>
          <ul className="flex justify-center gap-6 text-sm">
            {[
              { href: '/contact', label: 'Contactar soporte' },
              { href: '/faq', label: 'Ver FAQ' },
              { href: 'mailto:soporte@pranakaia.com', label: 'Enviar email' },
            ].map(({ href, label }) => (
              <li key={href}>
                <a href={href} className="text-primary-600 hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
