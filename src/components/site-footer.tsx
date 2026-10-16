import Link from "next/link";
import type { SiteSettings } from "@/lib/data";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-base text-ink">
            {settings.name}
            <span className="text-accent">.</span>{" "}
            <span className="font-sans text-sm text-muted">{settings.title}</span>
          </p>
          <p className="mt-1">
            {settings.location} · © {new Date().getFullYear()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <a href={`mailto:${settings.email}`} className="transition-colors hover:text-accent">
            Correo
          </a>
          {settings.linkedin ? (
            <a
              href={settings.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-accent"
            >
              LinkedIn
            </a>
          ) : null}
          <a
            href={settings.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            GitHub
          </a>
          <Link href="/laboratorio" className="transition-colors hover:text-accent">
            Laboratorio
          </Link>
          <Link href="/admin" className="transition-colors hover:text-accent">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
