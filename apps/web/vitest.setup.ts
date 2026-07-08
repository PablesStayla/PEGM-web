/**
 * Vitest global setup file.
 *
 * Runs once before every test file. Keep this lean — expensive setup
 * (DB connections, HTTP servers) belongs in beforeAll() blocks inside
 * individual test files or in globalSetup.ts.
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// ── React Testing Library ───────────────────────────────────────────────────
// Unmount React trees after every test to prevent state leakage.
afterEach(() => cleanup());

// ── Environment variables ──────────────────────────────────────────────────
// Provide safe test values for env vars so modules that import @/lib/env
// don’t throw during test collection (even if the real secrets are absent).
beforeAll(() => {
  process.env['NODE_ENV'] = 'test';
  process.env['NEXT_PUBLIC_SITE_URL'] = 'http://localhost:3000';
  process.env['NEXT_PUBLIC_APP_NAME'] = 'PranaKaia Test';
  process.env['UPSTASH_REDIS_REST_URL'] = 'http://localhost:6379';
  process.env['UPSTASH_REDIS_REST_TOKEN'] = 'test-token';
  process.env['STRIPE_SECRET_KEY'] = 'sk_test_placeholder';
  process.env['STRIPE_WEBHOOK_SECRET'] = 'whsec_test_placeholder';
  process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/pranakaia_test';
  process.env['LOG_LEVEL'] = 'error'; // silence info/debug logs during tests
});

// ── Global browser API mocks ─────────────────────────────────────────────────
// jsdom doesn’t implement all browser APIs; stub the ones we need.

// IntersectionObserver (used by framer-motion, lazy images, etc.)
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as unknown as typeof IntersectionObserver;
}

// ResizeObserver (used by many UI components)
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as unknown as typeof ResizeObserver;
}

// matchMedia (used by Tailwind breakpoint hooks)
if (!globalThis.matchMedia) {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// crypto.randomUUID (used in stores and idempotency)
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      ...globalThis.crypto,
      randomUUID: () => {
        // RFC 4122 v4 UUID
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
      },
    },
  });
}

// ── Next.js router mock ──────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn().mockReturnValue(false),
  }),
  headers: () => new Map(),
}));

// ── next-intl mock ───────────────────────────────────────────────────────────
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'es',
  useFormatter: () => ({ number: (v: number) => v.toString() }),
}));
