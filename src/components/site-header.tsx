"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { openCommandPalette } from "@/components/command-palette";
import { Icon, icons } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/cv", label: "CV" },
  { href: "/proyectos", label: "Casos" },
  { href: "/laboratorio", label: "Laboratorio" },
];

export function SiteHeader({ name }: { name: string }) {
  const pathname = usePathname();
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-6 lg:px-10">
        <Link href="/" className="group flex items-center gap-3" aria-label={`${name}, inicio`}>
          <span className="flex size-9 items-center justify-center bg-ink font-serif text-sm text-bg transition-all duration-300 group-hover:rotate-6 group-hover:bg-accent">
            {initials}
          </span>
          <span className="hidden font-serif text-lg tracking-tight sm:block">
            {name}
            <span className="text-accent">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden items-center gap-1 text-xs lg:flex">
            {links.map((link, index) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative px-3 py-2 tracking-wide transition-colors hover:text-accent ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  <span className="mr-1.5 font-serif text-[9px] opacity-55">0{index + 1}</span>
                  {link.label}
                  <span
                    className={`absolute inset-x-3 bottom-0 h-px origin-left bg-accent transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <span className="mx-1 hidden h-5 w-px bg-line sm:block" aria-hidden />

          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Buscar en el sitio (Ctrl+K)"
            className="flex h-9 items-center gap-2 border border-line bg-bg/50 px-2.5 text-muted transition-all hover:border-accent hover:text-accent"
          >
            <Icon path={icons.search} />
            <kbd className="hidden text-[9px] sm:block">⌘K</kbd>
          </button>

          <ThemeToggle />

          <a
            href="/#contacto"
            className="group hidden h-9 items-center gap-2 bg-ink px-4 text-xs font-medium text-bg transition-colors hover:bg-accent md:flex"
          >
            Conversemos
            <span className="transition-transform group-hover:translate-x-0.5">↗</span>
          </a>

          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Abrir menú"
            className="flex size-9 items-center justify-center border border-line text-muted transition-colors hover:border-accent hover:text-accent lg:hidden"
          >
            <Icon path={icons.menu} />
          </button>
        </div>
      </div>
    </header>
  );
}
