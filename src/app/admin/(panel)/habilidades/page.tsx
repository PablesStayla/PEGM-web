import type { Metadata } from "next";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { errorText, Field, Flash, PageHeader } from "@/components/admin/ui";
import { deleteSkill, saveSkill } from "@/lib/actions/content";
import { adminAllSkills } from "@/lib/data";

export const metadata: Metadata = {
  title: "Habilidades",
  robots: { index: false },
};

export default async function AdminSkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const items = await adminAllSkills();
  const software = items.filter((item) => item.kind === "software");
  const areas = items.filter((item) => item.kind === "area");

  return (
    <>
      <PageHeader
        title="Habilidades"
        description="Software/herramientas y áreas técnicas que se muestran en el CV."
      />
      <Flash
        saved={"saved" in params}
        deleted={"deleted" in params}
        error={errorText(params.error)}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        {(
          [
            {
              kind: "software",
              title: "Software y herramientas",
              description: "Python, HSC Chemistry, Power BI…",
              items: software,
            },
            {
              kind: "area",
              title: "Áreas técnicas",
              description: "Flotación, lixiviación SX-EW…",
              items: areas,
            },
          ] as const
        ).map((group) => (
          <section key={group.kind} className="border border-line bg-bg">
            <header className="border-b border-line px-5 py-4">
              <h2 className="font-serif text-lg">{group.title}</h2>
              <p className="mt-1 text-xs text-muted">{group.description}</p>
            </header>

            <form
              action={saveSkill}
              className="flex flex-wrap items-end gap-3 border-b border-line px-5 py-4"
            >
              <input type="hidden" name="kind" value={group.kind} />
              <div className="min-w-48 flex-1">
                <Field label="Nombre" name="name" required />
              </div>
              <SubmitButton variant="ghost">+ Añadir</SubmitButton>
            </form>

            <ul className="divide-y divide-line">
              {group.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <form action={saveSkill} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="kind" value={item.kind} />
                      <input type="hidden" name="name" value={item.name} />
                      <input
                        type="number"
                        name="sortOrder"
                        defaultValue={item.sortOrder}
                        aria-label="Orden"
                        className="w-16 border border-line bg-bg px-2 py-1 text-xs"
                      />
                      <button
                        type="submit"
                        className="border border-line px-2 py-1 text-xs text-muted hover:border-accent hover:text-accent"
                      >
                        Guardar
                      </button>
                    </form>
                    <form action={deleteSkill}>
                      <input type="hidden" name="id" value={item.id} />
                      <ConfirmButton message={`¿Eliminar “${item.name}”?`} />
                    </form>
                  </div>
                </li>
              ))}
              {group.items.length === 0 ? (
                <li className="px-5 py-4 text-sm text-muted">Sin elementos.</li>
              ) : null}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
