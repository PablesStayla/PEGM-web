import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { adminAuditLog } from "@/lib/data";

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

export default async function AdminAuditPage() {
  const entries = await adminAuditLog(200);

  return (
    <>
      <PageHeader
        title="Auditoría"
        description="Registro de todas las acciones realizadas en el panel."
      />

      <div className="overflow-x-auto border border-line bg-bg">
        {entries.length === 0 ? (
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
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {formatDate(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3">{entry.userEmail}</td>
                  <td className="px-4 py-3">{entry.action}</td>
                  <td className="px-4 py-3 text-accent">{entry.entity}</td>
                  <td className="px-4 py-3 text-muted">{entry.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
