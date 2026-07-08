'use client';

/**
 * GoBackButton — isolated Client Component.
 *
 * This is the only part of the 404 page that needs client-side JavaScript
 * because window.history.back() is a browser API. Keeping it isolated
 * allows not-found.tsx to remain a pure Server Component.
 */

import { ArrowLeft } from 'lucide-react';

export function GoBackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="w-full flex items-center justify-center px-4 py-3 text-primary-600 hover:text-primary-700 transition-colors"
    >
      <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
      Volver atrás
    </button>
  );
}
