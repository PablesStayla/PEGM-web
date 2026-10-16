import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { adminAuditLog, adminDistinctAuditActions } from "@/lib/data";

export const metadata: Metadata = {
  title: "Auditoría",
  robots: { index: false },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>;
}) {
  const params = await searchParams;
  const action = typeof params.action === "string" ? params.action : "";
  const requestedPage = Number(params.page ?? "1") || 1;

  const [{ rows, total, page, pageCount }, actions] = await Promise.all([
    adminAuditLog({ page: requestedPage, action }),
    adminDistinctAuditActions(),
  ]);

  function buildHref(next: { page?: number; action?: string }) {
    const query = new URLSearchParams();
    const nextAction = next.action ?? action;
    const nextPage = next.page ?? 1;
    if (nextAction) query.set("action", nextAction);
    if (nextPage > 1) query.set("page", String(nextPage));
    const suffix = query.toString();
    return suffix ? `/admin/auditoria?${suffix}` : "/admin/auditoria";
  }

  const chip = (active: boolean) =>
    `border px-3 py-1 text-xs ${
      active ? "border-accent text-accent" : "border-line text-muted hover:text-accent"
    }`;

  return (
    <>
      <PageHeader
        title="Auditoría"
        description={`Registro de todas las acciones realizadas en el panel (${total} entradas).`}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={buildHref({ action: "" })} className={chip(action === "")}>
          Todas
        </Link>
        {actions.map((item) => (
          <Link key={item} href={buildHref({ action: item })} className={chip(item === action)}>
            {item}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto border border-line bg-bg">
        {rows.length === 0 ? (
          <p className="p-5 text-sm text-muted">Sin registros.</p>
        ) : (
          <table className="w-full min-w-160 text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wider text-muted uppercase">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Acción</th>
                <th className="px-4 py-3 font-medium">Entidad</th>
                <th className="px-4 py-3 font-medium">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {formatDate(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3">{entry.userEmail}</td>
                  <td className="px-4 py-3">{entry.action}</td>
                  <td className="px-4 py-3 text-accent">{entry.entity}</td>
                  <td className="px-4 py-3 text-muted" title={entry.event}>
                    {entry.detail || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pageCount > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <Link
            href={buildHref({ page: page - 1 })}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-40" : "hover:text-accent"}
          >
            ← Anterior
          </Link>
          <span>
            Página {page} de {pageCount}
          </span>
          <Link
            href={buildHref({ page: page + 1 })}
            aria-disabled={page >= pageCount}
            className={page >= pageCount ? "pointer-events-none opacity-40" : "hover:text-accent"}
          >
            Siguiente →
          </Link>
        </div>
      ) : null}
    </>
  );
}
