import type { Metadata } from "next";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { Checkbox, errorText, Field, Flash, PageHeader, TextArea } from "@/components/admin/ui";
import type { projects } from "@/db/schema";
import { deleteProject, saveProject } from "@/lib/actions/content";
import { adminAllProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Proyectos",
  robots: { index: false },
};

type Project = typeof projects.$inferSelect;

function ProjectForm({ project }: { project?: Project }) {
  return (
    <form action={saveProject} className="grid gap-4 sm:grid-cols-2">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <div className="sm:col-span-2">
        <Field label="Título" name="title" defaultValue={project?.title} required />
      </div>
      <Field label="Categoría" name="category" defaultValue={project?.category} />
      <Field label="Año" name="year" defaultValue={project?.year} />
      <div className="sm:col-span-2">
        <TextArea label="Resumen" name="summary" defaultValue={project?.summary} rows={3} />
      </div>
      <div className="sm:col-span-2">
        <Field
          label="Etiquetas"
          name="tags"
          defaultValue={project?.tags.join(", ")}
          placeholder="Flotación, Recuperación Cu, Pruebas en planta"
          hint="Separadas por coma."
        />
      </div>
      <Checkbox
        label="Destacado en la portada"
        name="featured"
        defaultChecked={project?.featured}
      />
      <Field label="Orden" name="sortOrder" type="number" defaultValue={project?.sortOrder ?? 0} />
      <div className="sm:col-span-2">
        <SubmitButton>{project ? "Guardar cambios" : "Crear proyecto"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const items = adminAllProjects();

  return (
    <>
      <PageHeader
        title="Proyectos"
        description="El portafolio que se muestra en la portada y en /proyectos."
      />
      <Flash
        saved={"saved" in params}
        deleted={"deleted" in params}
        error={errorText(params.error)}
      />

      <details className="mb-8 border border-line bg-bg">
        <summary className="cursor-pointer px-5 py-3.5 text-sm font-medium select-none">
          + Añadir nuevo proyecto
        </summary>
        <div className="border-t border-line p-5">
          <ProjectForm />
        </div>
      </details>

      <div className="space-y-4">
        {items.map((project) => (
          <article key={project.id} className="border border-line bg-bg p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-lg leading-snug">{project.title}</h2>
                <p className="mt-1 text-xs tracking-wider text-accent uppercase">
                  {project.category} · {project.year}
                  {project.featured ? " · ★ destacado" : ""}
                </p>
              </div>
              <form action={deleteProject}>
                <input type="hidden" name="id" value={project.id} />
                <ConfirmButton message={`¿Eliminar “${project.title}”?`} />
              </form>
            </div>

            <p className="mt-3 text-sm text-muted">{project.summary}</p>

            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-medium tracking-wider text-muted uppercase select-none hover:text-accent">
                Editar
              </summary>
              <div className="mt-4 border-t border-line pt-4">
                <ProjectForm project={project} />
              </div>
            </details>
          </article>
        ))}
        {items.length === 0 ? (
          <p className="border border-line bg-bg p-5 text-sm text-muted">
            Aún no hay proyectos. Añade el primero arriba.
          </p>
        ) : null}
      </div>
    </>
  );
}
