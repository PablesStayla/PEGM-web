import type { Metadata } from "next";
import Link from "next/link";
import { Icon, icons } from "@/components/icons";
import {
  adminAuditLog,
  adminDashboardStats,
  adminGetSettings,
  adminRecentMessages,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminDashboardPage() {
  const [stats, messages, audit, settings] = await Promise.all([
    adminDashboardStats(),
    adminRecentMessages(5),
    adminAuditLog(8),
    adminGetSettings(),
  ]);

  const readinessIssues = [
    !settings?.contentVerified
      ? "Verifica en Ajustes que identidad, experiencia y métricas sean publicables."
      : null,
    settings?.email.includes("ejemplo") ? "Reemplaza el correo de ejemplo." : null,
    settings?.linkedin.includes("ejemplo") ? "Reemplaza el perfil de LinkedIn de ejemplo." : null,
    !process.env.TURSO_DATABASE_URL?.startsWith("libsql://")
      ? "Configura Turso antes de desplegar para asegurar persistencia y rate limiting distribuido."
      : null,
    !process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? "Define NEXT_PUBLIC_SITE_URL con el dominio público."
      : null,
  ].filter((issue): issue is string => Boolean(issue));

  const cards = [
    { label: "Proyectos", value: stats.projects, href: "/admin/proyectos" },
    {
      label: "Experiencia",
      value: stats.experience,
      href: "/admin/experiencia",
    },
    {
      label: "Mensajes",
      value: stats.messages,
      href: "/admin/mensajes",
      note: stats.unreadMessages > 0 ? `${stats.unreadMessages} sin leer` : undefined,
    },
    {
      label: "Certificaciones",
      value: stats.certifications,
      href: "/admin/educacion",
    },
    { label: "Habilidades", value: stats.skills, href: "/admin/habilidades" },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="font-serif text-3xl tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-muted">Resumen del contenido y actividad del sitio.</p>
      </div>

      <section
        aria-labelledby="estado-publicacion"
        className={`mb-8 border p-5 ${
          readinessIssues.length === 0
            ? "border-emerald-700/30 bg-emerald-700/5"
            : "border-accent/30 bg-accent/5"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
              Estado de publicación
            </p>
            <h2 id="estado-publicacion" className="mt-1 font-serif text-xl">
              {readinessIssues.length === 0 ? "Listo para producción" : "Revisión pendiente"}
            </h2>
          </div>
          <span className="font-serif text-2xl text-accent">
            {readinessIssues.length === 0 ? "✓" : readinessIssues.length}
          </span>
        </div>
        {readinessIssues.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {readinessIssues.map((issue) => (
              <li key={issue} className="flex gap-2">
                <span className="text-accent" aria-hidden>
                  —
                </span>
                {issue}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Contenido verificado, base remota y dominio público configurados.
          </p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="border border-line bg-bg p-5 transition-colors hover:border-accent"
          >
            <p className="text-xs tracking-wider text-muted uppercase">{card.label}</p>
            <p className="mt-2 font-serif text-4xl text-accent">{card.value}</p>
            {card.note ? <p className="mt-1 text-xs text-muted">{card.note}</p> : null}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Últimos mensajes */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-xl">
              <Icon path={icons.inbox} className="size-4 text-accent" />
              Últimos mensajes
            </h2>
            <Link href="/admin/mensajes" className="text-xs text-muted hover:text-accent">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="border border-line bg-bg p-5 text-sm text-muted">
                Todavía no hay mensajes.
              </p>
            ) : (
              messages.map((message) => (
                <article
                  key={message.id}
                  className={`border bg-bg p-4 ${
                    message.read ? "border-line" : "border-accent/50"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium">
                      {message.name}
                      {!message.read ? (
                        <span className="ml-2 bg-accent/10 px-1.5 py-0.5 text-[10px] tracking-wider text-accent uppercase">
                          nuevo
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted">{formatDate(message.createdAt)}</p>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{message.body}</p>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Actividad reciente */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-xl">
              <Icon path={icons.history} className="size-4 text-accent" />
              Actividad reciente
            </h2>
            <Link href="/admin/auditoria" className="text-xs text-muted hover:text-accent">
              Ver auditoría →
            </Link>
          </div>
          <div className="border border-line bg-bg">
            {audit.length === 0 ? (
              <p className="p-5 text-sm text-muted">Sin actividad registrada.</p>
            ) : (
              <ul className="divide-y divide-line">
                {audit.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-baseline justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <p>
                      <span className="text-muted">{entry.userEmail}</span> {entry.action}{" "}
                      <span className="text-accent">{entry.entity}</span>
                      {entry.detail ? <span className="text-muted"> · {entry.detail}</span> : null}
                    </p>
                    <p className="shrink-0 text-xs text-muted">{formatDate(entry.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
