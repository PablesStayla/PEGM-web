/**
 * not-found.tsx
 *
 * Custom 404 page rendered by Next.js when notFound() is called or a route
 * has no match. Must be a Server Component (no 'use client') so that:
 * - It renders without JavaScript on first load
 * - Search engines see a proper 404 status code
 * - Next.js metadata is applied correctly
 *
 * The "Volver atrás" button is isolated in its own Client Component to
 * keep this file as a Server Component while still supporting browser history.
 */

import { Button } from '@pranakaia/ui';
import { Home, Search } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Página no encontrada — PranaKaia',
  description: 'La página que buscas no existe.',
  robots: { index: false, follow: false },
};

// ── Isolated client component for browser history API ────────────────────────
// This is the ONLY piece that needs client-side JS.

import { GoBackButton } from './not-found/GoBackButton';

// ── 404 Page (Server Component) ────────────────────────────────────────────────

export default function NotFound() {
  return (
    <main
      className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4"
      aria-labelledby="not-found-heading"
    >
      <div className="max-w-md w-full text-center">
        {/* 404 visual */}
        <div className="mb-8">
          <p className="text-8xl font-bold text-primary-600 mb-4" aria-hidden="true">
            404
          </p>
          <div
            className="w-28 h-28 mx-auto bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center"
            aria-hidden="true"
          >
            <Search className="w-14 h-14 text-white" />
          </div>
        </div>

        {/* Heading & description */}
        <h1 id="not-found-heading" className="text-3xl font-bold text-gray-900 mb-4">
          Página no encontrada
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Lo sentimos, la página que buscas no existe o ha sido movida. Verifica la URL o regresa al
          inicio para encontrar lo que necesitas.
        </p>

        {/* Primary actions */}
        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/">
              <Home className="w-5 h-5 mr-2" aria-hidden="true" />
              Ir al inicio
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full" size="lg">
            <Link href="/products">
              <Search className="w-5 h-5 mr-2" aria-hidden="true" />
              Ver productos
            </Link>
          </Button>

          {/* Client component that uses window.history.back() */}
          <GoBackButton />
        </div>

        {/* Support links */}
        <nav className="mt-12 pt-8 border-t border-gray-200" aria-label="Ayuda y soporte">
          <p className="text-sm text-gray-500 mb-4">¿Necesitas ayuda?</p>
          <ul className="flex justify-center gap-6 text-sm list-none">
            {[
              { href: '/contact', label: 'Contacto' },
              { href: '/faq', label: 'FAQ' },
              { href: '/support', label: 'Soporte' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-primary-600 hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
