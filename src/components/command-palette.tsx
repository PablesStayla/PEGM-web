"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, icons } from "@/components/icons";

export type PaletteItem = {
  group: string;
  label: string;
  href: string;
};

const OPEN_EVENT = "pk:palette:open";

/** Permite abrir la paleta desde cualquier botón (ej: el header). */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CommandPalette({ items }: { items: PaletteItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  if (!open) return null;

  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Fondo: botón a pantalla completa para cerrar (accesible con teclado) */}
      <button
        type="button"
        aria-label="Cerrar buscador"
        className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative flex items-start justify-center px-4 pt-[12vh]">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buscador del sitio"
          className="w-full max-w-lg border border-line bg-bg shadow-xl"
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((i) => Math.min(i + 1, results.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            }
            if (event.key === "Enter" && results[active]) {
              event.preventDefault();
              go(results[active].href);
            }
          }}
        >
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Icon path={icons.search} className="size-4 shrink-0 text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar en el sitio…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
            <kbd className="hidden border border-line px-1.5 py-0.5 text-[10px] text-muted sm:block">
              ESC
            </kbd>
          </div>

          <ul className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted">
                Sin resultados para “{query}”.
              </li>
            ) : (
              results.map((item, index) => {
                const showGroup = item.group !== lastGroup;
                lastGroup = item.group;
                return (
                  <li key={`${item.href}-${item.label}`}>
                    {showGroup ? (
                      <p className="px-3 pt-3 pb-1 text-[10px] font-medium tracking-[0.18em] text-muted uppercase">
                        {item.group}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(item.href)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                        index === active ? "bg-surface text-ink" : "text-muted"
                      }`}
                    >
                      <span>{item.label}</span>
                      {index === active ? (
                        <Icon path={icons.arrowRight} className="size-3.5 text-accent" />
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
