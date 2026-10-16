"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  type AnalyticsEvent,
  attribution,
  type EventName,
  isLocalHostname,
  PUBLIC_PATHS,
  safeLabel,
} from "@/lib/analytics/shared";

type Context = { visitorId: string; sessionId: string; source: string; campaign: string };
type Page = { id: string; path: string };
type DeferredFetch = (
  url: string,
  init: RequestInit & { activateAfter: number },
) => { readonly activated: boolean };

export function AnalyticsTracker({
  allowLocal = false,
  disabled = false,
}: {
  allowLocal?: boolean;
  disabled?: boolean;
}) {
  const path = usePathname();
  const english = path === "/en";
  const [consent, setConsent] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [restricted, setRestricted] = useState(false);
  const current = useRef<Page | null>(null);
  const permitted = useRef(false);
  const emit = useRef<
    ((name: EventName, label?: string, value?: number, id?: string, page?: Page) => void) | null
  >(null);

  useEffect(() => {
    const privacy = navigator as Navigator & { globalPrivacyControl?: boolean };
    const blocked =
      disabled || navigator.doNotTrack === "1" || privacy.globalPrivacyControl === true;
    setRestricted(blocked);
    try {
      const preference = JSON.parse(localStorage.getItem("pegm-analytics-consent") ?? "null") as {
        choice?: string;
        expires?: number;
      } | null;
      if (preference?.expires && preference.expires > Date.now()) {
        permitted.current = preference.choice === "accepted" && !blocked;
        setConsent(preference.choice ?? null);
      }
    } catch {
      /* Sin almacenamiento persistente: no se activa la medición. */
    }
  }, [disabled]);

  function choose(choice: string) {
    permitted.current = choice === "accepted";
    try {
      localStorage.setItem(
        "pegm-analytics-consent",
        JSON.stringify({ choice, expires: Date.now() + 180 * 86400000 }),
      );
      if (choice !== "accepted") {
        localStorage.removeItem("pegm-analytics-visitor");
        sessionStorage.removeItem("pegm-analytics-session");
      }
    } catch {
      /* La elección en memoria también es válida durante esta página. */
    }
    setConsent(choice);
    setSettingsOpen(false);
  }

  useEffect(() => {
    if (
      consent !== "accepted" ||
      restricted ||
      !PUBLIC_PATHS.includes(path) ||
      (!allowLocal && isLocalHostname(location.hostname))
    )
      return;
    let context: Context;
    try {
      const visitor = JSON.parse(localStorage.getItem("pegm-analytics-visitor") ?? "null") as {
        id: string;
        expires: number;
      } | null;
      const visitorId = visitor && visitor.expires > Date.now() ? visitor.id : crypto.randomUUID();
      localStorage.setItem(
        "pegm-analytics-visitor",
        JSON.stringify({
          id: visitorId,
          expires:
            visitor?.expires && visitor.expires > Date.now()
              ? visitor.expires
              : Date.now() + 180 * 86400000,
        }),
      );
      const session = JSON.parse(sessionStorage.getItem("pegm-analytics-session") ?? "null") as
        | (Context & { last: number })
        | null;
      context =
        session && Date.now() - session.last < 1800000
          ? {
              visitorId,
              sessionId: session.sessionId,
              source: session.source,
              campaign: session.campaign,
            }
          : {
              visitorId,
              sessionId: crypto.randomUUID(),
              ...attribution(document.referrer, location.href),
            };
      sessionStorage.setItem(
        "pegm-analytics-session",
        JSON.stringify({ ...context, last: Date.now() }),
      );
    } catch {
      return;
    }

    const page = { id: crypto.randomUUID(), path };
    current.current = page;
    let active = true;
    let queue = new Map<string, AnalyticsEvent>();
    let deferred: AbortController | null = null;
    let pending: { readonly activated: boolean } | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    let seconds = 0;
    let visibleSince = document.visibilityState === "visible" ? performance.now() : null;
    const start = performance.now();
    let depth = 0;
    const seen = new Set<string>();
    const fetchLater = (globalThis as typeof globalThis & { fetchLater?: DeferredFetch })
      .fetchLater;

    const body = () => JSON.stringify({ consent: true, ...context, events: [...queue.values()] });
    const flush = () => {
      if (pending?.activated) queue.clear();
      deferred?.abort();
      pending = null;
      clearTimeout(fallbackTimer);
      if (!queue.size) return;
      const payload = body();
      queue = new Map();
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    };
    const schedule = () => {
      deferred?.abort();
      clearTimeout(fallbackTimer);
      if (fetchLater) {
        try {
          deferred = new AbortController();
          pending = fetchLater("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body(),
            activateAfter: 2000,
            signal: deferred.signal,
          });
          return;
        } catch {
          /* Recurso no disponible o cuota agotada: fetch con keepalive. */
        }
      }
      fallbackTimer = setTimeout(flush, 2000);
    };
    const record = (
      name: EventName,
      label = "",
      value = 0,
      id = crypto.randomUUID(),
      target = page,
    ) => {
      if (!active) return;
      if (pending?.activated) {
        queue.clear();
        pending = null;
      }
      if (queue.size >= 18) flush();
      queue.set(id, { id, pageId: target.id, path: target.path, name, label, value });
      schedule();
    };
    emit.current = record;
    const foregroundSeconds = () => {
      // API nativa cuando existe; fallback por cambios de visibilidad, sin tiempo en segundo plano.
      const entries = performance.getEntriesByType("visibility-state");
      if (entries.length) {
        let duration = 0;
        entries.forEach((entry, i) => {
          if (entry.name === "visible")
            duration += Math.max(
              0,
              (entries[i + 1]?.startTime ?? performance.now()) - Math.max(start, entry.startTime),
            );
        });
        return Math.min(3600, Math.floor(duration / 1000));
      }
      return Math.min(
        3600,
        Math.floor(
          seconds + (visibleSince === null ? 0 : (performance.now() - visibleSince) / 1000),
        ),
      );
    };
    const summary = () => {
      record("pageview", "", 0, page.id);
      const event = queue.get(page.id);
      if (event) {
        event.activeSeconds = foregroundSeconds();
        event.scrollDepth = depth;
      }
      // Reprogramar incluye los valores del resumen, no una copia anterior del cuerpo.
      schedule();
    };
    const visibility = () => {
      if (document.visibilityState === "hidden") {
        if (visibleSince !== null) seconds += (performance.now() - visibleSince) / 1000;
        visibleSince = null;
        summary();
        flush();
      } else {
        visibleSince = performance.now();
      }
    };
    const scroll = () => {
      const height = document.documentElement.scrollHeight;
      depth = Math.max(depth, Math.min(100, Math.round(((scrollY + innerHeight) / height) * 100)));
    };
    const click = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor) return;
      const url = new URL(anchor.href, location.href);
      if (url.pathname === "/cv-pablo-garrido.pdf" && url.origin === location.origin)
        record("cv_download", "cv");
      else if (url.protocol === "mailto:") record("email_click", "email");
      else if (url.hostname === "github.com") record("outbound_click", "github");
      else if (url.hostname.endsWith("linkedin.com")) record("outbound_click", "linkedin");
    };
    const change = (event: Event) => {
      const element = event.target instanceof Element ? event.target : null;
      const tool = element?.closest("section[id]")?.id;
      if (
        path === "/laboratorio" &&
        tool &&
        ["flotacion", "balance", "pourbaix", "planta"].includes(tool) &&
        !seen.has(`tool:${tool}`)
      ) {
        seen.add(`tool:${tool}`);
        record("lab_interaction", tool);
      }
    };
    const contact = () => {
      record("contact_success");
      flush();
    };
    const error = () => record("client_error", "javascript");
    const rejection = () => record("client_error", "unhandled_promise");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const label = el.dataset.analyticsProject
            ? `project-${el.dataset.analyticsProject}`
            : el.id;
          if (safeLabel(label) && !seen.has(label)) {
            seen.add(label);
            record("section_view", label);
          }
        }
      },
      { threshold: 0.25 },
    );
    document
      .querySelectorAll("main section[id], main article[id], [data-analytics-project]")
      .forEach((el) => {
        observer.observe(el);
      });
    scroll();
    summary();
    flush();
    const heartbeat = setInterval(() => {
      if (document.visibilityState === "visible") {
        summary();
        flush();
        try {
          sessionStorage.setItem(
            "pegm-analytics-session",
            JSON.stringify({ ...context, last: Date.now() }),
          );
        } catch {
          /* Sin almacenamiento. */
        }
      }
    }, 60000);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("click", click);
    document.addEventListener("change", change);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("pegm-contact-success", contact);
    window.addEventListener("error", error);
    window.addEventListener("unhandledrejection", rejection);
    return () => {
      if (permitted.current) {
        summary();
        flush();
      } else {
        deferred?.abort();
        clearTimeout(fallbackTimer);
        queue.clear();
      }
      active = false;
      emit.current = null;
      observer.disconnect();
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("click", click);
      document.removeEventListener("change", change);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("pegm-contact-success", contact);
      window.removeEventListener("error", error);
      window.removeEventListener("unhandledrejection", rejection);
    };
  }, [consent, restricted, path, allowLocal]);

  useEffect(() => {
    if (consent !== "accepted" || restricted) return;
    const initialPage = current.current;
    if (!initialPage) return;
    let active = true;
    const ids = new Map<string, string>();
    void import("web-vitals")
      .then(({ onLCP, onINP, onCLS, onTTFB, onFCP }) => {
        if (!active) return;
        const report = (metric: { name: string; value: number }) => {
          if (!active) return;
          if (!ids.has(metric.name)) ids.set(metric.name, crypto.randomUUID());
          emit.current?.(
            "performance",
            metric.name,
            Math.min(60000, Math.max(0, metric.value)),
            ids.get(metric.name),
            initialPage,
          );
        };
        onLCP(report, { reportAllChanges: true });
        onINP(report, { reportAllChanges: true });
        onCLS(report, { reportAllChanges: true });
        onTTFB(report);
        onFCP(report);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [consent, restricted]);

  return (
    <>
      <div className="border-t border-line px-5 py-4 text-center text-xs text-muted">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="underline underline-offset-4"
        >
          {english ? "Analytics privacy preferences" : "Privacidad y preferencias de analítica"}
        </button>
      </div>
      {!restricted && (consent === null || settingsOpen) ? (
        <section
          aria-label={english ? "Optional analytics" : "Analítica opcional"}
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl border border-line bg-bg p-5 text-ink shadow-lg sm:p-6"
        >
          <h2 className="font-serif text-xl">
            {english ? "Help improve this portfolio" : "Ayúdame a mejorar este portafolio"}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            {english
              ? "With your permission, I measure page visits, interactions and performance using a random identifier stored in your browser for up to 180 days. No names, IP addresses or form contents are recorded. You can change your choice here."
              : "Con tu permiso, mido visitas, interacciones y rendimiento mediante un identificador aleatorio guardado en tu navegador hasta 180 días. No registro nombres, direcciones IP ni contenido de formularios. Puedes cambiar tu elección aquí."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="bg-ink px-4 py-3 text-xs text-bg"
            >
              {english ? "Allow analytics" : "Permitir analítica"}
            </button>
            <button
              type="button"
              onClick={() => choose("rejected")}
              className="border border-line px-4 py-3 text-xs"
            >
              {english ? "Continue without analytics" : "Continuar sin analítica"}
            </button>
          </div>
        </section>
      ) : null}
      {restricted && settingsOpen ? (
        <div
          role="status"
          className="border-t border-line bg-bg p-5 text-center text-xs text-muted"
        >
          {english
            ? "Analytics is disabled or blocked by your browser privacy preferences."
            : "La analítica está desactivada o bloqueada por las preferencias de privacidad de tu navegador."}
          <button type="button" className="ml-3 underline" onClick={() => setSettingsOpen(false)}>
            {english ? "Close" : "Cerrar"}
          </button>
        </div>
      ) : null}
    </>
  );
}
