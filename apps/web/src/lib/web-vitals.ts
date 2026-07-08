interface WebVitalMetric {
  name: string;
  id: string;
  value: number;
}

interface WindowWithGtag extends Window {
  gtag?: (...args: unknown[]) => void;
}

function sendToAnalytics(metric: WebVitalMetric) {
  if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
    (window as WindowWithGtag).gtag!('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
}

export function reportWebVitals() {
  (async () => {
    try {
      // biome-ignore lint/complexity/noCommaOperator: Required for Webpack independent import
      // biome-ignore lint/security/noGlobalEval: Required for dynamic import
      const dynamicImport = (0, eval)('import') as (id: string) => Promise<unknown>;
      const { onCLS, onFCP, onLCP, onTTFB } = (await dynamicImport('web-vitals')) as unknown as {
        onCLS: (cb: (metric: WebVitalMetric) => void) => void;
        onFCP: (cb: (metric: WebVitalMetric) => void) => void;
        onLCP: (cb: (metric: WebVitalMetric) => void) => void;
        onTTFB: (cb: (metric: WebVitalMetric) => void) => void;
      };
      onCLS(sendToAnalytics);
      onFCP(sendToAnalytics);
      onLCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
    } catch {
      return;
    }
  })();
}
