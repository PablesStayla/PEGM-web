'use client';

/**
 * global-error.tsx
 *
 * Next.js global error boundary — catches errors thrown by the root layout.
 * Must render its own <html> and <body> tags since the layout is broken.
 *
 * Design rules:
 * - No external dependencies (Next.js router, UI lib, etc.) — they may be broken too.
 * - Must import Sentry directly since the instrumentation layer may be unavailable.
 * - No Tailwind — use inline styles as a safety net.
 */

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { boundary: 'global', digest: error.digest ?? 'unknown' },
      level: 'fatal',
    });
  }, [error]);

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error crítico — PranaKaia</title>
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#fff5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '1rem',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
            padding: '2rem',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,.08)',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: 36,
            }}
            aria-hidden="true"
          >
            ⚠️
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#111',
              marginBottom: '0.75rem',
            }}
          >
            Error crítico del sistema
          </h1>

          <p style={{ color: '#555', lineHeight: 1.6, marginBottom: '2rem' }}>
            Ha ocurrido un error inesperado en la aplicación. Nuestro equipo fue notificado
            automáticamente. Por favor, recarga la página o vuelve al inicio.
          </p>

          {/* Error ID for support reference */}
          {error.digest && (
            <p
              style={{
                fontSize: '0.75rem',
                color: '#999',
                marginBottom: '1.5rem',
                fontFamily: 'monospace',
              }}
            >
              ID de error: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.875rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Recargar aplicación
            </button>

            <a
              href="/"
              style={{
                border: '2px solid #ef4444',
                color: '#ef4444',
                borderRadius: 8,
                padding: '0.875rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'block',
              }}
            >
              Ir al inicio
            </a>
          </div>

          {/* Support contact */}
          <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#999' }}>
            Soporte:{' '}
            <a
              href="mailto:soporte@pranakaia.com"
              style={{ color: '#ef4444', textDecoration: 'none' }}
            >
              soporte@pranakaia.com
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}
