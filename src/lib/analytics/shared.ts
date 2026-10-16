export const PUBLIC_PATHS = ["/", "/en", "/cv", "/proyectos", "/laboratorio"];
export const EVENT_NAMES = [
  "pageview",
  "cv_download",
  "email_click",
  "outbound_click",
  "section_view",
  "lab_interaction",
  "contact_success",
  "performance",
  "client_error",
] as const;
export type EventName = (typeof EVENT_NAMES)[number];
export type AnalyticsEvent = {
  id: string;
  pageId: string;
  name: EventName;
  path: string;
  label?: string;
  value?: number;
  activeSeconds?: number;
  scrollDepth?: number;
};
export const LABELS = [
  "",
  "github",
  "linkedin",
  "email",
  "cv",
  "sobre-mi",
  "especialidades",
  "proyectos",
  "trayectoria",
  "laboratorio",
  "contacto",
  "procesos",
  "simulacion",
  "datos",
  "aprendizaje",
  "about",
  "projects",
  "flotacion",
  "balance",
  "pourbaix",
  "planta",
  "LCP",
  "INP",
  "CLS",
  "TTFB",
  "FCP",
  "javascript",
  "unhandled_promise",
];
export function safeLabel(value: string) {
  return LABELS.includes(value) || /^project-\d{1,8}$/.test(value);
}
export function isLocalHostname(hostname: string) {
  return /^(localhost|127\.|0\.0\.0\.0$|\[?::1\]?$|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(
    hostname,
  );
}
export function cleanCampaign(value: string | null) {
  // Los parámetros de campaña no deben contener correos ni texto libre.
  return value && /^[a-zA-Z0-9_.-]{1,64}$/.test(value) ? value : "";
}
export function attribution(referrer: string, url: string) {
  const current = new URL(url);
  const campaign = cleanCampaign(current.searchParams.get("utm_campaign"));
  const utmSource = cleanCampaign(current.searchParams.get("utm_source"));
  if (utmSource) return { source: utmSource, campaign };
  try {
    const previous = new URL(referrer);
    if (previous.host !== current.host && /^https?:$/.test(previous.protocol)) {
      return { source: previous.hostname.replace(/^www\./, "").slice(0, 100), campaign };
    }
  } catch {
    /* Sin referencia externa. */
  }
  return { source: "Directo", campaign };
}
export function percentile(values: number[], fraction = 0.75): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)];
}
