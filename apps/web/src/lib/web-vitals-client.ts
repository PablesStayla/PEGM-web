type MetricCallback<T extends { value: number; rating?: string }> = (metric: T) => void;

type WebVitalsModule = {
  onCLS: (cb: MetricCallback<{ value: number; rating?: string }>) => void;
  onFCP: (cb: MetricCallback<{ value: number; rating?: string }>) => void;
  onLCP: (cb: MetricCallback<{ value: number; rating?: string }>) => void;
  onTTFB: (cb: MetricCallback<{ value: number; rating?: string }>) => void;
  onINP: (cb: MetricCallback<{ value: number; rating?: string }>) => void;
};

const noop: WebVitalsModule = {
  onCLS: () => undefined,
  onFCP: () => undefined,
  onLCP: () => undefined,
  onTTFB: () => undefined,
  onINP: () => undefined,
};

async function loadWebVitals(): Promise<WebVitalsModule> {
  try {
    // biome-ignore lint/complexity/noCommaOperator: Required for Webpack independent import
    // biome-ignore lint/security/noGlobalEval: Required for dynamic import
    const dynamicImport = (0, eval)('import') as (id: string) => Promise<unknown>;
    const mod = (await dynamicImport('web-vitals')) as Partial<WebVitalsModule>;
    return {
      onCLS: mod.onCLS ?? noop.onCLS,
      onFCP: mod.onFCP ?? noop.onFCP,
      onLCP: mod.onLCP ?? noop.onLCP,
      onTTFB: mod.onTTFB ?? noop.onTTFB,
      onINP: mod.onINP ?? noop.onINP,
    };
  } catch {
    return noop;
  }
}

export async function onCLS(cb: Parameters<WebVitalsModule['onCLS']>[0]) {
  const mod = await loadWebVitals();
  return mod.onCLS(cb);
}

export async function onFCP(cb: Parameters<WebVitalsModule['onFCP']>[0]) {
  const mod = await loadWebVitals();
  return mod.onFCP(cb);
}

export async function onLCP(cb: Parameters<WebVitalsModule['onLCP']>[0]) {
  const mod = await loadWebVitals();
  return mod.onLCP(cb);
}

export async function onTTFB(cb: Parameters<WebVitalsModule['onTTFB']>[0]) {
  const mod = await loadWebVitals();
  return mod.onTTFB(cb);
}

export async function onINP(cb: Parameters<WebVitalsModule['onINP']>[0]) {
  const mod = await loadWebVitals();
  return mod.onINP(cb);
}
