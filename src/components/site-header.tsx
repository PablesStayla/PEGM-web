"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, icons } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { openCommandPalette } from "@/components/command-palette";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/cv", label: "CV" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/laboratorio", label: "Laboratorio" },
];

export function SiteHeader({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-6">
        <Link
          href="/"
          className="font-serif text-xl tracking-tight transition-colors hover:text-accent"
        >
          {name}
          <span className="text-accent">.</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-accent ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Buscar en el sitio (Ctrl+K)"
            className="flex h-9 items-center gap-2 border border-line px-2.5 text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <Icon path={icons.search} />
            <kbd className="hidden text-[10px] sm:block">⌘K</kbd>
          </button>

          <ThemeToggle />

          <a
            href="#contacto"
            className="hidden border border-ink px-4 py-2 text-sm text-ink transition-colors hover:border-accent hover:bg-accent hover:text-bg md:inline-block"
          >
            Contacto
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
