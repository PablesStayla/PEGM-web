"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { openCommandPalette } from "@/components/command-palette";
import { Icon, icons } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { en } from "@/lib/i18n/en";
import { es } from "@/lib/i18n/es";

export function SiteHeader({ name }: { name: string }) {
  const pathname = usePathname();
  const english = pathname === "/en";
  const dict = english ? en : es;
  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/cv", label: dict.nav.cv },
    { href: "/proyectos", label: dict.nav.projects },
    { href: "/laboratorio", label: dict.nav.laboratory },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-3 px-5 md:px-12">
        <Link
          href={english ? "/en" : "/"}
          className="font-serif text-xl tracking-tight transition-colors hover:text-accent"
        >
          {name}
          <span className="text-accent">.</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {links.map((link) => {
              const href = english && link.href === "/" ? "/en" : link.href;
              const active = link.href === "/" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={link.href}
                  href={href}
                  className={`transition-colors hover:text-accent ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href={english ? "/" : "/en"}
            hrefLang={english ? "es" : "en"}
            aria-label={english ? "Cambiar a español" : "Switch to English"}
            className="text-xs text-muted hover:text-accent"
          >
            {english ? "ES" : "EN"}
          </Link>

          <button
            type="button"
            onClick={openCommandPalette}
            aria-label={dict.nav.search}
            className="flex h-9 items-center gap-2 border border-line px-2.5 text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <Icon path={icons.search} />
            <kbd className="hidden text-[10px] sm:block">⌘K</kbd>
          </button>

          <ThemeToggle />

          <a
            href={english ? "/en#contacto" : "/#contacto"}
            className="hidden border border-ink px-4 py-2 text-sm text-ink transition-colors hover:border-accent hover:bg-accent hover:text-bg md:inline-block"
          >
            {dict.nav.contact}
          </a>

          {/* En móvil, el menú es la paleta de comandos */}
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Abrir menú"
            className="flex size-9 items-center justify-center border border-line text-muted transition-colors hover:border-accent hover:text-accent md:hidden"
          >
            <Icon path={icons.menu} />
          </button>
        </div>
      </div>
    </header>
  );
}
