import type { Metadata } from "next";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { errorText, Field, Flash, PageHeader, TextArea } from "@/components/admin/ui";
import type { experience } from "@/db/schema";
import { deleteExperience, saveExperience } from "@/lib/actions/content";
import { adminAllExperience } from "@/lib/data";

export const metadata: Metadata = {
  title: "Experiencia",
  robots: { index: false },
};

type Experience = typeof experience.$inferSelect;

function ExperienceForm({ item }: { item?: Experience }) {
  return (
    <form action={saveExperience} className="grid gap-4 sm:grid-cols-2">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <Field
        label="Período"
        name="period"
        defaultValue={item?.period}
        placeholder="2022 — Actualidad"
      />
      <Field label="Orden" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
      <Field label="Cargo" name="role" defaultValue={item?.role} required />
      <Field label="Empresa / lugar" name="company" defaultValue={item?.company} required />
      <div className="sm:col-span-2">
        <TextArea
          label="Logros"
          name="highlights"
          defaultValue={item?.highlights.join("\n")}
          rows={4}
          hint="Un logro por línea."
        />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton>{item ? "Guardar cambios" : "Crear entrada"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function AdminExperiencePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const items = await adminAllExperience();

  return (
    <>
      <PageHeader title="Experiencia" description="La línea de tiempo que se muestra en el CV." />
      <Flash
        saved={"saved" in params}
        deleted={"deleted" in params}
        error={errorText(params.error)}
      />

      <details className="mb-8 border border-line bg-bg">
        <summary className="cursor-pointer px-5 py-3.5 text-sm font-medium select-none">
          + Añadir nueva entrada
        </summary>
        <div className="border-t border-line p-5">
          <ExperienceForm />
        </div>
      </details>

      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="border border-line bg-bg p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-lg leading-snug">{item.role}</h2>
                <p className="mt-1 text-xs tracking-wider text-accent uppercase">
                  {item.company} · {item.period}
                </p>
              </div>
              <form action={deleteExperience}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmButton message={`¿Eliminar “${item.role}”?`} />
              </form>
            </div>

            <ul className="mt-3 space-y-1 text-sm text-muted">
              {item.highlights.map((highlight) => (
                <li key={highlight}>— {highlight}</li>
              ))}
            </ul>

            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-medium tracking-wider text-muted uppercase select-none hover:text-accent">
                Editar
              </summary>
              <div className="mt-4 border-t border-line pt-4">
                <ExperienceForm item={item} />
              </div>
            </details>
          </article>
        ))}
        {items.length === 0 ? (
          <p className="border border-line bg-bg p-5 text-sm text-muted">
            Aún no hay entradas de experiencia.
          </p>
        ) : null}
      </div>
    </>
  );
}
