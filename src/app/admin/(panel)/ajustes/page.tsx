import type { Metadata } from "next";
import { SubmitButton } from "@/components/admin/submit-button";
import { Checkbox, errorText, Field, Flash, PageHeader, TextArea } from "@/components/admin/ui";
import { changePassword, saveSettings } from "@/lib/actions/content";
import { adminGetSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Ajustes",
  robots: { index: false },
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const settings = await adminGetSettings();

  const passwordError =
    params.error === "password-short" || params.error === "password-wrong"
      ? params.error
      : undefined;

  return (
    <>
      <PageHeader
        title="Ajustes"
        description="Identidad, contacto y textos principales del sitio. Se aplican en el sitio público de inmediato."
      />
      <Flash
        saved={params.saved === "1"}
        error={errorText(params.error && !passwordError ? params.error : undefined)}
      />

      {settings ? (
        <form action={saveSettings} className="space-y-10">
          {/* Identidad */}
          <section className="border border-line bg-bg">
            <header className="border-b border-line px-5 py-4">
              <h2 className="font-serif text-lg">Identidad</h2>
            </header>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Nombre" name="name" defaultValue={settings.name} required />
              <Field
                label="Título profesional"
                name="title"
                defaultValue={settings.title}
                required
              />
              <div className="sm:col-span-2">
                <TextArea
                  label="Titular corto (tagline)"
                  name="tagline"
                  defaultValue={settings.tagline}
                  rows={2}
                />
              </div>
              <Field label="Ubicación" name="location" defaultValue={settings.location} />
              <Field
                label="Disponibilidad"
                name="availability"
                defaultValue={settings.availability}
              />
            </div>
          </section>

          {/* Contacto */}
          <section className="border border-line bg-bg">
            <header className="border-b border-line px-5 py-4">
              <h2 className="font-serif text-lg">Contacto</h2>
            </header>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Correo" name="email" type="email" defaultValue={settings.email} />
              <Field label="LinkedIn (URL)" name="linkedin" defaultValue={settings.linkedin} />
              <div className="sm:col-span-2">
                <Field label="GitHub (URL)" name="github" defaultValue={settings.github} />
              </div>
            </div>
          </section>

          {/* Sobre mí */}
          <section className="border border-line bg-bg">
            <header className="border-b border-line px-5 py-4">
              <h2 className="font-serif text-lg">Sobre mí</h2>
              <p className="mt-1 text-xs text-muted">
                Tres párrafos que se muestran en la portada.
              </p>
            </header>
            <div className="space-y-4 p-5">
              <Field label="Encabezado" name="aboutHeading" defaultValue={settings.aboutHeading} />
              <TextArea label="Párrafo 1" name="aboutP1" defaultValue={settings.aboutP1} rows={4} />
              <TextArea label="Párrafo 2" name="aboutP2" defaultValue={settings.aboutP2} rows={4} />
              <TextArea label="Párrafo 3" name="aboutP3" defaultValue={settings.aboutP3} rows={4} />
            </div>
          </section>

          <section className="border border-line bg-bg">
            <header className="border-b border-line px-5 py-4">
              <h2 className="font-serif text-lg">Control de publicación</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Actívalo solo después de reemplazar los datos de ejemplo y verificar que las cifras
                de experiencia y casos puedan publicarse.
              </p>
            </header>
            <div className="p-5">
              <Checkbox
                label="Confirmo que identidad, contacto, experiencia y métricas son reales o están anonimizados correctamente"
                name="contentVerified"
                defaultChecked={settings.contentVerified}
              />
            </div>
          </section>

          <SubmitButton>Guardar ajustes</SubmitButton>
        </form>
      ) : (
        <p className="border border-line bg-bg p-5 text-sm text-muted">
          No se encontró la fila de ajustes. Ejecuta{" "}
          <code className="text-accent">npm run db:reset</code> para regenerar la base de datos.
        </p>
      )}

      {/* Contraseña */}
      <section className="mt-12 border border-line bg-bg">
        <header className="border-b border-line px-5 py-4">
          <h2 className="font-serif text-lg">Cambiar contraseña</h2>
          <p className="mt-1 text-xs text-muted">
            Mínimo 8 caracteres. La sesión actual no se cierra.
          </p>
        </header>
        {passwordError ? (
          <div className="border-b border-line px-5 py-3">
            <Flash error={errorText(passwordError)} />
          </div>
        ) : null}
        {params.saved === "password" ? (
          <div className="border-b border-line px-5 py-3">
            <Flash saved />
          </div>
        ) : null}
        <form action={changePassword} className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Contraseña actual" name="current" type="password" required />
          <Field label="Nueva contraseña" name="next" type="password" required min="8" />
          <div className="sm:col-span-2">
            <SubmitButton variant="ghost">Actualizar contraseña</SubmitButton>
          </div>
        </form>
      </section>
    </>
  );
}
