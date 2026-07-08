'use client';

/**
 * @file apps/web/src/lib/analytics.tsx
 *
 * Client-side analytics layer.
 *
 * Architecture:
 * - trackEvent() fans out to Vercel Analytics + custom /api/analytics/track endpoint
 * - trackServerEvent() is for server-side events (Amplitude via server API)
 * - useAnalytics() tracks page views automatically on route change
 * - useEcommerceAnalytics() exposes typed e-commerce event helpers
 * - usePerformanceAnalytics() reports Core Web Vitals
 *
 * Design principles:
 * - NEVER throw or reject from analytics code (analytics should never crash the app)
 * - NEVER block the UI thread (all fetches are fire-and-forget)
 * - Enrich every event with session_id, timestamp, page_url
 */

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { env } from '@/lib/env';
import { createLogger } from '@/lib/logger';

const log = createLogger({ module: 'analytics' });

// ── Types ───────────────────────────────────────────────────────────────────

type AnalyticsEvent =
  | 'page_view'
  | 'product_view'
  | 'product_click'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'cart_view'
  | 'checkout_start'
  | 'checkout_step'
  | 'purchase'
  | 'search'
  | 'filter_applied'
  | 'newsletter_subscribe'
  | 'user_login'
  | 'user_signup'
  | 'web_vitals'
  | 'ab_test_assigned'
  | 'ab_test_conversion';

interface AnalyticsData {
  product_id?: string;
  product_name?: string;
  product_category?: string;
  /** Price in CLP */
  product_price?: number;
  quantity?: number;
  /** Cart total in CLP */
  cart_value?: number;
  search_term?: string;
  search_results_count?: number;
  filter_category?: string;
  filter_price_range?: string;
  checkout_step?: number;
  payment_method?: string;
  shipping_method?: string;
  test_id?: string;
  variant_id?: string;
  page_title?: string;
  page_url?: string;
  referrer?: string;
  session_id?: string;
  user_id?: string;
  /** Web Vitals */
  metric?: string;
  value?: number;
  rating?: string;
  [key: string]: unknown;
}

// ── Session ID ────────────────────────────────────────────────────────────────

function getSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  try {
    const key = 'pk_analytics_session';
    let id = sessionStorage.getItem(key);
    if (!id) {
      // Use crypto.randomUUID for proper uniqueness (not substr which is deprecated)
      id = `s_${crypto.randomUUID()}`;
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `s_fallback_${Date.now()}`;
  }
}

// ── Core tracking function ────────────────────────────────────────────────────

async function track(event: AnalyticsEvent, data: AnalyticsData = {}): Promise<void> {
  const enriched: AnalyticsData = {
    ...data,
    timestamp: new Date().toISOString(),
    session_id: data.session_id ?? getSessionId(),
    page_url: data.page_url ?? (typeof window !== 'undefined' ? window.location.href : ''),
  };

  // 1. Vercel Analytics — fire-and-forget, no await
  window.va?.('event', { name: event, data: enriched });

  // 2. Custom analytics endpoint — fire-and-forget
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, data: enriched, source: 'client' }),
  }).catch((err) => {
    // Analytics should never propagate errors
    log.warn('Analytics track failed', {
      event,
      error: err instanceof Error ? err.message : String(err),
    });
  });

  log.debug('Analytics event dispatched', { event });
}

// ── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Main analytics hook.
 * Tracks page views automatically on route change.
 */
export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const trackEvent = useCallback(
    (event: AnalyticsEvent, data?: AnalyticsData) => track(event, data),
    [],
  );

  useEffect(() => {
    const url = searchParams?.size ? `${pathname}?${searchParams.toString()}` : pathname;

    void track('page_view', {
      page_title: typeof document !== 'undefined' ? document.title : '',
      page_url: url,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    });
  }, [pathname, searchParams]);

  return { trackEvent };
}

/**
 * Typed e-commerce event helpers.
 */
export function useEcommerceAnalytics() {
  const { trackEvent } = useAnalytics();

  const trackProductView = useCallback(
    (product: { id: string; name: string; category?: string; price?: number }) => {
      void trackEvent('product_view', {
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
        product_price: product.price,
      });
    },
    [trackEvent],
  );

  const trackAddToCart = useCallback(
    (
      product: { id: string; name: string; price?: number; category?: string },
      quantity: number,
    ) => {
      void trackEvent('add_to_cart', {
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
        product_price: product.price,
        quantity,
        cart_value: product.price != null ? product.price * quantity : undefined,
      });
    },
    [trackEvent],
  );

  const trackPurchase = useCallback(
    (order: { id: string; total: number; paymentMethod?: string; shippingMethod?: string }) => {
      void trackEvent('purchase', {
        product_id: order.id,
        cart_value: order.total,
        payment_method: order.paymentMethod,
        shipping_method: order.shippingMethod,
      });
    },
    [trackEvent],
  );

  const trackSearch = useCallback(
    (term: string, resultsCount: number) => {
      void trackEvent('search', { search_term: term, search_results_count: resultsCount });
    },
    [trackEvent],
  );

  return { trackProductView, trackAddToCart, trackPurchase, trackSearch };
}

/**
 * Core Web Vitals reporter.
 * Call once at the root of the app.
 */
export function usePerformanceAnalytics(): null {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    import('@/lib/web-vitals-client')
      .then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
        // Web vitals callbacks are synchronous — do not await them
        onCLS((m) => void track('web_vitals', { metric: 'CLS', value: m.value, rating: m.rating }));
        onINP((m) => void track('web_vitals', { metric: 'INP', value: m.value, rating: m.rating }));
        onFCP((m) => void track('web_vitals', { metric: 'FCP', value: m.value, rating: m.rating }));
        onLCP((m) => void track('web_vitals', { metric: 'LCP', value: m.value, rating: m.rating }));
        onTTFB((m) => void track('web_vitals', { metric: 'TTFB', value: m.value }));
      })
      .catch((err) => {
        log.warn('Failed to load web-vitals-client', {
          error: err instanceof Error ? err.message : String(err),
        });
      });
  }, []);

  return null;
}

/**
 * Server-side event tracker.
 * Call from Server Actions or API routes.
 */
export async function trackServerEvent(event: AnalyticsEvent, data: AnalyticsData): Promise<void> {
  const apiKey = env.AMPLITUDE_API_KEY;
  if (!apiKey) {
    return;
  }

  try {
    const res = await fetch('https://api.amplitude.com/2/httpapi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        events: [
          {
            event_type: event,
            user_id: data.user_id ?? 'anonymous',
            event_properties: data,
            time: Date.now(),
          },
        ],
      }),
    });

    if (!res.ok) {
      log.warn('Amplitude server event failed', { event, status: res.status });
    }
  } catch (err) {
    // Analytics must never disrupt server-side flows
    log.warn('Amplitude server event threw', {
      event,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Analytics provider wrapper.
 * Wrap the app root to initialise third-party SDKs.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    log.debug('Analytics provider mounted');
  }, []);
  return <>{children}</>;
}
