interface WebVitalMetric {
  id: string;
  name: string;
  startTime: number;
  value: number;
  rating?: string;
  delta?: number;
  navigationType?: string;
}

const ANALYTICS_TRACK_ENDPOINT = '/api/analytics/track';

function sendMetric(metric: WebVitalMetric) {
  const payload = JSON.stringify({
    event: 'web_vital_reported',
    properties: {
      metric_id: metric.id,
      metric_name: metric.name,
      metric_value: metric.value,
      metric_start_time: metric.startTime,
      metric_rating: metric.rating ?? 'unknown',
      metric_delta: metric.delta ?? null,
      metric_navigation_type: metric.navigationType ?? null,
    },
    timestamp: new Date().toISOString(),
  });

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const body = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(ANALYTICS_TRACK_ENDPOINT, body);
    return;
  }

  void fetch(ANALYTICS_TRACK_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

export function reportWebVitals(metric: unknown) {
  const isLocalHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocalHost || !metric || typeof metric !== 'object') {
    return;
  }

  const candidate = metric as Partial<WebVitalMetric>;
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.name !== 'string' ||
    typeof candidate.startTime !== 'number' ||
    typeof candidate.value !== 'number'
  ) {
    return;
  }

  sendMetric({
    id: candidate.id,
    name: candidate.name,
    startTime: candidate.startTime,
    value: candidate.value,
    rating: candidate.rating,
    delta: candidate.delta,
    navigationType: candidate.navigationType,
  });
}
