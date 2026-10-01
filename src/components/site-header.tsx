"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/content";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/cv", label: "CV" },
  { href: "/proyectos", label: "Proyectos" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-serif text-xl tracking-tight transition-colors hover:text-accent"
        >
          {site.name}
          <span className="text-accent">.</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
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
          <a
            href={`mailto:${site.email}`}
            className="border border-ink px-4 py-2 text-ink transition-colors hover:border-accent hover:bg-accent hover:text-bg"
          >
            Contacto
          </a>
        </nav>
      </div>
    </header>
  );
}
