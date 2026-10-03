"use client";

import Link from "next/link";
import { type PointerEvent as ReactPointerEvent, useEffect, useRef } from "react";
import { Icon, icons } from "@/components/icons";

type ExperimentalHeroProps = {
  name: string;
  title: string;
  tagline: string;
  location: string;
  availability: string;
  stats: { value: string; label: string }[];
};

export function ExperimentalHero({
  name,
  title,
  tagline,
  location,
  availability,
  stats,
}: ExperimentalHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts.shift() ?? name;
  const lastName = nameParts.join(" ");
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((part) => part[0])
    .join("");

  useEffect(() => {
    let frame = 0;
    const updateScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;
        const progress = Math.min(
          1,
          Math.max(0, -section.getBoundingClientRect().top / innerHeight),
        );
        section.style.setProperty("--hero-scroll", String(progress));
      });
    };
    updateScroll();
    addEventListener("scroll", updateScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", updateScroll);
    };
  }, []);

  function moveSpotlight(event: ReactPointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    event.currentTarget.style.setProperty("--pointer-x", `${x}%`);
    event.currentTarget.style.setProperty("--pointer-y", `${y}%`);
  }

  return (
    <section
      ref={sectionRef}
      onPointerMove={moveSpotlight}
      className="experimental-hero relative isolate min-h-[calc(100svh-4rem)] overflow-hidden border-b border-line"
    >
      <div className="hero-grid absolute inset-0 -z-30" aria-hidden />
      <div className="hero-spotlight absolute inset-0 -z-20" aria-hidden />
      <div className="hero-orbit hero-orbit-one" aria-hidden />
      <div className="hero-orbit hero-orbit-two" aria-hidden />
      <div className="hero-grain absolute inset-0 -z-10" aria-hidden />

      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-12 px-6 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-16">
        <div className="relative z-10 pt-5 lg:pt-0">
          <div className="hero-eyebrow flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[0.24em] text-accent uppercase sm:text-xs">
            <span className="inline-flex items-center gap-2">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              Ingeniería en operación
            </span>
            <span className="h-px w-8 bg-line" aria-hidden />
            <span className="text-muted">{location}</span>
          </div>

          <h1 className="hero-title mt-7 font-serif leading-[0.82] tracking-[-0.065em] text-balance">
            <span className="hero-title-line block text-[clamp(4.4rem,12vw,10.5rem)]">
              {firstName}
            </span>
            {lastName ? (
              <span className="hero-title-line hero-title-outline block pl-[0.12em] text-[clamp(4.4rem,12vw,10.5rem)] text-accent lg:pl-[0.35em]">
                {lastName}
                <span className="text-ink">.</span>
              </span>
            ) : null}
          </h1>

          <div className="mt-8 grid max-w-2xl gap-6 border-l border-accent pl-5 sm:grid-cols-[0.8fr_1.2fr] sm:pl-7">
            <p className="font-serif text-xl leading-tight italic text-ink sm:text-2xl">{title}</p>
            <p className="text-sm leading-relaxed text-muted sm:text-base">{tagline}</p>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/proyectos" className="kinetic-button kinetic-button-primary group">
              Ver casos
              <Icon
                path={icons.arrowRight}
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link href="/laboratorio" className="kinetic-button kinetic-button-ghost">
              <Icon path={icons.flask} className="size-4" />
              Laboratorio vivo
            </Link>
          </div>

          <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-40" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {availability}
          </p>
        </div>

        <div className="portrait-stage relative mx-auto w-full max-w-[35rem] lg:mx-0 lg:justify-self-end">
          <div className="portrait-backdrop" aria-hidden />
          <div className="portrait-coordinate portrait-coordinate-top" aria-hidden>
            36°49&apos; S · 73°03&apos; W
          </div>
          <div className="portrait-card">
            {/* Este bloque está preparado para reemplazarse por una foto real sin alterar el layout. */}
            <div
              className="portrait-placeholder"
              role="img"
              aria-label={`Composición editorial con las iniciales de ${name}`}
            >
              <span className="portrait-number" aria-hidden>
                01
              </span>
              <div className="portrait-silhouette" aria-hidden>
                <span className="portrait-head" />
                <span className="portrait-body" />
              </div>
              <span className="portrait-initials" aria-hidden>
                {initials}
              </span>
              <div className="portrait-scanline" aria-hidden />
            </div>
            <div className="portrait-caption">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-muted uppercase">Perfil</p>
                <p className="mt-1 font-serif text-lg">{name}</p>
              </div>
              <p className="max-w-36 text-right text-[10px] leading-relaxed tracking-wider text-muted uppercase">
                Procesos · Datos · Operación
              </p>
            </div>
          </div>

          {stats.slice(0, 3).map((stat, index) => (
            <div key={stat.label} className={`floating-stat floating-stat-${index + 1}`}>
              <p className="font-serif text-2xl text-accent sm:text-3xl">{stat.value}</p>
              <p className="mt-1 max-w-24 text-[9px] leading-tight tracking-[0.13em] text-muted uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="process-rail border-t border-line/80" aria-hidden>
        <div className="mx-auto flex max-w-7xl items-center px-6 lg:px-10">
          {[
            ["01", "Mineral"],
            ["02", "Proceso"],
            ["03", "Datos"],
            ["04", "Decisión"],
            ["05", "Impacto"],
          ].map(([number, label], index) => (
            <div key={number} className="process-node flex min-w-0 flex-1 items-center">
              <span className="shrink-0 font-serif text-xs text-accent">{number}</span>
              <span className="ml-2 truncate text-[9px] tracking-[0.16em] text-muted uppercase sm:text-[10px]">
                {label}
              </span>
              {index < 4 ? <span className="process-line mx-3 h-px flex-1 bg-line" /> : null}
            </div>
          ))}
        </div>
      </div>

      <a
        href="#sobre-mi"
        aria-label="Bajar a la siguiente sección"
        className="hero-scroll-cue absolute right-6 bottom-16 hidden items-center gap-3 text-[9px] tracking-[0.18em] text-muted uppercase transition-colors hover:text-accent lg:flex"
      >
        Descubrir
        <span className="flex h-10 w-px overflow-hidden bg-line">
          <span className="scroll-drop h-1/2 w-px bg-accent" />
        </span>
      </a>
    </section>
  );
}
