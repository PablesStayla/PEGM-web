import type { Metadata } from "next";
import {
  Field,
  Flash,
  PageHeader,
  errorText,
} from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";
import { ConfirmButton } from "@/components/admin/confirm-button";
import {
  deleteCertification,
  deleteEducation,
  deleteLanguage,
  saveCertification,
  saveEducation,
  saveLanguage,
} from "@/lib/actions/content";
import {
  adminAllCertifications,
  adminAllEducation,
  adminAllLanguages,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Formación",
  robots: { index: false },
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line bg-bg">
      <header className="border-b border-line px-5 py-4">
        <h2 className="font-serif text-lg">{title}</h2>
        <p className="mt-1 text-xs text-muted">{description}</p>
      </header>
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}

function Row({
  title,
  subtitle,
  children,
  form,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  form: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{title}</p>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium tracking-wider text-muted uppercase select-none hover:text-accent">
          Editar
        </summary>
        <div className="mt-3 border-t border-line pt-3">{form}</div>
      </details>
    </div>
  );
}

export default async function AdminEducationPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [education, certifications, languages] = [
    adminAllEducation(),
    adminAllCertifications(),
    adminAllLanguages(),
  ];

  return (
    <>
      <PageHeader
        title="Formación"
        description="Educación, certificaciones e idiomas del CV."
      />
      <Flash
        saved={"saved" in params}
        deleted={"deleted" in params}
        error={errorText(params.error)}
      />

      <div className="space-y-10">
        {/* Educación */}
        <Section
          title="Educación"
          description="Títulos, diplomados y programas académicos."
        >
          <details className="px-5 py-4">
            <summary className="cursor-pointer text-sm font-medium select-none">
              + Añadir educación
            </summary>
            <form action={saveEducation} className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Período" name="period" placeholder="2012 — 2017" />
              <Field label="Orden" name="sortOrder" type="number" defaultValue={0} />
              <div className="sm:col-span-2">
                <Field label="Título" name="degree" required />
              </div>
              <Field label="Institución" name="school" />
              <Field label="Nota (opcional)" name="note" />
              <div className="sm:col-span-2">
                <SubmitButton>Crear entrada</SubmitButton>
              </div>
            </form>
          </details>

          {education.map((item) => (
            <Row
              key={item.id}
              title={item.degree}
              subtitle={`${item.school} · ${item.period}${item.note ? ` · ${item.note}` : ""}`}
              form={
                <form action={saveEducation} className="grid gap-4 sm:grid-cols-2">
                  <input type="hidden" name="id" value={item.id} />
                  <Field label="Período" name="period" defaultValue={item.period} />
                  <Field label="Orden" name="sortOrder" type="number" defaultValue={item.sortOrder} />
                  <div className="sm:col-span-2">
                    <Field label="Título" name="degree" defaultValue={item.degree} required />
                  </div>
                  <Field label="Institución" name="school" defaultValue={item.school} />
                  <Field label="Nota (opcional)" name="note" defaultValue={item.note} />
                  <div className="sm:col-span-2">
                    <SubmitButton>Guardar cambios</SubmitButton>
                  </div>
                </form>
              }
            >
              <form action={deleteEducation}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmButton message={`¿Eliminar “${item.degree}”?`} />
              </form>
            </Row>
          ))}
        </Section>

        {/* Certificaciones */}
        <Section
          title="Certificaciones y cursos"
          description="Listado simple de certificados."
        >
          <details className="px-5 py-4">
            <summary className="cursor-pointer text-sm font-medium select-none">
              + Añadir certificación
            </summary>
            <form action={saveCertification} className="mt-4 flex flex-wrap items-end gap-3">
              <div className="min-w-64 flex-1">
                <Field label="Nombre" name="name" required />
              </div>
              <Field label="Orden" name="sortOrder" type="number" defaultValue={0} />
              <SubmitButton>Crear</SubmitButton>
            </form>
          </details>

          {certifications.map((item) => (
            <Row
              key={item.id}
              title={item.name}
              form={
                <form action={saveCertification} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="id" value={item.id} />
                  <div className="min-w-64 flex-1">
                    <Field label="Nombre" name="name" defaultValue={item.name} required />
                  </div>
                  <Field label="Orden" name="sortOrder" type="number" defaultValue={item.sortOrder} />
                  <SubmitButton>Guardar</SubmitButton>
                </form>
              }
            >
              <form action={deleteCertification}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmButton message={`¿Eliminar “${item.name}”?`} />
              </form>
            </Row>
          ))}
        </Section>

        {/* Idiomas */}
        <Section title="Idiomas" description="Idiomas con su nivel.">
          <details className="px-5 py-4">
            <summary className="cursor-pointer text-sm font-medium select-none">
              + Añadir idioma
            </summary>
            <form action={saveLanguage} className="mt-4 flex flex-wrap items-end gap-3">
              <div className="min-w-48 flex-1">
                <Field label="Idioma" name="name" required />
              </div>
              <div className="min-w-48 flex-1">
                <Field label="Nivel" name="level" placeholder="Avanzado (C1)" />
              </div>
              <SubmitButton>Crear</SubmitButton>
            </form>
          </details>

          {languages.map((item) => (
            <Row
              key={item.id}
              title={item.name}
              subtitle={item.level}
              form={
                <form action={saveLanguage} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="id" value={item.id} />
                  <div className="min-w-48 flex-1">
                    <Field label="Idioma" name="name" defaultValue={item.name} required />
                  </div>
                  <div className="min-w-48 flex-1">
                    <Field label="Nivel" name="level" defaultValue={item.level} />
                  </div>
                  <SubmitButton>Guardar</SubmitButton>
                </form>
              }
            >
              <form action={deleteLanguage}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmButton message={`¿Eliminar “${item.name}”?`} />
              </form>
            </Row>
          ))}
        </Section>
      </div>
    </>
  );
}
