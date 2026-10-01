import Link from "next/link";
import { site } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-base text-ink">
            {site.name}
            <span className="text-accent">.</span>{" "}
            <span className="font-sans text-sm text-muted">
              {site.title}
            </span>
          </p>
          <p className="mt-1">{site.location} · © {new Date().getFullYear()}</p>
        </div>

        <div className="flex items-center gap-5">
          <a
            href={`mailto:${site.email}`}
            className="transition-colors hover:text-accent"
          >
            Correo
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            LinkedIn
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            GitHub
          </a>
          <Link
            href="/proyectos"
            className="transition-colors hover:text-accent"
          >
            Proyectos
          </Link>
        </div>
      </div>
    </footer>
  );
}
