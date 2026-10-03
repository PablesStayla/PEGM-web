import type { Metadata } from "next";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { SubmitButton } from "@/components/admin/submit-button";
import {
  Checkbox,
  errorText,
  Field,
  Flash,
  PageHeader,
  Select,
  TextArea,
} from "@/components/admin/ui";
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
      <div className="sm:col-span-2">
        <Field
          label="Slug"
          name="slug"
          defaultValue={project?.slug ?? undefined}
          placeholder="Se genera desde el título si se deja vacío"
          hint="Forma la URL del caso: /proyectos/slug-del-proyecto."
        />
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

      <div className="mt-3 border-t border-line pt-5 sm:col-span-2">
        <h3 className="font-serif text-lg">Caso de estudio</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Publica una página editorial con contexto, método y resultados. Una línea equivale a un
          elemento en las listas.
        </p>
      </div>
      <Field
        label="Duración"
        name="duration"
        defaultValue={project?.duration}
        placeholder="12 semanas"
      />
      <Select
        label="Visual técnico"
        name="visualStyle"
        defaultValue={project?.visualStyle ?? "process"}
        options={[
          { value: "flotation", label: "Circuito de flotación" },
          { value: "prediction", label: "Serie predictiva" },
          { value: "hydrometallurgy", label: "Circuito SX-EW" },
          { value: "feasibility", label: "Etapas de prefactibilidad" },
          { value: "energy", label: "Curva de energía" },
          { value: "dashboard", label: "Dashboard metalúrgico" },
          { value: "process", label: "Proceso genérico" },
        ]}
      />
      <div className="flex items-end pb-2 sm:col-span-2">
        <Checkbox
          label="Publicar como caso de estudio"
          name="caseStudy"
          defaultChecked={project?.caseStudy}
        />
      </div>
      <div className="sm:col-span-2">
        <TextArea label="Contexto" name="context" defaultValue={project?.context} rows={4} />
      </div>
      <div className="sm:col-span-2">
        <TextArea label="Desafío" name="challenge" defaultValue={project?.challenge} rows={4} />
      </div>
      <div className="sm:col-span-2">
        <TextArea
          label="Enfoque"
          name="approach"
          defaultValue={project?.approach.join("\n")}
          rows={7}
          hint="Un paso por línea."
        />
      </div>
      <div className="sm:col-span-2">
        <TextArea
          label="Métricas"
          name="metrics"
          defaultValue={project?.metrics
            .map((metric) => `${metric.value} | ${metric.label}`)
            .join("\n")}
          rows={4}
          placeholder={"+2,1 pp | recuperación de cobre\n−18 % | variabilidad"}
          hint="Una por línea, con el formato valor | descripción."
        />
      </div>
      <div className="sm:col-span-2">
        <TextArea
          label="Resultados"
          name="results"
          defaultValue={project?.results.join("\n")}
          rows={6}
          hint="Un resultado por línea."
        />
      </div>
      <div className="sm:col-span-2">
        <TextArea
          label="Cierre / aprendizaje"
          name="closing"
          defaultValue={project?.closing}
          rows={4}
        />
      </div>

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
  const items = await adminAllProjects();

  return (
    <>
      <PageHeader
        title="Proyectos y casos"
        description="Administra las fichas del portafolio y publica casos de estudio con contexto, método y resultados."
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
                  {project.caseStudy ? " · caso publicado" : ""}
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
